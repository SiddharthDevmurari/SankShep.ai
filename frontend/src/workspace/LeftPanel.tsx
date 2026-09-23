import { useState, useRef, useCallback } from 'react'
import { Upload, Link2, FileText, Clipboard, X, ChevronDown, Check } from 'lucide-react'
import type { OutputFormat, ToneOption } from '../lib/pipeline'

export interface LeftPanelConfig {
  content: string
  formats: OutputFormat[]
  tone: ToneOption
  customSchema: string
  targetLanguage: string
}

const ALL_FORMATS: { label: OutputFormat; desc: string }[] = [
  { label: 'Video', desc: 'Script + storyboard + narration' },
  { label: 'LinkedIn Post', desc: 'Max 3,000 characters' },
  { label: 'Twitter/X Post', desc: '280 chars / thread' },
  { label: 'Advisory', desc: 'Structured advisory doc' },
  { label: 'Infographic', desc: 'Layout + key messaging' },
  { label: 'Executive Summary', desc: 'Concise C-suite brief' },
  { label: 'PPT Presentation', desc: 'Slides + speaker notes' },
  { label: 'Blog Post', desc: 'SEO long-form article' },
  { label: 'Simplified Explanation', desc: 'Plain language for anyone' },
  { label: 'Language Translation', desc: 'Translate to another language' },
]

const TONES: ToneOption[] = ['Professional', 'Technical', 'Casual-friendly', 'Academic']

const LANGUAGES = ['Hindi', 'Gujarati', 'Marathi', 'Bengali', 'Telugu', 'Tamil']

interface Props {
  onGenerate: (cfg: LeftPanelConfig) => void
  generating: boolean
}

type InputMode = 'file' | 'url' | 'text'

