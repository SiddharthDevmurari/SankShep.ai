import { useState } from 'react'
import {
  ChevronDown, Database, FileText, Link2, LogIn, LogOut, RefreshCw, Type, UserPlus, Zap,
} from 'lucide-react'
import type { ActivityAction, ActivityLog, InputType } from '../lib/activity'

/* ─── Formatting helpers ─────────────────────────────────────────────────── */

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function formatDuration(ms: number | null | undefined) {
  if (ms == null) return '–'
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

const ACTION_META: Record<ActivityAction, { label: string; icon: typeof Zap; tint: string }> = {
  generate: { label: 'Generated content', icon: Zap, tint: 'bg-matcha/40 text-ink' },
  regenerate: { label: 'Refined output', icon: RefreshCw, tint: 'bg-mist/50 text-ink' },
  login: { label: 'Signed in', icon: LogIn, tint: 'bg-paper-deep text-ink-soft' },
  logout: { label: 'Signed out', icon: LogOut, tint: 'bg-paper-deep text-ink-soft' },
  signup: { label: 'Created account', icon: UserPlus, tint: 'bg-paper-deep text-ink-soft' },
}

const INPUT_META: Record<InputType, { label: string; icon: typeof FileText }> = {
  file: { label: 'File', icon: FileText },
  url: { label: 'URL', icon: Link2 },
  text: { label: 'Text', icon: Type },
}

const STATUS_STYLE = {
  success: 'bg-green-50 text-green-700 border-green-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
} as const

/* ─── Feed ───────────────────────────────────────────────────────────────── */

interface FeedProps {
  logs: ActivityLog[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  showUser?: boolean
  emptyText: string
}

export function ActivityFeed({ logs, loading, hasMore, onLoadMore, showUser, emptyText }: FeedProps) {
  if (!loading && logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-hair bg-paper-deep/40 px-6 py-10 text-center text-[13.5px] text-ink-soft">
        {emptyText}
      </div>
    )
  }

  // Group consecutive rows by calendar day (rows arrive newest first).
  const groups: { day: string; items: ActivityLog[] }[] = []
  for (const log of logs) {
    const day = formatDay(log.created_at)
    const last = groups[groups.length - 1]
    if (last?.day === day) last.items.push(log)
    else groups.push({ day, items: [log] })
  }

  return (
    <div className="space-y-6">
      {groups.map(({ day, items }) => (
        <section key={day}>
          <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft/70">{day}</p>
          <ul className="divide-y divide-hair overflow-hidden rounded-2xl border border-hair bg-white">
            {items.map((log) => <FeedRow key={log.id} log={log} showUser={showUser} />)}
          </ul>
        </section>
      ))}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-hair border-t-ink" />
        </div>
      )}
      {!loading && hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="rounded-full border border-hair bg-white px-4 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
          >
            Load older activity
          </button>
        </div>
      )}
    </div>
  )
}

function FeedRow({ log, showUser }: { log: ActivityLog; showUser?: boolean }) {
  const [open, setOpen] = useState(false)
  const meta = ACTION_META[log.action]
  const Icon = meta.icon
  const isGeneration = log.action === 'generate' || log.action === 'regenerate'
  const input = log.input_type ? INPUT_META[log.input_type] : null

  return (
    <li>
      <button
        type="button"
        disabled={!isGeneration}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors enabled:hover:bg-paper/70"
      >
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.tint}`}>
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13.5px] font-medium text-ink">{meta.label}</span>
            {showUser && (
              <span className="rounded-full bg-paper-deep px-2 py-0.5 text-[11.5px] text-ink-soft">
                {log.profiles?.email ?? log.user_id.slice(0, 8)}
              </span>
            )}
            {log.status && (
              <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${STATUS_STYLE[log.status]}`}>
                {log.status}
              </span>
            )}
          </div>

          {isGeneration && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {log.formats.map((f) => (
                <span key={f} className="rounded-md border border-hair px-1.5 py-0.5 text-[11px] text-ink-soft">{f}</span>
              ))}
            </div>
          )}

          {isGeneration && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-soft/70">
              {input && (
                <span className="inline-flex items-center gap-1">
                  <input.icon className="h-3 w-3" />
                  {input.label}
                  {log.source_name && <span className="max-w-[220px] truncate">· {log.source_name}</span>}
                </span>
              )}
              {log.tone && <span>{log.tone}</span>}
              {log.target_language && <span>→ {log.target_language}</span>}
              <span>{formatDuration(log.duration_ms)}</span>
              {log.input_chars != null && <span>{log.input_chars.toLocaleString()} chars in</span>}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[11.5px] tabular-nums text-ink-soft/70">{formatTime(log.created_at)}</span>
          {isGeneration && (
            <ChevronDown className={`h-4 w-4 text-ink-soft/50 transition-transform ${open ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {open && isGeneration && <FeedRowDetail log={log} />}
    </li>
  )
}

function FeedRowDetail({ log }: { log: ActivityLog }) {
  const outputs = Object.entries(log.outputs ?? {})
  return (
    <div className="space-y-4 border-t border-hair bg-paper/60 px-4 py-4 sm:pl-15">
      {log.refinement && <Detail label="Refinement instructions">{log.refinement}</Detail>}
      {log.custom_schema && <Detail label="Custom format instructions">{log.custom_schema}</Detail>}
      {log.input_preview && (
        <Detail label="Source content (preview)">
          {log.input_preview}
          {(log.input_chars ?? 0) > log.input_preview.length && '…'}
        </Detail>
      )}
      {log.error_message && (
        <Detail label="Error"><span className="text-red-700">{log.error_message}</span></Detail>
      )}
      {outputs.map(([format, text]) => (
        <details key={format} className="rounded-xl border border-hair bg-white">
          <summary className="cursor-pointer px-3 py-2 text-[12.5px] font-medium text-ink">
            {format} <span className="font-normal text-ink-soft/60">· {text.length.toLocaleString()} chars</span>
          </summary>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words border-t border-hair px-3 py-2.5 font-sans text-[12.5px] leading-relaxed text-ink-soft">
            {text}
          </pre>
        </details>
      ))}
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/60">{label}</p>
      <p className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-ink-soft">{children}</p>
    </div>
  )
}

/* ─── Shared notices ─────────────────────────────────────────────────────── */

export function SchemaNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <p className="text-[13.5px] font-semibold text-amber-800">Database not set up yet</p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-800/80">
            The activity tables don't exist in Supabase. Open the Supabase dashboard → SQL Editor and run{' '}
            <code className="rounded bg-white/70 px-1 py-0.5 text-[12px]">frontend/supabase/schema.sql</code>.
          </p>
        </div>
      </div>
    </div>
  )
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
      <p className="text-[13px] text-red-700">{message}</p>
      <button onClick={onRetry} className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-red-700">
        Retry
      </button>
    </div>
  )
}

export function StatTile({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: typeof Zap; color: string
}) {
  return (
    <div className="rounded-2xl border border-hair bg-white p-5">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="font-display text-[28px] leading-none text-ink">{value}</p>
      <p className="mt-1 text-[12px] text-ink-soft">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-soft/60">{sub}</p>}
    </div>
  )
}
