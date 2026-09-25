import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowUp, Check, CircleAlert, Copy, Download, Eye, Hourglass, Info, PanelLeft, PanelLeftClose, PenLine, TriangleAlert, WandSparkles, X,
} from 'lucide-react'
import type { OutputFormat, FormatResult, ModelRun } from '../lib/pipeline'
import { keyFallbackNotice, regenerateFormat } from '../lib/pipeline'
import { logActivity, previewOf, storedModel } from '../lib/activity'
import { providerInfo } from '../lib/providers'
import type { ToneOption } from '../lib/pipeline'
import { RichText } from './RichText'
import { ALL_FORMATS, STEP_IDS, StepNumber, toneLabel, type LeftPanelStatus } from './LeftPanel'
import type { RunContext } from './TransformView'
import { BrandMark } from '../components/site/SiteChrome'
import { buildPptx, fileSlug, saveFile, toPlainText, type ExportKind } from '../lib/exporters'

/**
 * A banner over the canvas. `warning` means the work went through but not the way the user set it up
 * (their own API key failed and the shared key stood in); `error` means it did not go through.
 */
export interface Notice {
  text: string
  kind: 'error' | 'warning' | 'info'
}

interface Props {
  /** One run per model; more than one means the user is comparing models. */
  runs: ModelRun[]
  runContext: RunContext | null
  parsedSource: string
  tone: ToneOption
  generating: boolean
  selectedFormats: OutputFormat[]
  /** A failed run, or information about how the run went (e.g. a long source was sampled, or the user's key failed). */
  notice: Notice | null
  onDismissNotice: () => void
  status: LeftPanelStatus | null
}

const EMPTY_QUOTE =
  'Transform your content into multiple formats. Upload your source, select your outputs, and generate accurate, editable drafts in seconds.'

const SHORT_LABEL: Partial<Record<OutputFormat, string>> = {
  'Twitter/X Post': 'X / Twitter',
  'PPT Presentation': 'Slide Deck',
  'Simplified Explanation': 'Simplified',
  'Language Translation': 'Translation',
}

