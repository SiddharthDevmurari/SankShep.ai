import { useState } from 'react'
import { LeftPanel, type LeftPanelConfig } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { runPipeline, type OutputFormat, type FormatResult } from '../lib/pipeline'
import { hasGroqKey } from '../lib/groq'
import type { ToneOption } from '../lib/pipeline'

export function TransformView() {
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<Partial<Record<OutputFormat, FormatResult>>>({})
  const [parsedSource, setParsedSource] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>([])
  const [tone, setTone] = useState<ToneOption>('Professional')

  const handleGenerate = async (cfg: LeftPanelConfig) => {
    if (!hasGroqKey) {
      alert(
        '⚠️ No Groq API key found.\n\n' +
        'Add VITE_GROQ_KEY_1=your_key_here to your .env.local file, then restart the dev server.\n\n' +
        'Get a free key at https://console.groq.com',
      )
      return
    }

    setGenerating(true)
    setResults({})
    setParsedSource('')
    setSelectedFormats(cfg.formats)
    setTone(cfg.tone)

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
    } catch (err) {
      console.error('Pipeline error:', err)
      alert(`Generation failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — fixed width */}
      <div className="w-[340px] shrink-0 border-r border-hair bg-paper-deep/30 overflow-y-auto">
        <LeftPanel onGenerate={handleGenerate} generating={generating} />
      </div>

      {/* Right panel — fills remaining space */}
      <div className="flex-1 overflow-hidden bg-white">
        <RightPanel
          results={results}
          parsedSource={parsedSource}
          tone={tone}
          generating={generating}
          selectedFormats={selectedFormats}
        />
      </div>
    </div>
  )
}
