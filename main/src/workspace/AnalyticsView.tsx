import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, ArrowDownToLine, ArrowUpFromLine, ChartNoAxesColumn, Layers, RefreshCw, Server } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SchemaMissingError, fetchUserAnalyticsRows, toDraftEntries, type ActivityLog } from '../lib/activity'
import { ErrorNotice, SchemaNotice } from './ActivityFeed'
import { FILTER_FORMATS, NUMBER, formatMeta, relativeTime, shortModel } from './draftMeta'
import { PROVIDERS, providerInfo } from '../lib/providers'
import { PAGE_FRAME, PageHeader } from './PageHeader'

function computeAnalytics(logs: ActivityLog[]) {
  const today = new Date().toDateString()
  const generations = logs.filter((l) => l.action === 'generate')
  const entries = logs.flatMap(toDraftEntries)

  // Input is counted once per generation: every draft in a run shares the same source.
  let inputWords = 0
  let inputEstimated = false
  for (const log of generations) {
    const [first] = toDraftEntries(log)
    if (!first?.inputWords) continue
    inputWords += first.inputWords
    inputEstimated ||= first.inputEstimated
  }

  const written = entries.filter((e) => e.outputWords != null)
  const outputWords = written.reduce((n, e) => n + (e.outputWords ?? 0), 0)

  const usage = new Map<string, number>()
  for (const e of entries) usage.set(e.format, (usage.get(e.format) ?? 0) + 1)
  const formats = [...usage.entries()].sort((a, b) => b[1] - a[1]).map(([format, count]) => ({ format, count }))

  return {
    transformations: generations.length,
    today: generations.filter((l) => new Date(l.created_at).toDateString() === today).length,
    inputWords,
    inputEstimated,
    avgInput: generations.length ? Math.round(inputWords / generations.length) : 0,
    outputWords,
    avgOutput: written.length ? Math.round(outputWords / written.length) : 0,
    models: new Set(entries.map((e) => e.model).filter(Boolean)).size,
    usedProviders: [...new Set(entries.flatMap((e) => (e.provider ? [e.provider] : [])))],
    drafts: entries.length,
    formats,
    recent: entries.slice(0, 5),
  }
}

type Analytics = ReturnType<typeof computeAnalytics>

export function AnalyticsView({ onOpenHistory }: { onOpenHistory?: () => void }) {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schemaMissing, setSchemaMissing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(computeAnalytics(await fetchUserAnalyticsRows(userId)))
      setSchemaMissing(false)
    } catch (err) {
      if (err instanceof SchemaMissingError) setSchemaMissing(true)
      else setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { void load() }, [load])

  const ready = !!data

  return (
    <div className={PAGE_FRAME}>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        subtitle="Usage across formats, word counts, and recent activity."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-[13.5px] font-medium text-ink shadow-[0_1px_2px_rgba(38,36,24,0.06)] transition-colors hover:border-ink/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50 disabled:cursor-wait"
          >
            <RefreshCw className={`h-4 w-4 text-ink-mute ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {schemaMissing ? (
        <div className="mt-5"><SchemaNotice /></div>
      ) : error ? (
        <div className="mt-5"><ErrorNotice message={`Couldn't load your analytics: ${error}`} onRetry={() => void load()} /></div>
      ) : (
        <>
          <section aria-label="Totals" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <MetricCard
              label="Transformations"
              icon={Layers}
              value={ready ? NUMBER.format(data.transformations) : null}
              foot={ready ? `${data.today} today` : null}
              accent
            />
            <MetricCard
              label="Input words"
              icon={ArrowDownToLine}
              value={ready ? `${data.inputEstimated ? '~' : ''}${NUMBER.format(data.inputWords)}` : null}
              foot={ready ? `~${NUMBER.format(data.avgInput)} per transformation` : null}
              hint={data?.inputEstimated ? 'Includes estimates from character counts for drafts logged before the latest schema update.' : undefined}
            />
            <MetricCard
              label="Output words"
              icon={ArrowUpFromLine}
              value={ready ? NUMBER.format(data.outputWords) : null}
              foot={ready ? `${NUMBER.format(data.avgOutput)} per draft` : null}
            />
            <MetricCard
              label="Available providers"
              icon={Server}
              value={ready ? String(PROVIDERS.length) : null}
              foot={ready ? (data.usedProviders.length ? `Used: ${data.usedProviders.map((p) => providerInfo(p).name).join(', ')}${data.models ? ` · ${data.models} ${data.models === 1 ? 'model' : 'models'}` : ''}` : PROVIDERS.map((p) => p.name).join(', ')) : null}
              hint={`${PROVIDERS.map((p) => p.name).join(', ')}. Add your own key in the AI engine step; Groq also works with this workspace key.`}
            />
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <FormatUsage data={data} />
            <RecentActivity data={data} onOpenHistory={onOpenHistory} />
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, icon: Icon, value, foot, hint, accent }: {
  label: string
  icon: typeof Layers
  value: string | null
  foot: string | null
  hint?: string
  accent?: boolean
}) {
  return (
    <div className="sk-elevated relative flex flex-col overflow-hidden rounded-xl border border-edge bg-white" title={hint}>
      {accent && <span className="absolute inset-x-0 top-0 h-[3px] bg-matcha-deep" aria-hidden />}
      <div className="flex items-center justify-between px-6 pt-5">
        <p className="text-[13.5px] font-medium text-ink-soft">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-paper-deep ring-1 ring-line">
          <Icon className="h-4 w-4 text-ink" strokeWidth={1.8} />
        </span>
      </div>
      <div className="px-6 pb-5 pt-4">
        {value == null ? (
          <span className="sk-skeleton block h-11 w-28 rounded-lg" />
        ) : (
          <p className="font-mono text-[clamp(2.25rem,3vw,2.9rem)] font-medium leading-none tracking-[-0.04em] text-ink tabular-nums">{value}</p>
        )}
      </div>
      <p className="mt-auto border-t border-line bg-paper px-6 py-3 text-[12.5px] text-ink-mute">
        {foot ?? <span className="sk-skeleton block h-3 w-24 rounded-full" />}
      </p>
    </div>
  )
}

