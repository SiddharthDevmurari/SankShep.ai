import { useState } from 'react'
import { Copy, Check, Download, RefreshCw, Eye, Code2 } from 'lucide-react'
import type { OutputFormat, FormatResult } from '../lib/pipeline'
import { regenerateFormat } from '../lib/pipeline'
import type { ToneOption } from '../lib/pipeline'

interface Props {
  results: Partial<Record<OutputFormat, FormatResult>>
  parsedSource: string
  tone: ToneOption
  generating: boolean
  selectedFormats: OutputFormat[]
}

export function RightPanel({ results, parsedSource, tone, generating, selectedFormats }: Props) {
  const [activeTab, setActiveTab] = useState<OutputFormat | null>(null)
  const [viewMode, setViewMode] = useState<'editor' | 'mockup'>('editor')
  const [copied, setCopied] = useState(false)
  const [refinement, setRefinement] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [localResults, setLocalResults] = useState<Partial<Record<OutputFormat, FormatResult>>>({})

  // Merge API results with locally-regenerated overrides
  const merged: Partial<Record<OutputFormat, FormatResult>> = { ...results, ...localResults }

  // Determine active tab
  const tabs = selectedFormats.filter((f) => merged[f])
  const currentTab = activeTab && tabs.includes(activeTab) ? activeTab : tabs[0] ?? null
  const activeResult = currentTab ? merged[currentTab] : null

  /* ─── Copy ──────────────────────────────────────────────────────────────── */
  const handleCopy = async () => {
    if (!activeResult?.output) return
    await navigator.clipboard.writeText(activeResult.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ─── Export ────────────────────────────────────────────────────────────── */
  const handleExport = () => {
    if (!activeResult?.output || !currentTab) return
    const ext = currentTab === 'PPT Presentation' ? 'txt' : 'md'
    const blob = new Blob([activeResult.output], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${currentTab.replace(/\s+/g, '_').toLowerCase()}_output.${ext}`
    a.click()
  }

  /* ─── Regenerate (independent — only this tab) ──────────────────────────── */
  const handleRegenerate = async () => {
    if (!currentTab || !activeResult) return
    setRegenerating(true)
    const result = await regenerateFormat(
      currentTab,
      activeResult.output,
      refinement,
      parsedSource,
      tone,
    )
    // Only update the current tab — all other tabs are untouched
    setLocalResults((prev) => ({ ...prev, [currentTab]: result }))
    setRefinement('')
    setRegenerating(false)
  }

  /* ─── Export label ──────────────────────────────────────────────────────── */
  const exportLabel = (() => {
    if (!currentTab) return 'Export'
    const map: Partial<Record<OutputFormat, string>> = {
      'PPT Presentation': 'Export as .pptx (text)',
      'Video': 'Export Script (.txt)',
      'LinkedIn Post': 'Export as .md',
      'Twitter/X Post': 'Export Thread (.txt)',
    }
    return map[currentTab] ?? 'Export as .md'
  })()

  /* ─── Empty / Loading state ─────────────────────────────────────────────── */
  if (generating && tabs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-8">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-hair border-t-matcha-deep" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-matcha-deep animate-pulse" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-ink">Generating your content</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Running parallel AI pipeline across {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''}…
          </p>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {selectedFormats.map((f) => (
            <span key={f} className="rounded-full border border-hair bg-white px-2.5 py-1 text-[11px] text-ink-soft animate-pulse">
              {f}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (tabs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-8">
        <div className="h-16 w-16 rounded-2xl bg-paper-deep flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-ink-soft/40" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <p className="font-medium text-ink-soft/70">Output canvas</p>
        <p className="text-[13px] text-ink-soft/50 max-w-xs">
          Configure your source content and formats on the left, then hit Generate to see results here.
        </p>
      </div>
    )
  }

  /* ─── Main output view ──────────────────────────────────────────────────── */
  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-hair px-4 pt-2 pb-0 scrollbar-thin">
        {tabs.map((fmt) => {
          const r = merged[fmt]
          const isActive = fmt === currentTab
          return (
            <button
              key={fmt}
              onClick={() => setActiveTab(fmt)}
              className={`relative shrink-0 rounded-t-lg px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-white text-ink border border-b-0 border-hair'
                  : 'text-ink-soft hover:text-ink hover:bg-paper-deep/60'
              }`}
            >
              {fmt}
              {r?.status === 'error' && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[9px] text-red-600">!</span>
              )}
              {generating && !r && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-matcha-deep animate-pulse" />
              )}
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-hair bg-white px-4 py-2">
        {/* View toggle */}
        <div className="flex rounded-lg border border-hair bg-paper-deep p-0.5 gap-0.5">
          <button
            onClick={() => setViewMode('editor')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-all ${viewMode === 'editor' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
          >
            <Code2 className="h-3 w-3" /> Editor
          </button>
          <button
            onClick={() => setViewMode('mockup')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-all ${viewMode === 'mockup' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
          >
            <Eye className="h-3 w-3" /> Mockup
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-hair bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition-all hover:border-ink/20 hover:text-ink"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 rounded-lg border border-hair bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition-all hover:border-ink/20 hover:text-ink"
          >
            <Download className="h-3.5 w-3.5" />
            {exportLabel}
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: parsed source */}
        <div className="hidden xl:flex w-[38%] flex-col border-r border-hair bg-paper-deep/40">
          <p className="shrink-0 border-b border-hair px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/60">
            Parsed Source
          </p>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">{parsedSource || 'Source will appear here after generation.'}</p>
          </div>
        </div>

        {/* Right: generated output */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {activeResult?.status === 'error' ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 max-w-sm">
                <p className="font-medium text-red-700">Generation failed</p>
                <p className="mt-1 text-[12.5px] text-red-600/80">{activeResult.error}</p>
              </div>
            </div>
          ) : viewMode === 'editor' ? (
            <textarea
              value={activeResult?.output ?? ''}
              onChange={(e) => {
                if (!currentTab) return
                setLocalResults((prev) => ({
                  ...prev,
                  [currentTab]: { ...activeResult!, output: e.target.value },
                }))
              }}
              className="flex-1 resize-none bg-white px-5 py-4 text-[13.5px] leading-relaxed text-ink outline-none font-mono"
              placeholder="Generated content will appear here…"
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 overflow-y-auto bg-white px-5 py-4">
              <MockupView format={currentTab!} content={activeResult?.output ?? ''} />
            </div>
          )}

          {/* Regeneration bar */}
          <div className="shrink-0 border-t border-hair bg-white px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/60">
              Refine this output
              <span className="ml-2 font-normal normal-case tracking-normal text-ink-soft/40">(won't affect other tabs)</span>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleRegenerate()}
                placeholder='e.g. "Make it shorter" · "Add a risk table" · "More formal tone"'
                className="flex-1 rounded-xl border border-hair bg-paper-deep/60 px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-ink/25 focus:ring-2 focus:ring-ink/8 placeholder:text-ink-soft/40"
              />
              <button
                onClick={handleRegenerate}
                disabled={regenerating || !refinement.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 shrink-0"
              >
                {regenerating ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                [ Regenerate with Changes ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mockup renderer ─────────────────────────────────────────────────────── */

function MockupView({ format, content }: { format: OutputFormat; content: string }) {
  if (!content) return <p className="text-[13px] text-ink-soft/50">No content yet.</p>

  if (format === 'LinkedIn Post') {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-hair bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-ink flex items-center justify-center text-paper font-bold text-sm">S</div>
          <div>
            <p className="text-[14px] font-semibold">Sankshep.ai</p>
            <p className="text-[11px] text-ink-soft/60">AI Content Platform · Just now</p>
          </div>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    )
  }

  if (format === 'Twitter/X Post') {
    const tweets = content.split(/\n\d+\//).filter(Boolean)
    return (
      <div className="mx-auto max-w-md space-y-3">
        {tweets.map((tw, i) => (
          <div key={i} className="rounded-2xl border border-hair bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-ink flex items-center justify-center text-paper text-xs font-bold">S</div>
              <div>
                <p className="text-[13px] font-semibold">Sankshep.ai</p>
                <p className="text-[10px] text-ink-soft/60">@sankshepai</p>
              </div>
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed">{tw.trim()}</p>
          </div>
        ))}
      </div>
    )
  }

  if (format === 'Executive Summary') {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-hair bg-white p-8 shadow-sm">
        <div className="border-b-2 border-ink pb-4 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/60">Executive Brief</p>
          <h2 className="font-display text-[22px] text-ink mt-1">Executive Summary</h2>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{content}</p>
        </div>
      </div>
    )
  }

  // Default: clean document
  return (
    <div className="mx-auto max-w-2xl">
      <article className="rounded-2xl border border-hair bg-white p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-matcha/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">{format}</span>
        </div>
        <div className="mt-4 whitespace-pre-wrap text-[14px] leading-[1.75] text-ink">{content}</div>
      </article>
    </div>
  )
}
