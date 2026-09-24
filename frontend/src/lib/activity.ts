/**
 * Activity tracking — writes to and reads from public.activity_logs in the
 * central Supabase database. RLS scopes reads to the caller's own rows unless
 * the caller is the admin (see supabase/schema.sql).
 */

import { supabase, isMissingSchemaError } from './supabase'
import type { FormatResult, OutputFormat } from './pipeline'

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
  formats: string[]
  tone: string | null
  target_language: string | null
  custom_schema: string | null
  refinement: string | null
  outputs: Record<string, string> | null
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

/**
 * Records one action for the signed-in user. Never throws — tracking must not
 * break the feature being tracked. user_id is filled by the column default
 * (auth.uid()) and checked by RLS.
 */
export async function logActivity(entry: NewActivity): Promise<void> {
  try {
    const { error } = await supabase.from('activity_logs').insert(entry)
    if (error) console.warn('[activity] failed to log', entry.action, error.message)
  } catch (err) {
    console.warn('[activity] failed to log', entry.action, err)
  }
}

export function summariseResults(results: Partial<Record<OutputFormat, FormatResult>>) {
  const list = Object.values(results).filter((r): r is FormatResult => !!r)
  const successCount = list.filter((r) => r.status === 'success').length
  const errorCount = list.length - successCount
  const outputs: Record<string, string> = {}
  for (const r of list) if (r.status === 'success') outputs[r.format] = r.output
  const status: ActivityStatus =
    errorCount === 0 ? 'success' : successCount === 0 ? 'error' : 'partial'
  const errorMessage = list.find((r) => r.status === 'error')?.error ?? null
  return { successCount, errorCount, outputs, status, errorMessage }
}

export function previewOf(content: string) {
  return { input_preview: content.slice(0, PREVIEW_CHARS), input_chars: content.length }
}

/* ─── Read ──────────────────────────────────────────────────────────────── */

function unwrap<T>(data: T | null, error: { code?: string; message: string } | null): T {
  if (error) {
    if (isMissingSchemaError(error)) throw new SchemaMissingError()
    throw new Error(error.message)
  }
  return data as T
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
  return unwrap(data as ActivityLog[] | null, error)
}

/** Lightweight rows for computing a user's all-time stats. */
export async function fetchUserStatsRows(userId: string) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('action, formats, status, success_count, duration_ms, created_at')
    .eq('user_id', userId)
    .in('action', ['generate', 'regenerate'])
  return unwrap(
    data as Pick<ActivityLog, 'action' | 'formats' | 'status' | 'success_count' | 'duration_ms' | 'created_at'>[] | null,
    error,
  )
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
  return unwrap(data as ActivityLog[] | null, error)
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