function CardHeader({ title, meta }: { title: string; meta?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-5">
      <h2 className="font-display text-[22px] text-ink">{title}</h2>
      {meta && <span className="text-[12.5px] text-ink-mute">{meta}</span>}
    </div>
  )
}

function FormatUsage({ data }: { data: Analytics | null }) {
  const max = data?.formats[0]?.count ?? 0

  return (
    <section aria-label="Most-used formats" className="sk-elevated flex flex-col overflow-hidden rounded-xl border border-edge bg-white">
      <CardHeader
        title="Most-used formats"
        meta={data && data.drafts > 0 && <><span className="font-mono font-medium text-ink tabular-nums">{NUMBER.format(data.drafts)}</span> drafts</>}
      />
      {!data ? (
        <ul className="space-y-6 px-6 py-6" aria-hidden>
          {[88, 64, 46, 30].map((w) => (
            <li key={w} className="space-y-2.5">
              <span className="sk-skeleton block h-3 w-32 rounded-full" />
              <span className="sk-skeleton block h-2 rounded-full" style={{ width: `${w}%` }} />
            </li>
          ))}
        </ul>
      ) : data.formats.length === 0 ? (
        <EmptyCard icon={ChartNoAxesColumn} text="Format usage shows up after your first transformation." />
      ) : (
        <ol className="space-y-5 px-6 py-6">
          {data.formats.map(({ format, count }, i) => {
            const { short, icon: Icon } = formatMeta(format)
            const share = Math.round((count / data.drafts) * 100)
            return (
              <li key={format}>
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.8} />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">
                    {short}
                    {i === 0 && <span className="ml-2 rounded-[5px] bg-matcha px-1.5 py-0.5 align-middle text-[10.5px] font-semibold text-ink">Top</span>}
                  </span>
                  <span className="shrink-0 font-mono text-[13px] tabular-nums">
                    <span className="font-medium text-ink">{count}</span>
                    <span className="ml-2 text-ink-mute">{share}%</span>
                  </span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-paper-deep ring-1 ring-inset ring-line/60">
                  <div
                    className="sk-grow h-full rounded-full bg-ink"
                    style={{ width: `${(count / max) * 100}%`, animationDelay: `${i * 60}ms` }}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
      {data && data.formats.length > 0 && (
        <UnusedFormats used={data.formats.map((f) => f.format)} />
      )}
    </section>
  )
}

function UnusedFormats({ used }: { used: string[] }) {
  const unused = FILTER_FORMATS.filter((f) => !used.includes(f))
  if (unused.length === 0) return null
  return (
    <div className="mt-auto border-t border-line bg-paper px-6 py-5">
      <p className="text-[12.5px] text-ink-mute">
        Not tried yet <span className="font-mono tabular-nums">· {unused.length}</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {unused.map((f) => {
          const { short, icon: Icon } = formatMeta(f)
          return (
            <li key={f} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] text-ink-soft">
              <Icon className="h-3.5 w-3.5 text-ink-mute" strokeWidth={1.8} />
              {short}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function RecentActivity({ data, onOpenHistory }: { data: Analytics | null; onOpenHistory?: () => void }) {
  return (
    <section aria-label="Recent activity" className="sk-elevated flex flex-col overflow-hidden rounded-xl border border-edge bg-white">
      <CardHeader title="Recent activity" meta="Last 5 drafts" />
      {!data ? (
        <ul className="divide-y divide-line" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex items-center gap-3.5 px-6 py-4">
              <span className="sk-skeleton h-9 w-9 rounded-[10px]" />
              <span className="sk-skeleton h-3 w-32 rounded-full" />
            </li>
          ))}
        </ul>
      ) : data.recent.length === 0 ? (
        <EmptyCard icon={Layers} text="Your five most recent drafts will be listed here." />
      ) : (
        <ul className="divide-y divide-line">
          {data.recent.map((e) => {
            const { short, icon: Icon } = formatMeta(e.format)
            return (
              <li key={e.key} className="flex items-center gap-3.5 px-6 py-3.5 transition-colors hover:bg-paper-deep/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-paper-deep ring-1 ring-line">
                  <Icon className="h-4 w-4 text-ink" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-ink">{short}</span>
                  <span className="block truncate text-[12.5px] text-ink-mute">
                    {e.failed ? <span className="text-red-700">Failed</span> : e.outputWords != null ? `${NUMBER.format(e.outputWords)} words` : e.provider ? providerInfo(e.provider).name : null}
                    {e.model && <span className="font-mono text-[11.5px]"> · {shortModel(e.model)}</span>}
                  </span>
                </span>
                <time dateTime={e.createdAt} title={new Date(e.createdAt).toLocaleString()} className="shrink-0 text-[12.5px] text-ink-mute">
                  {relativeTime(e.createdAt)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
      {onOpenHistory && (
        <button
          type="button"
          onClick={onOpenHistory}
          className="group mt-auto flex items-center justify-between border-t border-line bg-paper px-6 py-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper-deep"
        >
          View full history
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      )}
    </section>
  )
}

function EmptyCard({ icon: Icon, text }: { icon: typeof Layers; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink">
        <Icon className="h-5 w-5 text-matcha" />
      </span>
      <p className="mt-4 max-w-[34ch] text-[13.5px] leading-relaxed text-ink-mute">{text}</p>
    </div>
  )
}
