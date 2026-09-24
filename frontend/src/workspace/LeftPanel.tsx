import { useState, useRef, useCallback, useEffect } from 'react'
import {
  AlignLeft, AtSign, Briefcase, Check, ChartPie, Clapperboard, FileText, Globe, Languages,
  Lightbulb, Link2, Newspaper, Presentation, ShieldAlert, Upload, X,
} from 'lucide-react'
import type { OutputFormat, ToneOption } from '../lib/pipeline'
import type { InputType } from '../lib/activity'

export interface LeftPanelConfig {
  content: string
  formats: OutputFormat[]
  tone: ToneOption
  customSchema: string
  targetLanguage: string
  inputType: InputType
  sourceName: string | null
}

/** Live view of the form, so the output canvas can mirror the same three steps. */
export interface LeftPanelStatus {
  sourceLabel: string | null
  formats: OutputFormat[]
  hasCustomSchema: boolean
  tone: ToneOption
  targetLanguage: string | null
}

export const STEP_IDS = { source: 'ws-step-source', outputs: 'ws-step-outputs', voice: 'ws-step-voice' } as const

export const ALL_FORMATS: { label: OutputFormat; short: string; desc: string; icon: typeof FileText }[] = [
  { label: 'Executive Summary', short: 'Executive Summary', desc: 'C-suite brief', icon: FileText },
  { label: 'LinkedIn Post', short: 'LinkedIn Post', desc: 'Up to 3,000 chars', icon: Briefcase },
  { label: 'Twitter/X Post', short: 'X / Twitter', desc: 'Hook + thread', icon: AtSign },
  { label: 'Video', short: 'Video', desc: 'Script & storyboard', icon: Clapperboard },
  { label: 'PPT Presentation', short: 'Slide Deck', desc: 'Slides + notes', icon: Presentation },
  { label: 'Blog Post', short: 'Blog Post', desc: 'SEO long-form', icon: Newspaper },
  { label: 'Advisory', short: 'Advisory', desc: 'Findings & actions', icon: ShieldAlert },
  { label: 'Infographic', short: 'Infographic', desc: 'Stats & layout', icon: ChartPie },
  { label: 'Simplified Explanation', short: 'Simplified', desc: 'Plain language', icon: Lightbulb },
  { label: 'Language Translation', short: 'Translation', desc: 'Indian languages', icon: Languages },
]

const TONES: { value: ToneOption; note: string }[] = [
  { value: 'Professional', note: 'polished' },
  { value: 'Technical', note: 'precise' },
  { value: 'Casual-friendly', note: 'conversational' },
  { value: 'Academic', note: 'scholarly' },
]

const LANGUAGES = ['Hindi', 'Gujarati', 'Marathi', 'Bengali', 'Telugu', 'Tamil']

const SCHEMA_SUGGESTIONS = ['Risk table first', 'Bullets only', 'Action checklist']

