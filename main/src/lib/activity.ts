/**
 * Activity tracking — writes to and reads from public.activity_logs in the
 * central Supabase database. RLS scopes reads to the caller's own rows unless
 * the caller is the admin (see supabase/schema.sql).
 */

import { supabase, isMissingSchemaError } from './supabase'
import type { FormatResult, OutputFormat } from './pipeline'
import { PROVIDERS, type ProviderId } from './providers'

export type ActivityAction = 'signup' | 'login' | 'logout' | 'generate' | 'regenerate'
export type InputType = 'file' | 'url' | 'text'
export type ActivityStatus = 'success' | 'partial' | 'error'

export interface ActivityLog {
  id: string
  user_id: string
  action: ActivityAction
  input_type: InputType | null
  source_name: string | null
  input_preview: string | null
  input_chars: number | null
  /** Exact source word count. Null on rows logged before supabase/schema.sql section 10. */
  input_words?: number | null
  formats: string[]
  tone: string | null
  target_language: string | null
  custom_schema: string | null
  refinement: string | null
  outputs: Record<string, string> | null
  /** { "<format>": "<model id>" } — which model wrote each draft. Same availability as input_words. */
  models?: Record<string, string> | null
  status: ActivityStatus | null
  success_count: number | null
  error_count: number | null
  duration_ms: number | null
  error_message: string | null
  created_at: string
  profiles?: { email: string } | null
}

export type NewActivity = Partial<Omit<ActivityLog, 'id' | 'user_id' | 'created_at' | 'profiles'>> & {
  action: ActivityAction
}

export interface AdminUserRow {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
  last_sign_in_at: string | null
  generation_count: number
  last_activity_at: string | null
}

export class SchemaMissingError extends Error {
  constructor() {
    super('Activity tables are missing. Run supabase/schema.sql in the Supabase SQL editor.')
  }
}

const PREVIEW_CHARS = 300
export const PAGE_SIZE = 50

/* ─── Write ─────────────────────────────────────────────────────────────── */

/** False once an insert shows the input_words/models columns are missing (schema.sql section 10 not run). */
let metaColumns = true

/**
 * Records one action for the signed-in user. Never throws — tracking must not
 * break the feature being tracked. user_id is filled by the column default
 * (auth.uid()) and checked by RLS.
 */
export async function logActivity(entry: NewActivity): Promise<void> {
  try {
    const hasMeta = 'input_words' in entry || 'models' in entry
    let error = null as { code?: string; message: string } | null
    if (metaColumns || !hasMeta) ({ error } = await supabase.from('activity_logs').insert(entry))
    // Databases without section 10 of schema.sql lack these columns. Keep the values anyway,
    // tucked into the outputs JSON under META_KEY; readRow() moves them back out.
    if (hasMeta && (!metaColumns || error?.code === 'PGRST204')) {
      metaColumns = false // Skip the doomed first insert for the rest of the session.
      const { input_words, models, ...legacy } = entry
      const meta: StoredMeta = { models: models ?? null, input_words: input_words ?? null }
      ;({ error } = await supabase.from('activity_logs').insert({ ...legacy, outputs: { ...(legacy.outputs ?? {}), [META_KEY]: JSON.stringify(meta) } }))
    }
    if (error) console.warn('[activity] failed to log', entry.action, error.message)
  } catch (err) {
    console.warn('[activity] failed to log', entry.action, err)
  }
}

export function countWords(text: string) {
  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}

export function summariseResults(results: Partial<Record<OutputFormat, FormatResult>>) {
  const list = Object.values(results).filter((r): r is FormatResult => !!r)
  const successCount = list.filter((r) => r.status === 'success').length
  const errorCount = list.length - successCount
  const outputs: Record<string, string> = {}
  const models: Record<string, string> = {}
  for (const r of list) {
    if (r.status === 'success') outputs[r.format] = r.output
    const stored = storedModel(r)
    if (stored) models[r.format] = stored
  }
  const status: ActivityStatus =
    errorCount === 0 ? 'success' : successCount === 0 ? 'error' : 'partial'
  const errorMessage = list.find((r) => r.status === 'error')?.error ?? null
  return { successCount, errorCount, outputs, models, status, errorMessage }
}

/** "provider:model" for the models column; rows from before BYOK hold a bare Groq model id. */
export function storedModel(r: Pick<FormatResult, 'model' | 'provider'>): string | null {
  if (!r.model) return null
  return r.provider ? `${r.provider}:${r.model}` : r.model
}

export function previewOf(content: string) {
  return { input_preview: content.slice(0, PREVIEW_CHARS), input_chars: content.length, input_words: countWords(content) }
}

/* ─── Read ──────────────────────────────────────────────────────────────── */

/** Key in `outputs` holding models and word count when the database has no columns for them. Never a format name. */
const META_KEY = '__sankshep_meta'

interface StoredMeta {
  models: Record<string, string> | null
  input_words: number | null
}

