import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { LeftPanel, type LeftPanelConfig, type LeftPanelStatus } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { PageHeader } from './PageHeader'
import { runPipeline, type Audience, type EngineConfig, type ModelRun, type OutputFormat } from '../lib/pipeline'
import type { ToneOption } from '../lib/pipeline'
import { logActivity, previewOf, summariseResults } from '../lib/activity'

/** What the last run used, so refining a draft goes back to the same model, key and audience. */
export interface RunContext {
  engine: EngineConfig
  audience: Audience | null
  imageReadBy: string | null
}

export function TransformView({ onOpenHistory }: { onOpenHistory?: () => void }) {
  const [generating, setGenerating] = useState(false)
  const [runs, setRuns] = useState<ModelRun[]>([])
  const [runContext, setRunContext] = useState<RunContext | null>(null)
  const [parsedSource, setParsedSource] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>([])
  const [tone, setTone] = useState<ToneOption>('Professional')
  const [notice, setNotice] = useState<{ text: string; kind: 'error' | 'info' } | null>(null)
  const [status, setStatus] = useState<LeftPanelStatus | null>(null)
  // Drafts written since the workspace opened, and how long the last run took.
  const [session, setSession] = useState<{ drafts: number; lastMs: number | null }>({ drafts: 0, lastMs: null })

  const handleGenerate = async (cfg: LeftPanelConfig) => {
    // Missing keys are caught in the panel before this runs (LeftPanel handleGenerate).
    setNotice(null)
    setGenerating(true)
    setRuns([])
    setRunContext(null)
    setParsedSource('')
    // An empty selection with custom instructions runs as a single Custom Format.
    setSelectedFormats(cfg.formats.length === 0 && cfg.customSchema.trim() ? ['Custom Format'] : cfg.formats)
    setTone(cfg.tone)

    const t0 = Date.now()
    const baseLog = {
      action: 'generate' as const,
      input_type: cfg.inputType,
      source_name: cfg.sourceName,
      ...previewOf(cfg.content),
      tone: cfg.tone,
      target_language: cfg.formats.includes('Language Translation') ? cfg.targetLanguage : null,
      custom_schema: cfg.customSchema.trim() || null,
    }

    try {
      const output = await runPipeline({
        content: cfg.content,
        images: cfg.images,
        url: cfg.url,
        formats: cfg.formats,
        tone: cfg.tone,
        customSchema: cfg.customSchema,
        targetLanguage: cfg.targetLanguage,
        audience: cfg.audience,
        engine: cfg.engine,
      })
      setParsedSource(output.parsedSource)
      setRuns(output.runs)
      setRunContext({ engine: cfg.engine, audience: cfg.audience, imageReadBy: output.imageReadBy })
      if (output.sourceNote) setNotice({ text: output.sourceNote, kind: 'info' })

      // One activity row per model, so History lists every model's drafts separately.
      // An image or link source has no text of its own; size it by what was read from it.
      const source = cfg.content.trim() ? cfg.content : output.parsedSource
      let written = 0
      for (const run of output.runs) {
        const summary = summariseResults(run.results)
        written += summary.successCount
        void logActivity({
          ...baseLog,
          ...previewOf(source),
          formats: Object.keys(run.results),
          outputs: summary.outputs,
          models: summary.models,
          status: summary.status,
          success_count: summary.successCount,
          error_count: summary.errorCount,
          error_message: summary.errorMessage,
          duration_ms: output.durationMs,
        })
      }
      setSession((s) => ({ drafts: s.drafts + written, lastMs: output.durationMs }))
    } catch (err) {
      console.error('Pipeline error:', err)
      void logActivity({
        ...baseLog,
        formats: cfg.formats,
        status: 'error',
        success_count: 0,
        error_count: cfg.formats.length,
        error_message: err instanceof Error ? err.message : String(err),
        duration_ms: Date.now() - t0,
      })
      setNotice({ text: `Generation failed: ${err instanceof Error ? err.message : String(err)}`, kind: 'error' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1760px] px-4 pb-14 sm:px-6 lg:px-10 2xl:px-14">

        {/* Compact toolbar: breadcrumb and title left, live session readout right */}
        <PageHeader
          eyebrow="Transform"
          title="Find exactly what you need."
          subtitle="Sankshep.ai : A gen-AI based Content Transformation Platform"
          actions={
            <SessionPanel
              drafts={session.drafts}
              lastMs={session.lastMs}
              generating={generating}
              engineLabel={status?.engineLabel ?? null}
              engineReady={status?.engineReady ?? true}
              onOpenHistory={onOpenHistory}
            />
          }
        />

        {/* Two app windows on the canvas: the control desk and the output canvas.
            Height = viewport minus app header (4rem), toolbar (~7rem incl. gap) and a bottom margin. */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(420px,5fr)_minmax(0,7fr)] lg:gap-6 2xl:gap-8">
          <aside
            aria-label="Source and configuration"
            className="sk-elevated flex flex-col rounded-xl border border-edge bg-white lg:h-[max(620px,calc(100dvh-13rem))] lg:overflow-hidden"
          >
            <LeftPanel onGenerate={handleGenerate} generating={generating} onStatusChange={setStatus} />
          </aside>

          <section
            aria-label="Output canvas"
            className="sk-elevated relative flex min-h-[640px] flex-col overflow-hidden rounded-xl border border-ink bg-white lg:h-[max(620px,calc(100dvh-13rem))] lg:min-h-0"
          >
            <RightPanel
              runs={runs}
              runContext={runContext}
              parsedSource={parsedSource}
              tone={tone}
              generating={generating}
              selectedFormats={selectedFormats}
              notice={notice}
              onDismissNotice={() => setNotice(null)}
              status={status}
            />
          </section>
        </div>
      </div>
    </div>
  )
}

interface SessionPanelProps {
  drafts: number
  lastMs: number | null
  generating: boolean
  engineLabel: string | null
  engineReady: boolean
  onOpenHistory?: () => void
}

/** Live readout for the header's right side: engine state, this session's output, and a way into History. */
function SessionPanel({ drafts, lastMs, generating, engineLabel, engineReady, onOpenHistory }: SessionPanelProps) {
  // The dot marks a real state: key missing, drafting in progress, or ready to run.
  const engine = !engineReady
    ? { label: 'Key needed', dot: 'bg-red-600', ping: false }
    : generating
      ? { label: 'Drafting…', dot: 'bg-matcha-deep', ping: true }
      : { label: 'Ready', dot: 'bg-green-600', ping: false }

  return (
    <div
      aria-label="Session"
      className="flex w-full items-stretch overflow-hidden rounded-xl border border-edge bg-white shadow-[0_1px_2px_rgba(20,22,20,0.06)] lg:w-auto"
    >
      <dl className="flex min-w-0 flex-1 divide-x divide-edge">
        <div className="min-w-0 flex-1 px-4 py-2 lg:min-w-[104px]">
          <dt className="text-[11.5px] text-ink-mute">Engine</dt>
          <dd className="mt-0.5 flex h-5 items-center gap-2 text-[13.5px] font-semibold text-ink" aria-live="polite">
            <span className="relative flex h-2 w-2 shrink-0">
              {engine.ping && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${engine.dot}`} />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${engine.dot}`} />
            </span>
            <span className="truncate" title={engineLabel ?? undefined}>{engine.label}</span>
          </dd>
        </div>
        <div className="min-w-0 flex-1 px-4 py-2 lg:min-w-[104px]">
          <dt className="text-[11.5px] text-ink-mute">Drafts</dt>
          <dd className="mt-0.5 flex h-5 items-center text-[15px] font-semibold leading-none text-ink tabular-nums">{drafts}</dd>
        </div>
        <div className="hidden min-w-0 flex-1 px-4 py-2 sm:block lg:min-w-[104px]">
          <dt className="text-[11.5px] text-ink-mute">Last run</dt>
          <dd className="mt-0.5 flex h-5 items-center text-[15px] font-semibold leading-none text-ink tabular-nums">
            {lastMs === null ? <span className="text-[13.5px] font-medium text-ink-mute">No run yet</span> : `${(lastMs / 1000).toFixed(1)}s`}
          </dd>
        </div>
      </dl>

      {onOpenHistory && (
        <div className="flex shrink-0 items-center border-l border-edge bg-paper-deep p-1.5">
          <button
            type="button"
            onClick={onOpenHistory}
            className="group flex h-full items-center gap-2 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-paper transition-[transform,background-color] duration-200 hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha active:scale-[0.98]"
          >
            History
            <ArrowUpRight className="h-4 w-4 text-matcha transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  )
}