export function LeftPanel({ onGenerate, generating }: Props) {
  const [inputMode, setInputMode] = useState<InputMode>('file')
  const [rawText, setRawText] = useState('')
  const [urlValue, setUrlValue] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')

  const [formats, setFormats] = useState<OutputFormat[]>(['Executive Summary'])
  const [tone, setTone] = useState<ToneOption>('Professional')
  const [customSchema, setCustomSchema] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('Hindi')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const showLangField = formats.includes('Language Translation')

  /* ─── File handling ─────────────────────────────────────────────────────── */

  const processFile = useCallback(async (file: File) => {
    if (file.size > 30 * 1024 * 1024) {
      alert('File exceeds 30 MB limit.')
      return
    }
    setUploadedFile(file)
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      const text = await file.text()
      setExtractedText(text)
    } else {
      // For PDF/DOCX we just send the filename as placeholder — real extraction needs a backend
      setExtractedText(`[File: ${file.name} — ${(file.size / 1024).toFixed(0)} KB]\n\nNote: Binary file content. Please paste the text content directly in "Paste Text" mode for AI processing, or set up server-side parsing.`)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  /* ─── Format toggle ─────────────────────────────────────────────────────── */

  const toggleFormat = (f: OutputFormat) => {
    setFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )
  }

  /* ─── Resolve content string ────────────────────────────────────────────── */

  const resolveContent = (): string => {
    if (inputMode === 'text') return rawText
    if (inputMode === 'url') return `[URL: ${urlValue}]\n\nPlease extract and summarise the content from this URL: ${urlValue}`
    return extractedText || rawText
  }

  /* ─── Generate ──────────────────────────────────────────────────────────── */

  const handleGenerate = () => {
    const content = resolveContent()
    if (!content.trim()) { alert('Please provide source content first.'); return }
    if (formats.length === 0 && !customSchema.trim()) {
      alert('Select at least one output format, or describe a custom format above.')
      return
    }
    // When no standard format is selected but a custom schema is provided,
    // pipeline handles it as a standalone "Custom Format" generation.
    onGenerate({ content, formats, tone, customSchema, targetLanguage })
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-5 py-5">

      {/* ── Section: Data Ingestion ─────────────────────────────────────────── */}
      <div>
        <Label>Source Content</Label>

        {/* Mode tabs */}
        <div className="mt-1.5 flex rounded-xl border border-hair bg-paper-deep p-1 gap-1">
          {(['file', 'url', 'text'] as InputMode[]).map((m) => {
            const icons = { file: <Upload className="h-3.5 w-3.5" />, url: <Link2 className="h-3.5 w-3.5" />, text: <Clipboard className="h-3.5 w-3.5" /> }
            const labels = { file: 'File', url: 'URL', text: 'Paste' }
            return (
              <button
                key={m}
                onClick={() => setInputMode(m)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-medium transition-all ${
                  inputMode === m ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {icons[m]}{labels[m]}
              </button>
            )
          })}
        </div>

        {/* File drop zone */}
        {inputMode === 'file' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-2 cursor-pointer rounded-xl border-2 border-dashed transition-all ${
              dragOver ? 'border-matcha-deep bg-matcha/10' : 'border-hair bg-white hover:border-ink/20 hover:bg-paper-deep/50'
            } p-5 text-center`}
          >
            <input ref={fileInputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.txt,.csv,.json" onChange={onFileChange} />
            {uploadedFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <FileText className="h-5 w-5 text-matcha-deep shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-ink truncate max-w-[160px]">{uploadedFile.name}</p>
                    <p className="text-[11px] text-ink-soft">{(uploadedFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setExtractedText('') }}
                  className="rounded-full p-1 hover:bg-paper-deep text-ink-soft hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-7 w-7 text-ink-soft/50" />
                <p className="mt-2 text-[13px] font-medium text-ink-soft">Drop file or click to browse</p>
                <p className="mt-0.5 text-[11px] text-ink-soft/60">PNG · JPG · WEBP · PDF · DOCX · TXT · CSV · JSON — max 30 MB</p>
              </>
            )}
          </div>
        )}

        {/* URL input */}
        {inputMode === 'url' && (
          <div className="mt-2 flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 rounded-xl border border-hair bg-white px-4 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 placeholder:text-ink-soft/50"
            />
          </div>
        )}

        {/* Paste text */}
        {inputMode === 'text' && (
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your report, article, research paper, or any text here…"
            className="mt-2 w-full rounded-xl border border-hair bg-white px-4 py-3 text-[13.5px] text-ink outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 placeholder:text-ink-soft/50 resize-none"
            rows={6}
          />
        )}
      </div>

      {/* ── Section: Custom Schema ──────────────────────────────────────────── */}
      <div>
        <Label>The custom format with AI <span className="ml-1 text-ink-soft/50 font-normal">(optional)</span></Label>
        <textarea
          value={customSchema}
          onChange={(e) => setCustomSchema(e.target.value)}
          placeholder='e.g. "Start with a risk table, use bullet points only, max 3 paragraphs, end with an action checklist."'
          className="mt-1.5 w-full rounded-xl border border-hair bg-white px-4 py-3 text-[13px] text-ink outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8 placeholder:text-ink-soft/40 resize-none"
          rows={3}
        />
      </div>

      {/* ── Section: Output Formats ─────────────────────────────────────────── */}
      <div>
        <Label>Output Formats <span className="ml-1 text-[11px] text-ink-soft/60">{formats.length} selected</span></Label>
        <div className="mt-1.5 grid grid-cols-1 gap-1.5">
          {ALL_FORMATS.map(({ label, desc }) => {
            const selected = formats.includes(label)
            return (
              <button
                key={label}
                onClick={() => toggleFormat(label)}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                  selected
                    ? 'border-ink/20 bg-ink text-paper'
                    : 'border-hair bg-white text-ink hover:border-ink/15 hover:bg-paper-deep/50'
                }`}
              >
                <span className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border ${selected ? 'border-paper/30 bg-paper/10' : 'border-hair'}`}>
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <div className="min-w-0">
                  <p className={`text-[13px] font-medium leading-tight ${selected ? 'text-paper' : 'text-ink'}`}>{label}</p>
                  <p className={`text-[11px] leading-tight ${selected ? 'text-paper/55' : 'text-ink-soft/60'}`}>{desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Section: Tone ───────────────────────────────────────────────────── */}
      <div>
        <Label>Tone</Label>
        <div className="relative mt-1.5">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ToneOption)}
            className="w-full appearance-none rounded-xl border border-hair bg-white px-4 py-2.5 pr-10 text-[13.5px] text-ink outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/8"
          >
            {TONES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
        </div>
      </div>

      {/* ── Section: Language (conditional) ────────────────────────────────── */}
      {showLangField && (
        <div className="animate-[sk-rise_0.3s_ease_both]">
          <Label>Select language for translation</Label>
          <div className="relative mt-1.5">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full appearance-none rounded-xl border border-matcha-deep/40 bg-matcha/10 px-4 py-2.5 pr-10 text-[13.5px] text-ink outline-none focus:border-matcha-deep/70 focus:ring-2 focus:ring-matcha/30"
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
          </div>
        </div>
      )}

      {/* ── Generate button ─────────────────────────────────────────────────── */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="sticky bottom-0 mt-auto flex w-full items-center justify-center gap-2.5 rounded-xl bg-ink px-5 py-3.5 text-[14px] font-semibold text-paper shadow-[0_4px_20px_-8px_rgba(15,16,15,0.6)] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            Generating…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
            </svg>
            Generate
          </>
        )}
      </button>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-ink-soft">{children}</p>
}
