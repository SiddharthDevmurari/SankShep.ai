import { useState } from 'react'
import { LeftPanel, type LeftPanelConfig, type LeftPanelStatus } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { runPipeline, type OutputFormat, type FormatResult } from '../lib/pipeline'
import { hasGroqKey } from '../lib/groq'
import type { ToneOption } from '../lib/pipeline'
import { logActivity, previewOf, summariseResults } from '../lib/activity'

export function TransformView() {
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<Partial<Record<OutputFormat, FormatResult>>>({})
  const [parsedSource, setParsedSource] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>([])
  const [tone, setTone] = useState<ToneOption>('Professional')
  const [notice, setNotice] = useState<string | null>(null)
  const [status, setStatus] = useState<LeftPanelStatus | null>(null)

  const handleGenerate = async (cfg: LeftPanelConfig) => {
    if (!hasGroqKey) {
      setNotice('No Groq API key is configured. Add VITE_GROQ_KEY_1 to .env.local (or your Vercel environment variables) and restart the dev server.')
      return
    }

    setNotice(null)
    setGenerating(true)
    setResults({})
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
        formats: cfg.formats,
        tone: cfg.tone,
        customSchema: cfg.customSchema,
        targetLanguage: cfg.targetLanguage,
      })
      setParsedSource(output.parsedSource)
      setResults(output.results)

      const summary = summariseResults(output.results)
      void logActivity({
        ...baseLog,
        formats: Object.keys(output.results),
        outputs: summary.outputs,
        status: summary.status,
        success_count: summary.successCount,
        error_count: summary.errorCount,
        error_message: summary.errorMessage,
        duration_ms: output.durationMs,
      })
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
      setNotice(`Generation failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-10">

        {/* Page header: the one display-size line on the page */}
        <header className="border-b border-line pb-8 pt-10 lg:pb-10 lg:pt-12">
          <p className="text-[13.5px] font-semibold text-ink-soft">AI workspace</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4rem)] font-bold text-ink [text-wrap:balance]">
            Find exactly what you need.
          </h1>
          <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-mute">
            Sankshep.ai : A gen-AI based Content Transformation Platform
          </p>
        </header>

        {/* Two environments: a paper-toned control desk and a white output canvas */}
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(420px,5fr)_minmax(0,7fr)] lg:gap-8">
          <aside
            aria-label="Source and configuration"
            className="flex flex-col rounded-2xl border border-line bg-paper-deep/70 lg:h-[max(680px,calc(100dvh-7rem))] lg:overflow-hidden"
          >
            <LeftPanel onGenerate={handleGenerate} generating={generating} onStatusChange={setStatus} />
          </aside>

          <section
            aria-label="Output canvas"
            className="sk-card relative flex min-h-[640px] flex-col overflow-hidden rounded-2xl border border-ink bg-white lg:h-[max(680px,calc(100dvh-7rem))] lg:min-h-0"
          >
            <RightPanel
              results={results}
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