const MAX_FILE_BYTES = 30 * 1024 * 1024

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function isTextFile(file: File) {
  return file.type.startsWith('text/') || /\.(txt|csv|json|md)$/i.test(file.name)
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function toneLabel(t: ToneOption) {
  return t === 'Casual-friendly' ? 'Casual' : t
}

interface Props {
  onGenerate: (cfg: LeftPanelConfig) => void
  generating: boolean
  onStatusChange?: (status: LeftPanelStatus) => void
}

type InputMode = InputType

const INPUT_MODES: { id: InputMode; label: string; icon: typeof FileText }[] = [
  { id: 'file', label: 'Upload', icon: Upload },
  { id: 'url', label: 'Link', icon: Link2 },
  { id: 'text', label: 'Paste', icon: AlignLeft },
]

const FIELD_FOCUS = 'focus-within:border-ink focus-within:ring-4 focus-within:ring-matcha/50'

export function LeftPanel({ onGenerate, generating, onStatusChange }: Props) {
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
  const [formError, setFormError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const showLangField = formats.includes('Language Translation')

  /* ─── File handling ─────────────────────────────────────────────────────── */

  const processFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setFormError(`“${file.name}” is ${formatBytes(file.size)}. The limit is 30 MB.`)
      return
    }
    setFormError(null)
    setUploadedFile(file)
    if (isTextFile(file)) {
      setExtractedText(await file.text())
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
    e.target.value = '' // allow re-selecting the same file
  }

  const clearFile = () => {
    setUploadedFile(null)
    setExtractedText('')
  }

  /* ─── Format toggle ─────────────────────────────────────────────────────── */

  const toggleFormat = (f: OutputFormat) => {
    setFormError(null)
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  const allSelected = formats.length === ALL_FORMATS.length
  const toggleAll = () => {
    setFormError(null)
    setFormats(allSelected ? [] : ALL_FORMATS.map((f) => f.label))
  }

  const addSuggestion = (s: string) => {
    setCustomSchema((prev) => (prev.trim() ? `${prev.trim().replace(/[.,;]$/, '')}, ${s.toLowerCase()}.` : `${s}.`))
  }

  /* ─── Resolve content string ────────────────────────────────────────────── */

  const resolveContent = (): string => {
    if (inputMode === 'text') return rawText
    if (inputMode === 'url') {
      return urlValue.trim()
        ? `[URL: ${urlValue}]\n\nPlease extract and summarise the content from this URL: ${urlValue}`
        : ''
    }
    return extractedText || rawText
  }

  /* ─── Generate ──────────────────────────────────────────────────────────── */

  const handleGenerate = () => {
    if (generating) return
    const content = resolveContent()
    if (!content.trim()) {
      setFormError(
        inputMode === 'file' ? 'Upload a file to use as your source.'
        : inputMode === 'url' ? 'Paste a link to use as your source.'
        : 'Paste some text to use as your source.',
      )
      return
    }
    if (formats.length === 0 && !customSchema.trim()) {
      setFormError('Pick at least one output format, or describe a custom format.')
      return
    }
    setFormError(null)
    // When no standard format is selected but a custom schema is provided,
    // pipeline handles it as a standalone "Custom Format" generation.
    const sourceName =
      inputMode === 'url' ? urlValue.trim() || null
      : inputMode === 'file' ? uploadedFile?.name ?? null
      : null
    onGenerate({ content, formats, tone, customSchema, targetLanguage, inputType: inputMode, sourceName })
  }

  // Cmd/Ctrl + Enter generates from anywhere inside the panel.
  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const outputCount = formats.length + (customSchema.trim() && formats.length === 0 ? 1 : 0)
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0

  const sourceLabel =
    inputMode === 'file' ? uploadedFile?.name ?? null
    : inputMode === 'url' ? urlValue.trim() || null
    : wordCount ? `${wordCount.toLocaleString()} words pasted` : null

  const hasCustomSchema = !!customSchema.trim()
  const langForStatus = showLangField ? targetLanguage : null
  useEffect(() => {
    onStatusChange?.({ sourceLabel, formats, hasCustomSchema, tone, targetLanguage: langForStatus })
  }, [onStatusChange, sourceLabel, formats, hasCustomSchema, tone, langForStatus])

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onPanelKeyDown}>
      {/* Panel header */}
      <div className="shrink-0 border-b border-line px-6 pb-5 pt-6 lg:px-7">
        <h2 className="font-display text-[22px] font-bold text-ink">Source &amp; configuration</h2>
        <p className="mt-1.5 text-[13.5px] text-ink-mute">Three steps, then review and generate.</p>
      </div>

      <div className="flex-1 divide-y divide-line lg:overflow-y-auto">

        {/* ── 01 Source ──────────────────────────────────────────────────── */}
        <Step id={STEP_IDS.source} n="01" title="Source" hint="What should we work from?" done={!!sourceLabel}>
          <div role="tablist" aria-label="Source type" className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-white p-1">
            {INPUT_MODES.map(({ id, label, icon: Icon }) => {
              const active = inputMode === id
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setInputMode(id); setFormError(null) }}
                  className={`flex h-10 items-center justify-center gap-2 rounded-lg text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                    active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Upload: the whole zone is the one control — no second button inside it */}
          {inputMode === 'file' && (
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.txt,.csv,.json,.md"
                onChange={onFileChange}
              />
              {uploadedFile ? (
                <div className="sk-pop flex items-center gap-3.5 rounded-xl border border-line bg-white p-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-matcha font-mono text-[11px] font-semibold uppercase text-ink">
                    {uploadedFile.name.split('.').pop()?.slice(0, 4) || 'file'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-ink">{uploadedFile.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-mute">
                      {formatBytes(uploadedFile.size)} · {isTextFile(uploadedFile) ? `${extractedText.length.toLocaleString()} characters read` : 'attached'}
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                  >
                    Replace
                  </button>
                  <button
                    onClick={clearFile}
                    aria-label="Remove file"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Choose a source file, or drop one here"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`flex min-h-[148px] cursor-pointer flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed px-6 py-8 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50 ${
                    dragOver ? 'border-ink bg-matcha/30' : 'border-ink/25 bg-white hover:border-ink/50'
                  }`}
                >
                  <p className="font-display text-[19px] font-bold text-ink [text-wrap:balance]">
                    {dragOver ? 'Release to add this file' : 'Drop a file, or click to choose one'}
                  </p>
                  <p className="mt-2 text-[13px] text-ink-mute">PDF, DOCX, TXT, CSV, JSON or an image · up to 30 MB</p>
                </div>
              )}
            </div>
          )}

          {/* Link */}
          {inputMode === 'url' && (
            <div className="mt-3">
              <label className={`flex h-12 items-center gap-3 rounded-xl border border-line bg-white px-4 transition-shadow ${FIELD_FOCUS}`}>
                <Globe className="h-[18px] w-[18px] shrink-0 text-ink-mute" />
                <span className="sr-only">Source link</span>
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => { setUrlValue(e.target.value); setFormError(null) }}
                  placeholder="https://example.com/report"
                  className="min-w-0 flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-mute"
                />
              </label>
              <p className="mt-2 text-[12.5px] text-ink-mute">Articles, reports and public pages work best.</p>
            </div>
          )}

          {/* Paste */}
          {inputMode === 'text' && (
            <div className={`relative mt-3 rounded-xl border border-line bg-white transition-shadow ${FIELD_FOCUS}`}>
              <textarea
                value={rawText}
                onChange={(e) => { setRawText(e.target.value); setFormError(null) }}
                placeholder="Paste a report, article, research paper or notes…"
                aria-label="Source text"
                rows={8}
                className="block w-full resize-none rounded-xl bg-transparent px-4 pb-9 pt-3.5 text-[14.5px] leading-[1.7] text-ink outline-none placeholder:text-ink-mute"
              />
              <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[12px] tabular-nums text-ink-mute">
                {wordCount.toLocaleString()} words
              </span>
            </div>
          )}
        </Step>

        {/* ── 02 Outputs ─────────────────────────────────────────────────── */}
        <Step
          id={STEP_IDS.outputs}
          n="02"
          title="Outputs"
          hint="Each format is drafted in parallel."
          done={outputCount > 0}
          action={
            <button
              type="button"
              onClick={toggleAll}
              className="whitespace-nowrap rounded-md text-[13px] font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_FORMATS.map(({ label, short, desc, icon: Icon }) => {
              const selected = formats.includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleFormat(label)}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 active:scale-[0.99] ${
                    selected ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink/40'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${selected ? 'text-matcha' : 'text-ink-mute group-hover:text-ink'}`} strokeWidth={1.8} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold leading-tight">{short}</span>
                    <span className={`mt-0.5 block truncate text-[12px] leading-tight ${selected ? 'text-paper/75' : 'text-ink-mute'}`}>{desc}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      selected ? 'border-matcha bg-matcha text-ink' : 'border-ink/25 bg-white'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Translation target (only when Translation is selected) */}
          {showLangField && (
            <fieldset className="sk-rise mt-4 rounded-xl border border-line bg-white p-3.5">
              <legend className="flex items-center gap-2 px-1 text-[13px] font-semibold text-ink">
                <Languages className="h-4 w-4" /> Translate into
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={targetLanguage === l}
                    onClick={() => setTargetLanguage(l)}
                    className={`rounded-lg py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                      targetLanguage === l ? 'bg-ink text-paper' : 'bg-paper-deep text-ink-soft hover:text-ink'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </Step>

        {/* ── 03 Voice ───────────────────────────────────────────────────── */}
        <Step id={STEP_IDS.voice} n="03" title="Voice" hint="Tone applies to every draft. Instructions are optional." done>
          <div role="radiogroup" aria-label="Tone" className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {TONES.map(({ value, note }) => {
              const active = tone === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTone(value)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                    active ? 'border-ink bg-white text-ink ring-1 ring-ink' : 'border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  <span className="block text-[13.5px] font-semibold">{toneLabel(value)}</span>
                  <span className="block font-serif text-[14px] text-ink-mute">{note}</span>
                </button>
              )
            })}
          </div>

          <label htmlFor="ws-custom-format" className="mt-5 flex items-baseline justify-between text-[13px] font-semibold text-ink">
            Custom instructions
            <span className="text-[12px] font-normal text-ink-mute">Optional</span>
          </label>
          <div className={`mt-2 rounded-xl border border-line bg-white transition-shadow ${FIELD_FOCUS}`}>
            <textarea
              id="ws-custom-format"
              value={customSchema}
              onChange={(e) => { setCustomSchema(e.target.value); setFormError(null) }}
              placeholder="e.g. Start with a one-line verdict, then a risk table, then three recommendations…"
              rows={3}
              className="block w-full resize-none rounded-t-xl bg-transparent px-4 pt-3 text-[14.5px] leading-[1.65] text-ink outline-none placeholder:text-ink-mute"
            />
            <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {SCHEMA_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSuggestion(s)}
                    className="rounded-lg border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-soft transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                  >
                    + {s}
                  </button>
                ))}
              </div>
              {customSchema && (
                <button
                  type="button"
                  onClick={() => setCustomSchema('')}
                  className="shrink-0 rounded-md text-[12.5px] font-medium text-ink-soft underline decoration-ink/30 underline-offset-4 hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </Step>
      </div>

      {/* ── Review + generate ────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-line bg-paper-deep px-6 pb-6 pt-5 lg:px-7">
        {formError && (
          <p role="alert" className="sk-rise mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-800">
            {formError}
          </p>
        )}

        <dl className="grid grid-cols-3 overflow-hidden rounded-xl border border-line bg-white" aria-label="Generation summary">
          <SummaryCell label="Source" value={sourceLabel ?? 'Not added'} missing={!sourceLabel} />
          <SummaryCell
            label="Drafts"
            value={outputCount === 0 ? 'None chosen' : `${outputCount} ${outputCount === 1 ? 'format' : 'formats'}`}
            missing={outputCount === 0}
          />
          <SummaryCell label="Tone" value={`${toneLabel(tone)}${showLangField ? ` · ${targetLanguage}` : ''}`} />
        </dl>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="relative mt-3 flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-ink text-[15.5px] font-semibold text-paper transition-[transform,background-color] duration-200 hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha active:scale-[0.99] disabled:cursor-wait disabled:hover:bg-ink"
        >
          {generating && <span className="sk-sweep pointer-events-none absolute bottom-0 left-0 h-[3px] w-1/3 bg-matcha" />}
          <span>
            {generating ? 'Drafting…' : outputCount > 1 ? `Generate ${outputCount} drafts` : 'Generate draft'}
          </span>
          {!generating && (
            <span className="hidden items-center gap-1 text-[12px] font-medium text-paper/70 sm:flex" aria-hidden>
              <kbd className="rounded border border-paper/25 px-1.5 py-0.5 font-sans">{isMac ? '⌘' : 'Ctrl'}</kbd>
              <kbd className="rounded border border-paper/25 px-1.5 py-0.5 font-sans">↵</kbd>
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

function SummaryCell({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="min-w-0 border-r border-line px-3.5 py-3 last:border-r-0">
      <dt className="text-[12px] text-ink-mute">{label}</dt>
      <dd className={`mt-0.5 truncate text-[14px] font-semibold ${missing ? 'font-medium text-ink-mute' : 'text-ink'}`} title={value}>{value}</dd>
    </div>
  )
}

function Step({ id, n, title, hint, done, action, children }: {
  id: string
  n: string
  title: string
  hint?: string
  done?: boolean
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} tabIndex={-1} className="scroll-mt-4 px-6 py-6 outline-none lg:px-7">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <StepNumber n={n} done={done} />
          <div>
            <h3 id={`${id}-title`} className="text-[15.5px] font-semibold leading-7 text-ink">{title}</h3>
            {hint && <p className="text-[13px] text-ink-mute">{hint}</p>}
          </div>
        </div>
        {action && <div className="pt-1">{action}</div>}
      </header>
      {children}
    </section>
  )
}

/** Shared by the config panel and the empty canvas so both read as the same three steps. */
export function StepNumber({ n, done }: { n: string; done?: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-semibold tabular-nums ${
        done ? 'bg-ink text-matcha' : 'border border-ink/30 bg-white text-ink'
      }`}
    >
      {n}
    </span>
  )
}
