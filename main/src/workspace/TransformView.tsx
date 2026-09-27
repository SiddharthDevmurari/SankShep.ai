import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { LeftPanel, type LeftPanelConfig, type LeftPanelStatus } from './LeftPanel'
import { RightPanel, type Notice } from './RightPanel'
import { KeyConsentDialog } from './KeyConsentDialog'
import { DuplicateFormatsDialog } from './DuplicateFormatsDialog'
import { runPipeline, type Audience, type EngineConfig, type FormatResult, type ModelRun, type OutputFormat } from '../lib/pipeline'
import type { ToneOption } from '../lib/pipeline'
import { isAbortError, OwnKeyError, refKey, withoutKey } from '../lib/providers'
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
  const [notice, setNotice] = useState<Notice | null>(null)
  const [status, setStatus] = useState<LeftPanelStatus | null>(null)
  // Collapsing the settings panel gives the canvas the full width; the panel stays mounted, so nothing is lost.
  const [panelOpen, setPanelOpen] = useState(true)
  // Drafts written since the workspace opened, and how long the last run took.
  const [session, setSession] = useState<{ drafts: number; lastMs: number | null }>({ drafts: 0, lastMs: null })

  // Changes only when a run replaces the canvas; adding formats to it keeps the id, so edits survive.
  const [canvasId, setCanvasId] = useState(0)
  // Formats being added to the canvas right now (a "generate only new" run), shown as they're written.
  const [pendingFormats, setPendingFormats] = useState<OutputFormat[]>([])
  // What the drafts on the canvas were written from, so a later Generate can tell which formats it already has.
  const canvasBrief = useRef<{ key: string; language: string } | null>(null)
  // A Generate that asked for formats the canvas already has, waiting for the user's choice.
  const [duplicateCheck, setDuplicateCheck] = useState<{ cfg: LeftPanelConfig; requested: OutputFormat[]; existing: OutputFormat[]; fresh: OutputFormat[] } | null>(null)

  // The run in flight, so Stop can abort it.
  const runAbort = useRef<AbortController | null>(null)
  // Leaving the workspace (logout, an expired session) stops the run instead of letting it finish unseen.
  useEffect(() => () => runAbort.current?.abort(), [])
  // A run halted by a failing own key, waiting for the user to allow the shared keys; it resumes the same way.
  const [keyConsent, setKeyConsent] = useState<{ error: OwnKeyError; cfg: LeftPanelConfig; mode: RunMode; formats: OutputFormat[] } | null>(null)

  /**
   * Smart generation check. Formats already drafted from the same source and settings aren't sent again
   * without asking: all-new selections are added to the canvas, mixed ones open the choice, and anything
   * else (a different brief, or only formats already drafted) replaces the canvas as a fresh run.
   */
  const handleGenerate = (cfg: LeftPanelConfig) => {
    // An empty selection with custom instructions runs as a single Custom Format.
    const requested: OutputFormat[] = cfg.formats.length === 0 && cfg.customSchema.trim() ? ['Custom Format'] : cfg.formats
    const brief = canvasBrief.current
    if (!brief || runs.length === 0 || brief.key !== briefKey(cfg)) return void runGeneration(cfg, 'replace', requested)

    const done = draftedFormats(runs)
    // A translation into another language is a different draft, even from the same source.
    if (cfg.targetLanguage !== brief.language) done.delete('Language Translation')
    const existing = requested.filter((f) => done.has(f))
    const fresh = requested.filter((f) => !done.has(f))

    if (fresh.length === 0) return void runGeneration(cfg, 'replace', requested)
    if (existing.length === 0) return void runGeneration(cfg, 'merge', fresh)
    setNotice(null)
    setDuplicateCheck({ cfg, requested, existing, fresh })
  }

  /** `replace` starts a fresh canvas with `formats`; `merge` adds `formats` to the canvas and keeps every draft already on it. */
  const runGeneration = async (cfg: LeftPanelConfig, mode: RunMode, formats: OutputFormat[]) => {
    // Missing keys are caught in the panel before this runs (LeftPanel handleGenerate).
    setNotice(null)
    setKeyConsent(null)
    setDuplicateCheck(null)
    setGenerating(true)
    setTone(cfg.tone)
    if (mode === 'replace') {
      setCanvasId((id) => id + 1)
      setRuns([])
      setRunContext(null)
      setParsedSource('')
      setPendingFormats([])
      setSelectedFormats(formats)
      canvasBrief.current = null
    } else {
      setPendingFormats(formats)
      setSelectedFormats((prev) => [...prev, ...formats.filter((f) => !prev.includes(f))])
    }

    const t0 = Date.now()
    const baseLog = {
      action: 'generate' as const,
      input_type: cfg.inputType,
      source_name: cfg.sourceName,
      ...previewOf(cfg.content),
      tone: cfg.tone,
      target_language: formats.includes('Language Translation') ? cfg.targetLanguage : null,
      custom_schema: cfg.customSchema.trim() || null,
    }

    const controller = new AbortController()
    runAbort.current = controller

    try {
      const output = await runPipeline({
        content: cfg.content,
        images: cfg.images,
        url: cfg.url,
        formats,
        tone: cfg.tone,
        customSchema: cfg.customSchema,
        targetLanguage: cfg.targetLanguage,
        audience: cfg.audience,
        engine: cfg.engine,
        signal: controller.signal,
      })
      // A stop keeps the drafts already written and drops the ones it cut off.
      const stopped = controller.signal.aborted
      const asked = output.runs.reduce((n, run) => n + Object.keys(run.results).length, 0)
      const fresh = stopped ? output.runs.map((run) => ({ ...run, results: finishedOnly(run.results) })) : output.runs
      const kept = fresh.reduce((n, run) => n + Object.keys(run.results).length, 0)
      if (stopped && kept === 0) {
        setNotice({ text: 'Generation stopped before any draft was finished.', kind: 'info' })
        return
      }
      setParsedSource(output.parsedSource)
      // Same brief means the same models in the same order, so each model's new drafts join its own column.
      setRuns((prev) => mode === 'replace' ? fresh : prev.map((run) => {
        const added = fresh.find((r) => refKey(r.ref) === refKey(run.ref))
        return added ? { ...run, results: { ...run.results, ...added.results } } : run
      }))
      setRunContext((prev) => ({ engine: cfg.engine, audience: cfg.audience, imageReadBy: output.imageReadBy ?? prev?.imageReadBy ?? null }))
      canvasBrief.current = {
        key: briefKey(cfg),
        // The language the canvas's translation is in: it changes only when a translation was (re)written.
        language: formats.includes('Language Translation') || !canvasBrief.current ? cfg.targetLanguage : canvasBrief.current.language,
      }
      const what = mode === 'merge' ? 'new drafts' : 'drafts'
      const notes = [
        stopped && `Generation stopped. ${kept} of ${asked} ${what} ${kept === 1 ? 'was' : 'were'} finished and ${kept === 1 ? 'is' : 'are'} shown; the rest weren't written.`,
        output.sourceNote,
      ].filter((n): n is string => !!n)
      if (notes.length) setNotice({ text: notes.join('\n\n'), kind: 'info' })

      // One activity row per model, so History lists every model's drafts separately. Only this run's drafts are logged.
      // An image or link source has no text of its own; size it by what was read from it.
      const source = cfg.content.trim() ? cfg.content : output.parsedSource
      let written = 0
      for (const run of fresh) {
        if (Object.keys(run.results).length === 0) continue // Stopped before this model wrote anything.
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
      // Stopped while the source was still being read: nothing to keep, and not a failure to log.
      if (isAbortError(err)) {
        setNotice({ text: 'Generation stopped before any draft was finished.', kind: 'info' })
        return
      }
      // The user's own key failed: pause here and let them decide whether the shared keys take over.
      if (err instanceof OwnKeyError) {
        setKeyConsent({ error: err, cfg, mode, formats })
        return
      }
      console.error('Pipeline error:', err)
      void logActivity({
        ...baseLog,
        formats,
        status: 'error',
        success_count: 0,
        error_count: formats.length,
        error_message: err instanceof Error ? err.message : String(err),
        duration_ms: Date.now() - t0,
      })
      setNotice({ text: `Generation failed: ${err instanceof Error ? err.message : String(err)}`, kind: 'error' })
    } finally {
      if (runAbort.current === controller) runAbort.current = null
      setPendingFormats([])
      setGenerating(false)
    }
  }

  const handleStop = () => runAbort.current?.abort()

  /** Runs the paused generation again, the same way, with the failing provider's requests going through the shared keys. */
  const acceptSharedKey = () => {
    if (!keyConsent) return
    const { error, cfg, mode, formats } = keyConsent
    setKeyConsent(null)
    void runGeneration({ ...cfg, engine: { ...cfg.engine, keys: withoutKey(cfg.engine.keys, error.provider) } }, mode, formats)
  }

  return (
    <div className="h-full px-3 pb-3 pt-3 sm:px-5 lg:px-8 lg:pb-5">
      {/* One app window under the nav: a tool sidebar flush left and the output canvas filling the rest.
          From lg up the window is viewport-height and each side scrolls on its own; below lg the
          sidebar stacks above the canvas and the window scrolls. */}
      <div className="mx-auto flex h-full max-w-[1760px] flex-col overflow-y-auto overflow-x-hidden rounded-2xl border border-edge/80 bg-white shadow-[0_1px_2px_rgba(15,16,15,0.05),0_24px_48px_-32px_rgba(15,16,15,0.28)] lg:flex-row lg:overflow-hidden">
        <aside
          id={PANEL_ID}
          aria-label="Source and configuration"
          inert={!panelOpen}
          className={`shrink-0 border-line bg-paper-deep max-lg:border-b lg:h-full lg:overflow-hidden lg:transition-[width] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            panelOpen ? `lg:border-r ${PANEL_WIDTH}` : 'max-lg:hidden lg:w-0'
          }`}
        >
          {/* Fixed-width inner column, so the panel slides out whole instead of squashing while the width animates. */}
          <div
            className={`flex flex-col lg:h-full lg:transition-[transform,opacity] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${PANEL_WIDTH} max-lg:w-full ${
              panelOpen ? '' : 'lg:-translate-x-10 lg:opacity-0'
            }`}
          >
            <LeftPanel onGenerate={handleGenerate} onStop={handleStop} generating={generating} onStatusChange={setStatus} />
          </div>
        </aside>

        <section
          aria-label="Output canvas"
          className="relative flex h-[calc(100dvh-6rem)] min-h-[520px] min-w-0 shrink-0 flex-col bg-white lg:h-full lg:min-h-0 lg:flex-1 lg:shrink"
        >
          {/* Canvas bar: panel toggle and page title left, live session readout right */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 border-b border-hair px-4 py-3 lg:px-5">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-expanded={panelOpen}
              aria-controls={PANEL_ID}
              aria-label={panelOpen ? 'Hide settings panel' : 'Show settings panel'}
              title={panelOpen ? 'Hide settings panel' : 'Show settings panel'}
              className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg text-[13px] font-medium ring-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 lg:h-10 ${
                panelOpen ? 'w-11 text-ink-soft ring-hair hover:bg-paper-deep hover:text-ink lg:w-10' : 'bg-ink px-3.5 text-paper ring-ink hover:bg-ink-soft'
              }`}
            >
              {panelOpen ? <PanelLeftClose className="h-[18px] w-[18px]" /> : <PanelLeftOpen className="h-4 w-4 text-matcha" />}
              {!panelOpen && <span>Settings</span>}
            </button>

            <div className="min-w-[13.5rem] flex-1">
              <p className="flex items-center gap-1 text-[12px] text-ink-mute">
                <span>Workspace</span>
                <ChevronRight className="h-3 w-3" aria-hidden />
                <span className="font-medium text-ink-soft">Transform</span>
              </p>
              <h1 className="mt-0.5 truncate text-[15.5px] font-semibold tracking-[-0.01em] text-ink">
                Find exactly what you need.
                <span className="ml-3 hidden text-[13px] font-normal tracking-normal text-ink-mute 2xl:inline">
                  Sankshep.ai : A gen-AI based Content Transformation Platform
                </span>
              </h1>
            </div>

            <SessionPanel
              drafts={session.drafts}
              lastMs={session.lastMs}
              generating={generating}
              engineLabel={status?.engineLabel ?? null}
              engineReady={status?.engineReady ?? true}
              onOpenHistory={onOpenHistory}
            />
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col">
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
              onStop={handleStop}
              canvasId={canvasId}
              pendingFormats={pendingFormats}
            />
          </div>
        </section>
      </div>

      {keyConsent && (
        <KeyConsentDialog error={keyConsent.error} onUseShared={acceptSharedKey} onCancel={() => setKeyConsent(null)} />
      )}
      {duplicateCheck && (
        <DuplicateFormatsDialog
          existing={duplicateCheck.existing}
          fresh={duplicateCheck.fresh}
          onOnlyNew={() => void runGeneration(duplicateCheck.cfg, 'merge', duplicateCheck.fresh)}
          onRegenerateAll={() => void runGeneration(duplicateCheck.cfg, 'replace', duplicateCheck.requested)}
          onCancel={() => setDuplicateCheck(null)}
        />
      )}
    </div>
  )
}

type RunMode = 'replace' | 'merge'

/**
 * Everything that shapes a draft apart from its format: the source, voice, audience, custom instructions
 * and models. Two Generates with the same key would write the same draft for a format; keys are left out,
 * since whose key wrote it doesn't change the brief. Images are compared by size and edges, not in full.
 */
function briefKey(cfg: LeftPanelConfig): string {
  return JSON.stringify({
    source: [cfg.inputType, cfg.sourceName, cfg.content, cfg.url ?? ''],
    images: cfg.images.map((img) => `${img.mimeType}:${img.data.length}:${img.data.slice(0, 48)}:${img.data.slice(-48)}`),
    voice: [cfg.tone, cfg.customSchema.trim()],
    audience: cfg.audience ? [cfg.audience.name.trim(), cfg.audience.description.trim()] : null,
    engine: [cfg.engine.mode, ...cfg.engine.models.map(refKey)],
  })
}

/** Formats every model on the canvas has a finished draft for; a failed draft doesn't count, so it's written again. */
function draftedFormats(runs: ModelRun[]): Set<OutputFormat> {
  const [first, ...rest] = runs
  const done = new Set<OutputFormat>()
  for (const [f, r] of Object.entries(first?.results ?? {}) as [OutputFormat, FormatResult][]) {
    if (r.status === 'success' && rest.every((run) => run.results[f]?.status === 'success')) done.add(f)
  }
  return done
}

/** The drafts a stopped run finished; the ones the stop cut off are dropped. */
function finishedOnly(results: Record<OutputFormat, FormatResult>): Record<OutputFormat, FormatResult> {
  return Object.fromEntries(Object.entries(results).filter(([, r]) => !r.stopped)) as Record<OutputFormat, FormatResult>
}

const PANEL_ID = 'ws-config-panel'
/** Sidebar width, shared by the aside and its inner column so the slide keeps the content's shape. */
const PANEL_WIDTH = 'lg:w-[400px] xl:w-[420px] 2xl:w-[440px]'

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
      className="flex w-full items-stretch overflow-hidden rounded-xl border border-hair bg-white sm:w-auto"
    >
      <dl className="flex min-w-0 flex-1 divide-x divide-hair">
        <div className="min-w-0 flex-1 px-3.5 py-1.5 lg:min-w-[96px]">
          <dt className="text-[11.5px] text-ink-mute">Engine</dt>
          <dd className="mt-0.5 flex h-5 items-center gap-2 text-[13.5px] font-semibold text-ink" aria-live="polite">
            <span className="relative flex h-2 w-2 shrink-0">
              {engine.ping && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${engine.dot}`} />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${engine.dot}`} />
            </span>
            <span className="truncate" title={engineLabel ?? undefined}>{engine.label}</span>
          </dd>
        </div>
        <div className="min-w-0 flex-1 px-3.5 py-1.5 lg:min-w-[96px]">
          <dt className="text-[11.5px] text-ink-mute">Drafts</dt>
          <dd className="mt-0.5 flex h-5 items-center text-[15px] font-semibold leading-none text-ink tabular-nums">{drafts}</dd>
        </div>
        <div className="hidden min-w-0 flex-1 px-3.5 py-1.5 sm:block lg:min-w-[96px]">
          <dt className="text-[11.5px] text-ink-mute">Last run</dt>
          <dd className="mt-0.5 flex h-5 items-center text-[15px] font-semibold leading-none text-ink tabular-nums">
            {lastMs === null ? <span className="text-[13.5px] font-medium text-ink-mute">No run yet</span> : `${(lastMs / 1000).toFixed(1)}s`}
          </dd>
        </div>
      </dl>

      {onOpenHistory && (
        <div className="flex shrink-0 items-center border-l border-hair bg-paper p-1">
          <button
            type="button"
            onClick={onOpenHistory}
            className="group flex h-full min-h-10 items-center gap-2 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-paper transition-[transform,background-color] duration-200 hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha active:scale-[0.98]"
          >
            History
            <ArrowUpRight className="h-4 w-4 text-matcha transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  )
}
