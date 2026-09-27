import { useRef } from 'react'
import { Check, FileText, Layers, Plus } from 'lucide-react'
import type { OutputFormat } from '../lib/pipeline'
import { ALL_FORMATS } from './LeftPanel'
import { useModalFocus } from './useModalFocus'

/**
 * Shown when a Generate asks for formats the canvas already has (same source and settings) alongside
 * new ones. "Generate only new formats" sends just the new ones and keeps every draft on the canvas,
 * edits included; "Regenerate all" writes the whole selection again; Cancel, Escape or a click
 * outside does nothing.
 */
export function DuplicateFormatsDialog({ existing, fresh, onOnlyNew, onRegenerateAll, onCancel }: {
  existing: OutputFormat[]
  fresh: OutputFormat[]
  onOnlyNew: () => void
  onRegenerateAll: () => void
  onCancel: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  useModalFocus(panelRef, primaryRef, onCancel)
  const total = existing.length + fresh.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-4 backdrop-blur-[3px]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dup-formats-title"
        aria-describedby="dup-formats-body"
        className="sk-pop w-full max-w-[540px] overflow-hidden rounded-2xl border border-hair bg-white shadow-[0_24px_60px_-20px_rgba(15,16,15,0.35)]"
      >
        <div className="px-6 pb-6 pt-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-deep text-ink ring-1 ring-hair" aria-hidden>
              <Layers className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 id="dup-formats-title" className="text-[16px] font-semibold leading-snug text-ink">
                Some of these formats have already been generated.
              </h2>
              <p id="dup-formats-body" className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                Your canvas already has {existing.length === 1 ? 'a draft' : 'drafts'} for {existing.length} of the {total} formats you picked,
                from the same source and settings. Generate only the new ones to keep {existing.length === 1 ? 'that draft' : 'those drafts'}, edits included.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <FormatGroup label="On your canvas" note="Kept as they are" formats={existing} kind="kept" />
            <FormatGroup label="New in this run" note="Will be drafted" formats={fresh} kind="new" />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-hair bg-paper px-6 py-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl px-3 text-[13.5px] font-medium text-ink-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 sm:mr-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onRegenerateAll}
            title={`Writes all ${total} formats again and replaces the drafts on your canvas`}
            className="min-h-11 rounded-xl bg-white px-4 text-[13.5px] font-medium text-ink ring-1 ring-inset ring-line transition-colors hover:bg-paper-deep hover:ring-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            Regenerate all
            <span className="ml-1.5 text-ink-mute tabular-nums">{total}</span>
          </button>
          <button
            ref={primaryRef}
            type="button"
            onClick={onOnlyNew}
            className="min-h-11 rounded-xl bg-ink px-5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
          >
            Generate only new formats
            <span className="ml-1.5 rounded-md bg-matcha px-1.5 py-0.5 text-[11.5px] font-semibold text-ink tabular-nums">{fresh.length}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function FormatGroup({ label, note, formats, kind }: { label: string; note: string; formats: OutputFormat[]; kind: 'kept' | 'new' }) {
  return (
    <section
      aria-label={label}
      className={`rounded-xl p-3.5 ${kind === 'kept' ? 'bg-paper-deep/70' : 'bg-white ring-1 ring-inset ring-matcha-deep'}`}
    >
      <p className="flex items-baseline justify-between gap-2 text-[12.5px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-ink-mute">{note}</span>
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {formats.map((f) => {
          const info = ALL_FORMATS.find((m) => m.label === f)
          const Icon = info?.icon ?? FileText
          return (
            <li key={f} className="flex items-center gap-2.5 text-[13.5px] text-ink">
              <Icon className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.8} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{info?.short ?? f}</span>
              {kind === 'kept'
                ? <Check className="h-3.5 w-3.5 shrink-0 text-ink-soft" strokeWidth={2.5} aria-label="already generated" />
                : <Plus className="h-3.5 w-3.5 shrink-0 text-ink-soft" strokeWidth={2.5} aria-label="new" />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