function countWords(text: string) {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

export function RightPanel({ runs, runContext, parsedSource, tone, generating, selectedFormats, notice, onDismissNotice, status }: Props) {
  const comparing = runs.length > 1
  const results: Partial<Record<OutputFormat, FormatResult>> = runs[0]?.results ?? {}
  const [activeTab, setActiveTab] = useState<OutputFormat | null>(null)
  // Finished drafts open in Preview; Edit is one click away.
  const [viewMode, setViewMode] = useState<'editor' | 'mockup'>('mockup')
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  const [refinement, setRefinement] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [localResults, setLocalResults] = useState<Partial<Record<OutputFormat, FormatResult>>>({})
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // A new run replaces every draft; edits and refinements belong to the run they were made on.
  // It also opens in Preview again, even if the last run was left in Edit.
  useEffect(() => {
    setLocalResults({})
    setViewMode('mockup')
  }, [runs])

  // Merge API results with locally-regenerated overrides
  const merged: Partial<Record<OutputFormat, FormatResult>> = { ...results, ...localResults }

  // Determine active tab
  const tabs = selectedFormats.filter((f) => merged[f] || runs.some((r) => r.results[f]))
  const currentTab = activeTab && tabs.includes(activeTab) ? activeTab : tabs[0] ?? null
  const activeResult = currentTab ? merged[currentTab] : null
  const output = activeResult?.output ?? ''

  // Grow the editor with its content so the page scrolls, not the textarea.
  useLayoutEffect(() => {
    const el = editorRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [output, currentTab, viewMode, showSource])

  /* ─── Copy ──────────────────────────────────────────────────────────────── */
  const handleCopy = async () => {
    if (!activeResult?.output) return
    await navigator.clipboard.writeText(activeResult.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ─── Download ──────────────────────────────────────────────────────────── */
  // This panel's own banner (a failed export, or a refine that fell back to the shared key); it shows over `notice`.
  const [localNotice, setLocalNotice] = useState<Notice | null>(null)
  useEffect(() => { setLocalNotice(null) }, [currentTab, runs])

  const handleExport = async (kind: ExportKind) => {
    if (!activeResult?.output || !currentTab) return
    setLocalNotice(null)
    const name = fileSlug(currentTab === 'PPT Presentation' ? 'Slide Deck' : currentTab)
    try {
      if (kind === 'pptx') {
        saveFile(await buildPptx(activeResult.output, 'Slide Deck'), `${name}.pptx`)
      } else if (kind === 'txt') {
        saveFile(new Blob([toPlainText(activeResult.output)], { type: 'text/plain;charset=utf-8' }), `${name}.txt`)
      } else {
        saveFile(new Blob([activeResult.output], { type: 'text/markdown;charset=utf-8' }), `${name}.md`)
      }
    } catch (err) {
      setLocalNotice({ text: err instanceof Error ? err.message : String(err), kind: 'error' })
    }
  }

  /* ─── Regenerate (independent — only this tab) ──────────────────────────── */
  const handleRegenerate = async () => {
    if (!currentTab || !activeResult || !refinement.trim() || regenerating || !runContext) return
    setRegenerating(true)
    setLocalNotice(null)
    const t0 = Date.now()
    // Refine with the model and key that wrote the draft (refining is single-model only).
    const result = await regenerateFormat(
      currentTab,
      activeResult.output,
      refinement,
      parsedSource,
      tone,
      runs[0].ref,
      runContext.engine.keys,
      runContext.audience,
    )
    const model = storedModel(result)
    void logActivity({
      action: 'regenerate',
      ...previewOf(parsedSource),
      formats: [currentTab],
      tone,
      refinement: refinement.trim() || null,
      outputs: result.status === 'success' ? { [currentTab]: result.output } : null,
      models: model ? { [currentTab]: model } : null,
      status: result.status,
      success_count: result.status === 'success' ? 1 : 0,
      error_count: result.status === 'success' ? 0 : 1,
      error_message: result.error ?? null,
      duration_ms: Date.now() - t0,
    })
    // Only update the current tab — all other tabs are untouched
    setLocalResults((prev) => ({ ...prev, [currentTab]: result }))
    if (result.ownKeyFailure) {
      setLocalNotice({ text: keyFallbackNotice(runs[0].ref.provider, result.ownKeyFailure, 'this refined draft was written'), kind: 'warning' })
    }
    setRefinement('')
    setRegenerating(false)
  }

  const exportOptions: { kind: ExportKind; label: string; hint: string }[] = [
    ...(currentTab === 'PPT Presentation' ? [{ kind: 'pptx' as const, label: 'PowerPoint', hint: '.pptx' }] : []),
    { kind: 'md', label: 'Markdown', hint: '.md' },
    { kind: 'txt', label: 'Plain text', hint: '.txt' },
  ]

  const banner = localNotice ?? notice
  const noticeBanner = banner && (
    <div role="alert" className="sk-rise absolute left-1/2 top-6 z-20 flex w-[min(640px,calc(100%-3rem))] -translate-x-1/2 items-start gap-3 rounded-2xl bg-white px-4 py-3.5 text-[13px] text-ink sk-float">
      {banner.kind === 'error'
        ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        : banner.kind === 'warning'
          ? <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          : <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" />}
      <p className="flex-1 whitespace-pre-line leading-relaxed">{banner.text}</p>
      <button onClick={() => (localNotice ? setLocalNotice(null) : onDismissNotice())} aria-label="Dismiss" className="rounded-full p-1 text-ink-mute hover:bg-paper-deep hover:text-ink">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )

  /* ─── Loading state ─────────────────────────────────────────────────────── */
  if (generating && tabs.length === 0) {
    // Images are read by a vision model or on-device OCR before any writing starts, so they run longer.
    const imageSource = !!status?.sourceLabel && /\.(png|jpe?g|webp)$/i.test(status.sourceLabel)
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <CanvasHeader
          title="Output canvas"
          status={`Drafting ${selectedFormats.length} ${selectedFormats.length === 1 ? 'format' : 'formats'} · ${status?.engineLabel ?? ''}`}
        />
        <div className="flex-1 overflow-y-auto px-6 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-[640px]" aria-live="polite">
            {imageSource ? (
              <div className="flex items-start gap-3 rounded-xl bg-matcha/25 px-4 py-3.5 ring-1 ring-matcha-deep/60">
                <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                <div>
                  <p className="text-[14px] font-semibold text-ink">It might take a while since this is an image.</p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">We read the image first, then write each format in parallel. Keep this tab open.</p>
                </div>
              </div>
            ) : (
              <p className="text-[14px] text-ink-mute">
                Reading your source, then writing each format in parallel. This usually takes under a minute.
              </p>
            )}
            <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
              {selectedFormats.map((f, i) => (
                <li key={f} className="sk-rise flex items-center gap-4 px-4 py-3.5" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="w-40 shrink-0 truncate text-[14px] font-medium text-ink">{SHORT_LABEL[f] ?? f}</span>
                  <span className="sk-skeleton h-2 flex-1 rounded-full" />
                  <span className="text-[12.5px] text-ink-mute">Writing…</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Empty state: a quiet brief, then the same three steps as the left panel ── */
  if (tabs.length === 0) {
    const steps: { n: string; id: string; title: string; value: string; done: boolean }[] = [
      {
        n: '01', id: STEP_IDS.source, title: 'Source',
        value: status?.sourceLabel ?? 'Add a file, link or pasted text',
        done: !!status?.sourceLabel,
      },
      {
        n: '02', id: STEP_IDS.outputs, title: 'Outputs',
        value: status?.formats.length
          ? `${status.formats.length} ${status.formats.length === 1 ? 'format' : 'formats'} selected${status.hasCustomSchema ? ' · custom instructions' : ''}`
          : status?.hasCustomSchema ? 'Custom format from your instructions' : 'Choose at least one format',
        done: !!status && (status.formats.length > 0 || status.hasCustomSchema),
      },
      {
        n: '03', id: STEP_IDS.voice, title: 'Voice',
        value: status ? `${toneLabel(status.tone)} tone` : 'Professional tone',
        done: true,
      },
      {
        n: '04', id: STEP_IDS.audience, title: 'Audience',
        value: status && !status.audienceReady ? 'Custom profile needs a name' : status?.audienceLabel ?? 'No specific audience',
        done: status?.audienceReady ?? true,
      },
      {
        n: '05', id: STEP_IDS.engine, title: 'AI engine',
        value: status ? (status.engineReady ? status.engineLabel : `${status.engineLabel} · API key needed`) : 'Groq',
        done: status?.engineReady ?? true,
      },
    ]
    const queued = (status?.formats ?? [])
      .map((f) => ALL_FORMATS.find((m) => m.label === f))
      .filter((m): m is (typeof ALL_FORMATS)[number] => !!m)

    const focusStep = (id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      el.focus({ preventScroll: true })
    }

    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <CanvasHeader title="Output canvas" status="Nothing generated yet" />
        {noticeBanner}
        <div className="flex-1 overflow-y-auto px-6 py-10 sm:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-[640px]">
            <blockquote className="max-w-[46ch] font-serif text-[clamp(1.15rem,1.5vw,1.35rem)] leading-[1.5] text-ink-soft [text-wrap:pretty]">
              “{EMPTY_QUOTE}”
            </blockquote>

            <h3 className="mt-10 text-[13px] font-semibold text-ink">Before you generate</h3>
            <ol className="mt-3 divide-y divide-line rounded-xl border border-line">
              {steps.map((s) => (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => focusStep(s.id)}
                    className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none"
                  >
                    <StepNumber n={s.n} done={s.done} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-ink">{s.title}</span>
                      <span className="block truncate text-[13px] text-ink-mute">{s.value}</span>
                    </span>
                    <span className="text-[12.5px] font-medium text-ink-soft underline decoration-ink/0 underline-offset-4 transition-colors group-hover:decoration-ink/40">
                      {s.done ? 'Edit' : 'Go to step'}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <h3 className="mt-10 flex items-baseline justify-between text-[13px] font-semibold text-ink">
              Drafts you'll get
              <span className="font-normal text-ink-mute">{queued.length + (status?.hasCustomSchema && queued.length === 0 ? 1 : 0)}</span>
            </h3>
            {queued.length > 0 ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {queued.map(({ label, short, desc, icon: Icon }) => (
                  <li key={label} className="flex items-center gap-3 rounded-xl bg-paper px-3.5 py-3">
                    <Icon className="h-[18px] w-[18px] shrink-0 text-ink" strokeWidth={1.8} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium text-ink">
                        {short}{label === 'Language Translation' && status?.targetLanguage ? ` → ${status.targetLanguage}` : ''}
                      </span>
                      <span className="block truncate text-[12px] text-ink-mute">{desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : status?.hasCustomSchema ? (
              <p className="mt-3 rounded-xl bg-paper px-3.5 py-3 text-[13.5px] text-ink">One draft following your custom instructions.</p>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-ink/25 px-3.5 py-3 text-[13.5px] text-ink-mute">
                No formats selected. Pick them in step 02 and they'll be listed here.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ─── Main output view ──────────────────────────────────────────────────── */
  const words = countWords(output)
  const isError = activeResult?.status === 'error'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {noticeBanner}

      {/* Toolbar */}
      <div className="flex min-h-[68px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 lg:px-5">
        {/* Format switcher: segmented control */}
        <div role="tablist" aria-label="Generated formats" className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-paper-deep/80 p-1 ring-1 ring-hair">
          {tabs.map((fmt) => {
            const r = comparing ? runs.map((run) => run.results[fmt]).find((x) => x?.status === 'error') : merged[fmt]
            const active = fmt === currentTab
            return (
              <button
                key={fmt}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(fmt)}
                className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 ${
                  active
                    ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(231,228,217,0.9),0_2px_8px_-3px_rgba(15,16,15,0.18)]'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {r?.status === 'error' && <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-label="failed" />}
                {SHORT_LABEL[fmt] ?? fmt}
              </button>
            )
          })}
        </div>

        {comparing ? (
          <p className="text-[13px] text-ink-mute">
            Comparing <span className="font-mono font-medium text-ink tabular-nums">{runs.length}</span> models
            {runContext?.imageReadBy && <> · image read with <span className="font-mono text-[12px] text-ink">{runContext.imageReadBy}</span></>}
          </p>
        ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full bg-paper-deep/80 p-1 ring-1 ring-hair">
            {([['editor', 'Edit', PenLine], ['mockup', 'Preview', Eye]] as const).map(([mode, label, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-all ${
                  viewMode === mode ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(231,228,217,0.9)]' : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <IconButton label={showSource ? 'Hide source' : 'Show parsed source'} onClick={() => setShowSource((v) => !v)} active={showSource} className="hidden xl:flex">
            {showSource ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </IconButton>
          <IconButton label={copied ? 'Copied' : 'Copy'} onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </IconButton>
          <DownloadMenu options={exportOptions} onPick={handleExport} disabled={!output || isError} />
        </div>
        )}
      </div>

      {comparing && currentTab ? (
        <CompareView runs={runs} format={currentTab} />
      ) : (

      <div className="flex min-h-0 flex-1">
        {/* Parsed source drawer */}
        {showSource && (
          <aside className="hidden w-[340px] shrink-0 flex-col border-r border-line bg-paper-deep/50 xl:flex">
            <div className="flex items-center justify-between border-b border-hair px-6 py-3.5">
              <p className="text-[12.5px] font-semibold text-ink-mute">Parsed source</p>
              <p className="font-mono text-[11px] text-ink-mute">{countWords(parsedSource).toLocaleString()} words</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="whitespace-pre-wrap text-[13px] leading-[1.75] text-ink-soft">{parsedSource || 'Source will appear here after generation.'}</p>
            </div>
          </aside>
        )}

        {/* Reading canvas */}
        <div className="relative min-w-0 flex-1 bg-paper">
          <div className="h-full overflow-y-auto px-4 pb-44 pt-8 sm:px-8">
            {isError ? (
              <div className="sk-sheet mx-auto max-w-[720px] rounded-2xl bg-white px-8 py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <CircleAlert className="h-5 w-5" />
                </span>
                <p className="mt-5 font-serif text-[26px] text-ink">This draft didn’t come through.</p>
                <p className="mx-auto mt-2 max-w-md font-mono text-[12px] leading-relaxed text-red-800">{activeResult?.error}</p>
                <p className="mt-4 text-[13px] text-ink-soft">Describe a change below to try this format again.</p>
              </div>
            ) : viewMode === 'editor' ? (
              <article className="sk-sheet mx-auto max-w-[760px] rounded-2xl bg-white px-7 py-10 sm:px-14 sm:py-14">
                <header className="mb-8 border-b border-hair pb-7">
                  <p className="text-[12.5px] font-semibold text-ink-mute">
                    Draft · {toneLabel(tone).toLowerCase()}{runContext?.audience && <> · for {runContext.audience.name}</>}
                  </p>
                  <h2 className="mt-3 font-display text-[clamp(1.9rem,3vw,2.6rem)] font-bold text-ink">{currentTab}</h2>
                  <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px] text-ink-mute">
                    <span>{words.toLocaleString()} words</span>
                    <span>{Math.max(1, Math.ceil(words / 230))} min read</span>
                    <span>{output.length.toLocaleString()} chars</span>
                    {activeResult?.model && <span>{activeResult.model}</span>}
                    {runContext?.imageReadBy && <span>image read with {runContext.imageReadBy}</span>}
                  </p>
                </header>
                <textarea
                  ref={editorRef}
                  value={output}
                  onChange={(e) => {
                    if (!currentTab) return
                    setLocalResults((prev) => ({
                      ...prev,
                      [currentTab]: { ...activeResult!, output: e.target.value },
                    }))
                  }}
                  aria-label={`${currentTab} draft`}
                  className="block w-full resize-none overflow-hidden bg-transparent text-[16.5px] leading-[1.8] text-ink/90 caret-ink outline-none selection:bg-matcha/60"
                  placeholder="Generated content will appear here…"
                  spellCheck
                />
              </article>
            ) : (
              <MockupView format={currentTab!} content={output} />
            )}
          </div>

          {/* Floating refine composer */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/90 to-transparent px-4 pb-6 pt-16 sm:px-8">
            <form
              onSubmit={(e) => { e.preventDefault(); void handleRegenerate() }}
              className="sk-float pointer-events-auto mx-auto flex max-w-[760px] items-center gap-2 rounded-2xl bg-white p-2 transition-shadow focus-within:shadow-[0_0_0_1px_rgba(15,16,15,0.3),0_0_0_5px_rgba(212,237,100,0.35),0_12px_40px_-14px_rgba(15,16,15,0.22)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-paper-deep text-ink-soft">
                <WandSparkles className="h-[18px] w-[18px]" />
              </span>
              <input
                type="text"
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder={`Refine this ${SHORT_LABEL[currentTab!] ?? currentTab}: “shorter”, “add a risk table”…`}
                className="min-w-0 flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-mute"
              />
              <span className="hidden font-mono text-[10.5px] text-ink-mute md:block">this draft only</span>
              <button
                type="submit"
                disabled={regenerating || !refinement.trim()}
                className="flex h-11 shrink-0 items-center gap-2 rounded-[15px] bg-ink px-5 text-[13.5px] font-semibold text-paper transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:opacity-40"
              >
                {regenerating ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{regenerating ? 'Refining…' : 'Refine'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

function CanvasHeader({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-line px-6 pb-5 pt-6 sm:px-10">
      <h2 className="font-display text-[22px] font-bold text-ink">{title}</h2>
      <p className="text-[13px] text-ink-mute">{status}</p>
    </div>
  )
}

function IconButton({ label, onClick, active, className = '', children }: {
  label: string
  onClick: () => void
  active?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 active:translate-y-0 ${
        active ? 'bg-ink text-paper ring-ink' : 'bg-white text-ink-soft ring-hair hover:text-ink hover:ring-ink/20'
      } ${className}`}
    >
      {children}
    </button>
  )
}

/** Download button with a small menu of file types; closes on pick, outside click or Escape. */
function DownloadMenu({ options, onPick, disabled }: {
  options: { kind: ExportKind; label: string; hint: string }[]
  onPick: (kind: ExportKind) => Promise<void>
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<ExportKind | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = async (kind: ExportKind) => {
    setBusy(kind)
    await onPick(kind)
    setBusy(null)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Download"
        aria-label="Download"
        className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40 ${
          open ? 'bg-ink text-paper ring-ink' : 'bg-white text-ink-soft ring-hair hover:text-ink hover:ring-ink/20'
        }`}
      >
        <Download className="h-4 w-4" />
      </button>

      {open && (
        <div role="menu" aria-label="Download as" className="sk-float sk-pop absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl bg-white p-1.5">
          <p className="px-2.5 pb-1.5 pt-1 text-[11.5px] font-medium text-ink-mute">Download as</p>
          {options.map((o) => (
            <button
              key={o.kind}
              role="menuitem"
              type="button"
              onClick={() => void pick(o.kind)}
              disabled={busy !== null}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-ink transition-colors hover:bg-paper-deep focus-visible:bg-paper-deep focus-visible:outline-none disabled:opacity-60"
            >
              {o.label}
              {busy === o.kind
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" aria-label="Preparing" />
                : <span className="font-mono text-[11.5px] text-ink-mute">{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Mockup renderer ─────────────────────────────────────────────────────── */

function MockupView({ format, content }: { format: OutputFormat; content: string }) {
  if (!content) return <p className="text-center text-[13px] text-ink-mute">No content yet.</p>

  if (format === 'LinkedIn Post') {
    return (
      <div className="sk-sheet mx-auto max-w-[560px] rounded-2xl bg-white p-6">
        <div className="flex items-center gap-3">
          <BrandMark className="h-11 w-11 rounded-full" />
          <div>
            <p className="text-[14px] font-semibold text-ink">Sankshep.ai</p>
            <p className="text-[11.5px] text-ink-mute">AI Content Platform · Just now</p>
          </div>
        </div>
        <div className="mt-2 [&_p]:text-[14.5px] [&_p]:leading-[1.7]"><RichText text={content} /></div>
      </div>
    )
  }

  if (format === 'Twitter/X Post') {
    const tweets = content.split(/\n\d+\//).filter(Boolean)
    return (
      <div className="mx-auto max-w-[520px] space-y-3">
        {tweets.map((tw, i) => (
          <div key={i} className="sk-sheet rounded-2xl bg-white p-5">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-9 w-9 rounded-full" />
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Sankshep.ai</p>
                <p className="font-mono text-[10.5px] text-ink-mute">@sankshepai</p>
              </div>
              <span className="ml-auto font-mono text-[10.5px] text-ink-mute">{i + 1}/{tweets.length}</span>
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.65] text-ink">{tw.trim()}</p>
          </div>
        ))}
      </div>
    )
  }

  if (format === 'Executive Summary') {
    return (
      <div className="sk-sheet mx-auto max-w-[760px] rounded-2xl bg-white px-8 py-10 sm:px-14 sm:py-14">
        <div className="mb-7 border-b-2 border-ink pb-5">
          <p className="text-[12.5px] font-semibold text-ink-mute">Executive brief</p>
          <h2 className="mt-2 font-display text-[30px] text-ink">Executive Summary</h2>
        </div>
        <RichText text={content.replace(/^\s*[#*\s]*executive summary\**\s*\n/i, '')} />
      </div>
    )
  }

  // Default: clean document
  return (
    <article className="sk-sheet mx-auto max-w-[760px] rounded-2xl bg-white px-8 py-10 sm:px-14 sm:py-14">
      <span className="rounded-md bg-matcha/40 px-2 py-1 text-[12.5px] font-semibold text-ink">{format}</span>
      <div className="mt-6"><RichText text={content} /></div>
    </article>
  )
}

/* ─── Model comparison ────────────────────────────────────────────────────── */

/** One column per model for the chosen format, so the same brief can be read across models. */
function CompareView({ runs, format }: { runs: ModelRun[]; format: OutputFormat }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-paper">
      <div className="grid gap-4 p-4 sm:p-6 md:auto-cols-[minmax(300px,1fr)] md:grid-flow-col">
        {runs.map((run, i) => (
          <CompareColumn key={`${run.ref.provider}:${run.ref.model}`} run={run} format={format} letter={String.fromCharCode(65 + i)} />
        ))}
      </div>
    </div>
  )
}

function CompareColumn({ run, format, letter }: { run: ModelRun; format: OutputFormat; letter: string }) {
  const [copied, setCopied] = useState(false)
  const result = run.results[format]
  const text = result?.status === 'success' ? result.output : ''
  const words = countWords(text)

  const copy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <article aria-label={`Model ${letter}: ${run.ref.model}`} className="sk-sheet flex min-w-0 flex-col self-start rounded-2xl bg-white">
      <header className="flex items-start gap-3 border-b border-hair px-5 py-4">
        <StepNumber n={letter} done />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-ink-mute">{providerInfo(run.ref.provider).name}</p>
          <p className="truncate font-mono text-[13px] text-ink" title={result?.model ?? run.ref.model}>{result?.model ?? run.ref.model}</p>
        </div>
        <IconButton label={copied ? 'Copied' : `Copy model ${letter} draft`} onClick={copy}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </IconButton>
      </header>

      {!result ? (
        <p className="px-5 py-8 text-[13.5px] text-ink-mute">This model wasn't asked for this format.</p>
      ) : result.status === 'error' ? (
        <div className="px-5 py-8">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-red-700">
            <CircleAlert className="h-4 w-4" /> This model's draft failed
          </p>
          <p className="mt-2 font-mono text-[12px] leading-relaxed text-red-800">{result.error}</p>
        </div>
      ) : (
        <>
          <p className="flex gap-4 border-b border-hair px-5 py-2.5 font-mono text-[11.5px] text-ink-mute">
            <span>{words.toLocaleString()} words</span>
            <span>{text.length.toLocaleString()} chars</span>
          </p>
          <div className="px-5 py-5 [&_p]:text-[14.5px] [&_p]:leading-[1.7]">
            <RichText text={text} />
          </div>
        </>
      )}
    </article>
  )
}