/** Moves models/word count stored inside `outputs` (see logActivity) back to their own fields. */
function readRow(row: ActivityLog): ActivityLog {
  const raw = row.outputs?.[META_KEY]
  if (raw === undefined) return row
  const { [META_KEY]: _meta, ...outputs } = row.outputs!
  let meta: Partial<StoredMeta> = {}
  try {
    meta = JSON.parse(raw)
  } catch {
    // A malformed value just means no stored meta.
  }
  return {
    ...row,
    outputs: Object.keys(outputs).length ? outputs : null,
    models: row.models ?? meta.models ?? null,
    input_words: row.input_words ?? meta.input_words ?? null,
  }
}

function unwrap<T>(data: T | null, error: { code?: string; message: string } | null): T {
  if (error) {
    if (isMissingSchemaError(error)) throw new SchemaMissingError()
    throw new Error(error.message)
  }
  return data as T
}

/** unwrap for activity rows: also restores meta stored inside `outputs`. */
function unwrapRows(data: ActivityLog[] | null, error: { code?: string; message: string } | null): ActivityLog[] {
  return unwrap(data, error).map(readRow)
}

/** One page of the given user's history, newest first. */
export async function fetchUserActivity(userId: string, page: number): Promise<ActivityLog[]> {
  const from = page * PAGE_SIZE
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
  return unwrapRows(data as ActivityLog[] | null, error)
}


const GENERATION_ACTIONS: ActivityAction[] = ['generate', 'regenerate']

/** One page of the user's generations (sign-ins excluded), newest first, optionally only those that include `format`. */
export async function fetchUserGenerations(userId: string, page: number, format?: string): Promise<ActivityLog[]> {
  const from = page * PAGE_SIZE
  let query = supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .in('action', GENERATION_ACTIONS)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
  if (format) query = query.contains('formats', [format])
  const { data, error } = await query
  return unwrapRows(data as ActivityLog[] | null, error)
}

/** Every generation the user has run, newest first, for the analytics totals. Capped to keep the payload bounded. */
export async function fetchUserAnalyticsRows(userId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .in('action', GENERATION_ACTIONS)
    .order('created_at', { ascending: false })
    .limit(1000)
  return unwrapRows(data as ActivityLog[] | null, error)
}

/* ─── Per-draft view ────────────────────────────────────────────────────── */

/** Average characters per English word including the trailing space; used only to estimate legacy rows. */
const CHARS_PER_WORD = 6

/** One generated draft: a generation row fans out into one entry per requested format. */
export interface DraftEntry {
  key: string
  action: ActivityAction
  format: string
  /** Null when the row carries no model record (logged before the models column existed). */
  provider: ProviderId | null
  model: string | null
  inputWords: number | null
  inputEstimated: boolean
  outputWords: number | null
  failed: boolean
  tone: string | null
  sourceName: string | null
  createdAt: string
}

/**
 * Rows store "provider:model". Older rows hold a bare model id, whose provider is looked up in the
 * catalogue (Groq before BYOK). Rows with nothing stored stay unknown rather than guessed.
 */
function splitStoredModel(value: string | null | undefined): { provider: ProviderId | null; model: string | null } {
  if (!value) return { provider: null, model: null }
  const match = /^(groq|gemini|mistral):(.+)$/.exec(value)
  if (match) return { provider: match[1] as ProviderId, model: match[2] }
  const owner = PROVIDERS.find((p) => p.models.some((m) => m.id === value))
  return { provider: owner?.id ?? 'groq', model: value }
}

export function toDraftEntries(log: ActivityLog): DraftEntry[] {
  const exact = log.input_words ?? null
  const estimate = exact == null && log.input_chars ? Math.max(1, Math.round(log.input_chars / CHARS_PER_WORD)) : null
  return log.formats.map((format) => {
    const output = log.outputs?.[format]
    return {
      key: `${log.id}:${format}`,
      action: log.action,
      format,
      ...splitStoredModel(log.models?.[format]),
      inputWords: exact ?? estimate,
      inputEstimated: exact == null && estimate != null,
      outputWords: output != null ? countWords(output) : null,
      failed: output == null && log.status !== 'success',
      tone: log.tone,
      sourceName: log.source_name,
      createdAt: log.created_at,
    }
  })
}

/** Admin only: one page of every user's activity, newest first. */
export async function fetchGlobalActivity(
  page: number,
  filters: { userId?: string; action?: ActivityAction } = {},
): Promise<ActivityLog[]> {
  const from = page * PAGE_SIZE
  let query = supabase
    .from('activity_logs')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
  if (filters.userId) query = query.eq('user_id', filters.userId)
  if (filters.action) query = query.eq('action', filters.action)
  const { data, error } = await query
  return unwrapRows(data as ActivityLog[] | null, error)
}

/** Admin only: permanently deletes an account and all of its activity. */
export async function adminDeleteUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
  if (error) throw new Error(error.message)
}

/** Admin only: every registered account with usage totals. */
export async function fetchAllUsers(): Promise<AdminUserRow[]> {
  const { data, error } = await supabase.rpc('admin_list_users')
  return unwrap(data as AdminUserRow[] | null, error)
}
