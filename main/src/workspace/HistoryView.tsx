import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, History, ListFilter, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserGenerations, toDraftEntries, type DraftEntry } from '../lib/activity'
import { ErrorNotice, SchemaNotice } from './ActivityFeed'
import { FILTER_FORMATS, NUMBER, formatMeta, formatStamp, shortModel } from './draftMeta'
import { providerInfo } from '../lib/providers'
import { PAGE_FRAME, PageHeader } from './PageHeader'
import { usePagedActivity } from './usePagedActivity'

const COLUMNS = 'md:grid-cols-[minmax(0,2.3fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]'

export function HistoryView() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [format, setFormat] = useState('')

  const fetchPage = useCallback((page: number) => fetchUserGenerations(userId, page, format || undefined), [userId, format])
  const feed = usePagedActivity(fetchPage)

  // A generation with several formats fans out into one row per draft; the filter keeps only the chosen one.
  const entries = useMemo(
    () => feed.logs.flatMap(toDraftEntries).filter((e) => !format || e.format === format),
    [feed.logs, format],
  )

  const initialLoad = feed.loading && feed.logs.length === 0

  return (
    <div className={PAGE_FRAME}>
      <PageHeader
        eyebrow="Workspace log"
        title="History"
        subtitle="Recent transformations from this workspace."
        actions={
          <>
            <label className="relative flex items-center">
              <span className="sr-only">Filter by format</span>
              <ListFilter className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink-mute" />
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="h-11 min-w-[210px] cursor-pointer appearance-none rounded-full border border-line bg-white pl-10 pr-10 text-[13.5px] font-medium text-ink shadow-[0_1px_2px_rgba(38,36,24,0.06)] transition-colors hover:border-ink/30 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
              >
                <option value="">All formats</option>
                {FILTER_FORMATS.map((f) => (
                  <option key={f} value={f}>{formatMeta(f).short}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-ink-mute" />
            </label>
            <button
              type="button"
              onClick={feed.refresh}
              disabled={feed.loading}
              className="flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-paper transition-[transform,background-color] duration-200 hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha active:scale-[0.98] disabled:cursor-wait"
            >
              <RefreshCw className={`h-4 w-4 text-matcha ${feed.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </>
        }
      />

      <div className="mt-8 lg:mt-10">
        {feed.schemaMissing ? (
          <SchemaNotice />
        ) : feed.error ? (
          <ErrorNotice message={`Couldn't load your history: ${feed.error}`} onRetry={feed.refresh} />
        ) : (
          <section aria-label="Generated drafts" className="sk-elevated overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
              <p className="text-[13.5px] text-ink-mute" aria-live="polite">
                {initialLoad ? 'Loading drafts…' : (
                  <>
                    <span className="font-mono font-medium text-ink tabular-nums">{NUMBER.format(entries.length)}</span>
                    {feed.hasMore && '+'} {entries.length === 1 ? 'draft' : 'drafts'}
                    {format && <> · <span className="text-ink">{formatMeta(format).short}</span> only</>}
                  </>
                )}
              </p>
              {format && (
                <button
                  type="button"
                  onClick={() => setFormat('')}
                  className="text-[13px] font-medium text-ink-soft underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className={`hidden gap-6 border-b border-line bg-paper px-6 py-2.5 text-[12px] font-medium text-ink-mute md:grid ${COLUMNS}`} aria-hidden>
              <span>Type</span>
              <span>Provider / model</span>
              <span className="text-right">Input</span>
              <span className="text-right">Output</span>
              <span className="text-right">Date</span>
            </div>

            {initialLoad ? (
              <SkeletonRows />
            ) : entries.length === 0 ? (
              <EmptyHistory format={format} onClear={() => setFormat('')} />
            ) : (
              <ul className="divide-y divide-line">
                {entries.map((entry, i) => (
                  <HistoryRow key={entry.key} entry={entry} index={i} />
                ))}
              </ul>
            )}

            {!initialLoad && entries.length > 0 && (
              <div className="flex justify-center border-t border-line bg-paper px-6 py-3.5">
                {feed.hasMore ? (
                  <button
                    type="button"
                    onClick={feed.loadMore}
                    disabled={feed.loading}
                    className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-wait disabled:text-ink-mute"
                  >
                    {feed.loading ? 'Loading…' : 'Load older drafts'}
                  </button>
                ) : (
                  <p className="text-[12.5px] text-ink-mute">That's everything in your history.</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function HistoryRow({ entry, index }: { entry: DraftEntry; index: number }) {
  const { short, icon: Icon } = formatMeta(entry.format)
  const stamp = formatStamp(entry.createdAt)
  const detail = [entry.action === 'regenerate' ? 'Refined' : null, entry.tone, entry.sourceName].filter(Boolean).join(' · ')

  return (
    <li
      className={`sk-rise group relative grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 transition-colors duration-200 hover:bg-paper-deep/60 md:items-center md:gap-6 md:px-6 ${COLUMNS}`}
      style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
    >

      <div className="col-span-2 flex min-w-0 items-center gap-3.5 md:col-span-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-paper-deep ring-1 ring-line transition-colors group-hover:bg-white">
          <Icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.8} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-medium text-ink">{short}</span>
          {detail && <span className="block truncate text-[12.5px] text-ink-mute">{detail}</span>}
        </span>
      </div>

      <div className="col-span-2 min-w-0 md:col-span-1">
        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-paper py-1 pl-2.5 pr-2.5 text-[12px]">
          <span className="font-medium text-ink">{providerInfo(entry.provider).name}</span>
          {entry.model && (
            <>
              <span className="h-3 w-px shrink-0 bg-line" aria-hidden />
              <span className="truncate font-mono text-[11.5px] text-ink-mute" title={entry.model}>{shortModel(entry.model)}</span>
            </>
          )}
        </span>
      </div>

      <WordCell label="Input" words={entry.inputWords} estimated={entry.inputEstimated} />
      <WordCell label="Output" words={entry.outputWords} failed={entry.failed} />

      <p className="col-span-2 text-[13px] text-ink-mute md:col-span-1 md:text-right">
        <time dateTime={entry.createdAt}>
          <span className="text-ink">{stamp.date}</span>
          <span className="mx-1.5 text-ink/30">•</span>
          <span className="font-mono tabular-nums">{stamp.time}</span>
        </time>
      </p>
    </li>
  )
}

function WordCell({ label, words, estimated, failed }: { label: string; words: number | null; estimated?: boolean; failed?: boolean }) {
  return (
    <div className="md:text-right">
      <span className="block text-[11.5px] text-ink-mute md:hidden">{label}</span>
      {failed ? (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-hidden /> Failed
        </span>
      ) : words == null ? (
        <span className="text-[13px] text-ink-mute">Not recorded</span>
      ) : (
        <span
          className="whitespace-nowrap text-[13px] text-ink-mute"
          title={estimated ? 'Estimated from the character count. Drafts logged after the latest schema update show exact counts.' : undefined}
        >
          <span className="font-mono text-[14px] font-medium text-ink tabular-nums">
            {estimated && '~'}{NUMBER.format(words)}
          </span>{' '}
          {words === 1 ? 'word' : 'words'}
        </span>
      )}
    </div>
  )
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-line" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className={`grid grid-cols-2 items-center gap-4 px-5 py-5 md:gap-6 md:px-6 ${COLUMNS}`}>
          <div className="col-span-2 flex items-center gap-3.5 md:col-span-1">
            <span className="sk-skeleton h-10 w-10 rounded-[11px]" />
            <span className="sk-skeleton h-3 w-32 rounded-full" />
          </div>
          <span className="sk-skeleton col-span-2 h-6 w-36 rounded-full md:col-span-1" />
          <span className="sk-skeleton h-3 w-20 rounded-full md:ml-auto" />
          <span className="sk-skeleton h-3 w-20 rounded-full md:ml-auto" />
          <span className="sk-skeleton col-span-2 h-3 w-36 rounded-full md:col-span-1 md:ml-auto" />
        </li>
      ))}
    </ul>
  )
}

function EmptyHistory({ format, onClear }: { format: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink">
        <History className="h-6 w-6 text-matcha" />
      </span>
      <h2 className="font-headline mt-5 text-[32px] text-ink">
        {format ? `No ${formatMeta(format).short} drafts yet` : 'Nothing here yet'}
      </h2>
      <p className="mt-2 max-w-[42ch] text-[14px] leading-relaxed text-ink-mute">
        {format
          ? 'Pick this format in the Transform tab and its drafts will be listed here.'
          : 'Run a transformation in the Transform tab. Every draft it writes is listed here with its size and model.'}
      </p>
      {format && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-ink/30"
        >
          Show all formats
        </button>
      )}
    </div>
  )
}
