import { useState, useRef, useCallback, useEffect } from 'react'
import {
  AlignLeft, AtSign, Briefcase, Check, ChartPie, ChevronDown, Clapperboard, Eye, EyeOff, FileText, Globe, Languages,
  Lightbulb, Link2, Newspaper, Plus, Presentation, ShieldAlert, Upload, X,
} from 'lucide-react'
import { AUDIENCE_PRESETS, type Audience, type EngineConfig, type EngineMode, type OutputFormat, type ToneOption } from '../lib/pipeline'
import type { InputType } from '../lib/activity'
import {
  DEFAULT_MODEL, PROVIDERS, canWrite, hasKey, modelInfo, parseRefKey, providerInfo, refKey,
  type ApiKeys, type ImageInput, type ModelKind, type ProviderId,
} from '../lib/providers'
import { describeReader, pickImageReader } from '../lib/ingest'
import { extractDocument, isDocumentFile } from '../lib/documents'

export interface LeftPanelConfig {
  content: string
  images: ImageInput[]
  /** A link to read as the source; fetched when the run starts. */
  url?: string
  formats: OutputFormat[]
  tone: ToneOption
  customSchema: string
  targetLanguage: string
  inputType: InputType
  sourceName: string | null
  audience: Audience | null
  engine: EngineConfig
}

/** Live view of the form, so the output canvas can mirror the same steps. */
export interface LeftPanelStatus {
  audienceLabel: string | null
  engineLabel: string
  /** Every selected provider has a key to use. */
  engineReady: boolean
  sourceLabel: string | null
  formats: OutputFormat[]
  hasCustomSchema: boolean
  tone: ToneOption
  targetLanguage: string | null
}

export const STEP_IDS = {
  source: 'ws-step-source',
  outputs: 'ws-step-outputs',
  voice: 'ws-step-voice',
  audience: 'ws-step-audience',
  engine: 'ws-step-engine',
} as const

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

export const MAX_FILE_BYTES = 30 * 1024 * 1024
// Mistral caps images at 10 MB; Gemini's inline limit is higher, so 10 MB works everywhere.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_COMPARE = 3

const KIND_LABEL: Record<ModelKind, string> = {
  chat: 'text',
  vision: 'text + images',
  'speech-to-text': 'speech-to-text, can’t draft',
  'text-to-speech': 'text-to-speech, can’t draft',
  'safety-classifier': 'safety classifier, can’t draft',
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function isTextFile(file: File) {
  return file.type.startsWith('text/') || /\.(txt|csv|json|md)$/i.test(file.name)
}

/** Legacy Word files use a binary format the in-browser parser can't read. */
function isLegacyOfficeFile(file: File) {
  return /\.(doc|ppt|xls)$/i.test(file.name)
}

function isImageFile(file: File) {
  return file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name)
}

/** Longest side sent to a vision model: legible for text, and small enough for the shared-key service's 4.5 MB request limit. */
const MAX_IMAGE_SIDE = 2000

/** Reads an image, scaling it down to MAX_IMAGE_SIDE as JPEG when it is larger. */
async function readAsImageInput(file: File): Promise<ImageInput> {
  const url = await readAsDataUrl(file)
  const img = new Image()
  img.src = url
  await img.decode()
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
    return { mimeType: file.type || 'image/png', data: url.slice(url.indexOf(',') + 1) }
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff' // JPEG has no transparency; keep transparent areas white, not black.
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const jpeg = canvas.toDataURL('image/jpeg', 0.88)
  return { mimeType: 'image/jpeg', data: jpeg.slice(jpeg.indexOf(',') + 1) }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}

/** "qwen/qwen3.8-27b" → "qwen3.8-27b" for tight spaces. */
function shortModelId(model: string) {
  return model.includes('/') ? model.slice(model.lastIndexOf('/') + 1) : model
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
  // An uploaded image, or a scanned PDF's pages; read at generate time.
  const [images, setImages] = useState<ImageInput[]>([])
  const [scanNote, setScanNote] = useState<string | null>(null)
  // True while a PDF/DOCX is being turned into text; Generate waits for it.
  const [parsing, setParsing] = useState(false)
  // Bumped on every new file or clear, so a slow parse can't land on top of a newer choice.
  const fileToken = useRef(0)

  const [formats, setFormats] = useState<OutputFormat[]>(['Executive Summary'])
  const [tone, setTone] = useState<ToneOption>('Professional')
  const [customSchema, setCustomSchema] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('Hindi')
  const [formError, setFormError] = useState<string | null>(null)

  // 04 Audience: a preset name, 'custom', or null for no specific audience
  const [audienceChoice, setAudienceChoice] = useState<string | null>(null)
  const [customAudience, setCustomAudience] = useState<Audience>({ name: '', description: '' })
  const [audienceOpen, setAudienceOpen] = useState(false)

  // 05 Engine
  const [engineMode, setEngineMode] = useState<EngineMode>('single')
  const [singleModel, setSingleModel] = useState(refKey(DEFAULT_MODEL))
  const [compareModels, setCompareModels] = useState<string[]>([refKey(DEFAULT_MODEL), 'groq:openai/gpt-oss-20b'])
  const [keys, setKeys] = useState<ApiKeys>({})
  const [engineOpen, setEngineOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const showLangField = formats.includes('Language Translation')

  const selectedRefs = (engineMode === 'single' ? [singleModel] : compareModels).map(parseRefKey)
  const usedProviders = [...new Set(selectedRefs.map((r) => r.provider))]
  const missingKey = usedProviders.find((p) => !hasKey(p, keys)) ?? null

  const audience: Audience | null =
    audienceChoice === 'custom' ? (customAudience.name.trim() ? customAudience : null)
    : AUDIENCE_PRESETS.find((a) => a.name === audienceChoice) ?? null

  /* ─── File handling ─────────────────────────────────────────────────────── */

  const processFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setFormError(`“${file.name}” is ${formatBytes(file.size)}. The limit is 30 MB.`)
      return
    }
    if (isImageFile(file) && file.size > MAX_IMAGE_BYTES) {
      setFormError(`“${file.name}” is ${formatBytes(file.size)}. Images can be up to 10 MB.`)
      return
    }
    const token = ++fileToken.current
    const current = () => token === fileToken.current
    const reject = (message: string) => {
      if (!current()) return
      setUploadedFile(null)
      setExtractedText('')
      setImages([])
      setFormError(message)
    }
    setFormError(null)
    setUploadedFile(file)
    setExtractedText('')
    setImages([])
    setScanNote(null)
    setParsing(false)

    if (isImageFile(file)) {
      // Images are read at generate time by a vision model or on-device OCR (lib/ingest.ts).
      try {
        const img = await readAsImageInput(file)
        if (current()) setImages([img])
      } catch {
        reject(`Couldn't read “${file.name}”. Try saving it again as PNG or JPG.`)
      }
    } else if (isTextFile(file)) {
      try {
        const text = (await file.text()).trim()
        if (!text) return reject(`“${file.name}” is empty.`)
        if (current()) setExtractedText(text)
      } catch {
        reject(`Couldn't read “${file.name}”. Try saving it again as UTF-8 text.`)
      }
    } else if (isDocumentFile(file)) {
      // PDF/DOCX are parsed here, so the pipeline never sees the binary file (lib/documents.ts).
      setParsing(true)
      try {
        const doc = await extractDocument(file)
        if (!current()) return
        setExtractedText(doc.text)
        setImages(doc.pageImages)
        if (doc.pageImages.length) {
          setScanNote(
            doc.pageCount > doc.pageImages.length
              ? `scanned, first ${doc.pageImages.length} of ${doc.pageCount} pages will be read`
              : `scanned, ${doc.pageImages.length} ${doc.pageImages.length === 1 ? 'page' : 'pages'} will be read`,
          )
        }
      } catch (err) {
        reject(err instanceof Error ? err.message : String(err))
      } finally {
        if (current()) setParsing(false)
      }
    } else if (isLegacyOfficeFile(file)) {
      reject(`“${file.name}” is an old Office format. Save it as .docx or PDF and upload it again.`)
    } else {
      reject(`“${file.name}” isn't a supported file. Upload a PDF, DOCX, TXT, CSV, JSON, Markdown or image file.`)
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
    fileToken.current++
    setParsing(false)
    setUploadedFile(null)
    setExtractedText('')
    setImages([])
    setScanNote(null)
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
    if (inputMode === 'url') return ''
    return extractedText
  }

  /* ─── Generate ──────────────────────────────────────────────────────────── */

  const openStep = (id: string, open: () => void) => {
    open()
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  const handleGenerate = () => {
    if (generating) return
    if (inputMode === 'file' && parsing) {
      setFormError(`Still reading “${uploadedFile?.name}”. Generate again in a moment.`)
      return
    }
    const content = resolveContent()
    const sourceImages = inputMode === 'file' ? images : []
    const url = inputMode === 'url' ? urlValue.trim() : ''
    if (url && !/^(https?:\/\/)?[^\s/]+\.[^\s]{2,}/i.test(url)) {
      setFormError('That doesn’t look like a web address. Paste the full link, starting with https://.')
      return
    }
    if (!content.trim() && sourceImages.length === 0 && !url) {
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
    if (audienceChoice === 'custom' && !customAudience.name.trim()) {
      setFormError('Give your custom audience a profile name, or pick one of the presets.')
      openStep(STEP_IDS.audience, () => setAudienceOpen(true))
      return
    }
    if (engineMode === 'compare' && new Set(compareModels).size < compareModels.length) {
      setFormError('Each model in the comparison must be different.')
      openStep(STEP_IDS.engine, () => setEngineOpen(true))
      return
    }
    if (missingKey) {
      setFormError(`Add your ${providerInfo(missingKey).name} API key to use ${selectedRefs.find((r) => r.provider === missingKey)!.model}.`)
      openStep(STEP_IDS.engine, () => setEngineOpen(true))
      return
    }
    setFormError(null)
    // When no standard format is selected but a custom schema is provided,
    // pipeline handles it as a standalone "Custom Format" generation.
    const sourceName =
      inputMode === 'url' ? urlValue.trim() || null
      : inputMode === 'file' ? uploadedFile?.name ?? null
      : null
    onGenerate({
      content, images: sourceImages, url: url || undefined, formats, tone, customSchema, targetLanguage, inputType: inputMode, sourceName, audience,
      engine: { mode: engineMode, models: selectedRefs, keys },
    })
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
  const audienceLabel = audience?.name.trim() || null
  const engineLabel = engineMode === 'single'
    ? `${providerInfo(selectedRefs[0].provider).name} · ${shortModelId(selectedRefs[0].model)}`
    : `Comparing ${selectedRefs.length} models`
  const engineReady = !missingKey
  useEffect(() => {
    onStatusChange?.({ sourceLabel, formats, hasCustomSchema, tone, targetLanguage: langForStatus, audienceLabel, engineLabel, engineReady })
  }, [onStatusChange, sourceLabel, formats, hasCustomSchema, tone, langForStatus, audienceLabel, engineLabel, engineReady])

  const imageReader = images.length ? describeReader(pickImageReader(selectedRefs, keys)) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onPanelKeyDown}>
      {/* Panel header */}
      <div className="shrink-0 border-b border-line px-6 pb-5 pt-6 lg:px-7">
        <h2 className="font-display text-[22px] font-bold text-ink">Source &amp; configuration</h2>
        <p className="mt-1.5 text-[13.5px] text-ink-mute">Five steps, then review and generate. Audience and engine start from defaults.</p>
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
                      {formatBytes(uploadedFile.size)} · {
                        imageReader ? <>{scanNote ?? 'image'}, read with <span className="font-mono text-[12px] text-ink">{imageReader}</span></>
                        : parsing ? 'reading text…'
                        : `${extractedText.length.toLocaleString()} characters read`
                      }
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

        {/* ── 04 Audience ────────────────────────────────────────────────── */}
        <Step
          id={STEP_IDS.audience}
          n="04"
          title="Audience"
          hint="Who reads these drafts. Optional."
          done={!!audience}
          collapsible={{
            open: audienceOpen,
            onToggle: () => setAudienceOpen((v) => !v),
            summary: audienceChoice === 'custom' && !audience ? 'Custom profile needs a name' : audience?.name ?? 'No specific audience',
            warn: audienceChoice === 'custom' && !audience,
          }}
        >
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Target audience">
            {AUDIENCE_PRESETS.map(({ name }) => {
              const active = audienceChoice === name
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setAudienceChoice(active ? null : name); setFormError(null) }}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-left text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 active:scale-[0.99] ${
                    active ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  {name}
                </button>
              )
            })}
            <button
              type="button"
              aria-pressed={audienceChoice === 'custom'}
              aria-expanded={audienceChoice === 'custom'}
              aria-controls="ws-custom-audience"
              onClick={() => { setAudienceChoice(audienceChoice === 'custom' ? null : 'custom'); setFormError(null) }}
              className={`col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                audienceChoice === 'custom' ? 'border-ink bg-ink text-paper' : 'border-dashed border-ink/30 bg-white text-ink-soft hover:border-ink/60 hover:text-ink'
              }`}
            >
              {audienceChoice === 'custom' ? <Check className="h-4 w-4 text-matcha" /> : <Plus className="h-4 w-4" />}
              Custom Audience
            </button>
          </div>

          {audience && audienceChoice !== 'custom' && (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">
              <span className="font-medium text-ink">Writes for:</span> {audience.description}
            </p>
          )}

          {audienceChoice === 'custom' && (
            <div id="ws-custom-audience" className="sk-rise mt-3 space-y-3 rounded-xl border border-line bg-paper p-3.5">
              <label className="block">
                <span className="text-[13px] font-semibold text-ink">Profile name</span>
                <span className={`mt-1.5 flex h-11 items-center rounded-lg border border-line bg-white px-3.5 transition-shadow ${FIELD_FOCUS}`}>
                  <input
                    type="text"
                    value={customAudience.name}
                    onChange={(e) => { setCustomAudience((a) => ({ ...a, name: e.target.value })); setFormError(null) }}
                    placeholder="e.g. Gen Z tech enthusiasts"
                    maxLength={80}
                    className="min-w-0 flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-mute"
                  />
                </span>
              </label>
              <label className="block">
                <span className="flex items-baseline justify-between text-[13px] font-semibold text-ink">
                  Description
                  <span className="text-[12px] font-normal text-ink-mute">What they know, what they care about</span>
                </span>
                <span className={`mt-1.5 block rounded-lg border border-line bg-white transition-shadow ${FIELD_FOCUS}`}>
                  <textarea
                    value={customAudience.description}
                    onChange={(e) => setCustomAudience((a) => ({ ...a, description: e.target.value }))}
                    placeholder="e.g. 18 to 25, early adopters, skim on mobile, distrust corporate language"
                    rows={3}
                    maxLength={600}
                    className="block w-full resize-none rounded-lg bg-transparent px-3.5 py-2.5 text-[14px] leading-[1.6] text-ink outline-none placeholder:text-ink-mute"
                  />
                </span>
              </label>
            </div>
          )}
        </Step>

        {/* ── 05 Engine ──────────────────────────────────────────────────── */}
        <Step
          id={STEP_IDS.engine}
          n="05"
          title="AI engine & provider"
          hint="Your model, your key."
          done={engineReady}
          collapsible={{
            open: engineOpen,
            onToggle: () => setEngineOpen((v) => !v),
            summary: missingKey ? `${providerInfo(missingKey).name} key needed` : engineLabel,
            warn: !!missingKey,
          }}
        >
          <div role="radiogroup" aria-label="Engine mode" className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white p-1">
            {([['single', 'Single provider'], ['compare', 'Compare models']] as const).map(([mode, label]) => {
              const active = engineMode === mode
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => { setEngineMode(mode); setFormError(null) }}
                  className={`flex h-10 items-center justify-center rounded-lg text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                    active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {engineMode === 'single' ? (
            <div className="mt-3">
              <ModelSelect label="Model" value={singleModel} onChange={(v) => { setSingleModel(v); setFormError(null) }} />
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-[13px] text-ink-mute">Each model drafts every selected format. Results appear side by side.</p>
              <ol className="mt-2.5 space-y-2">
                {compareModels.map((value, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 font-mono text-[12px] font-semibold text-ink-mute tabular-nums">{String.fromCharCode(65 + i)}</span>
                    <div className="min-w-0 flex-1">
                      <ModelSelect
                        label={`Model ${String.fromCharCode(65 + i)}`}
                        hideLabel
                        value={value}
                        taken={compareModels.filter((_, j) => j !== i)}
                        onChange={(v) => { setCompareModels((list) => list.map((m, j) => (j === i ? v : m))); setFormError(null) }}
                      />
                    </div>
                    {compareModels.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setCompareModels((list) => list.filter((_, j) => j !== i))}
                        aria-label={`Remove model ${String.fromCharCode(65 + i)}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ol>
              {compareModels.length < MAX_COMPARE && (
                <button
                  type="button"
                  onClick={() => setCompareModels((list) => [...list, nextFreeModel(list)])}
                  className="mt-2 flex h-10 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                >
                  <Plus className="h-3.5 w-3.5" /> Add a third model
                </button>
              )}
            </div>
          )}

          <div className="mt-4 space-y-3">
            {usedProviders.map((p) => (
              <KeyField
                key={p}
                provider={p}
                value={keys[p] ?? ''}
                onChange={(v) => { setKeys((k) => ({ ...k, [p]: v })); setFormError(null) }}
              />
            ))}
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

        <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-white sm:grid-cols-4" aria-label="Generation summary">
          <SummaryCell label="Source" value={sourceLabel ?? 'Not added'} missing={!sourceLabel} />
          <SummaryCell
            label="Drafts"
            value={outputCount === 0 ? 'None chosen' : `${outputCount} ${outputCount === 1 ? 'format' : 'formats'}`}
            missing={outputCount === 0}
          />
          <SummaryCell label="Voice" value={`${toneLabel(tone)}${audienceLabel ? ` · ${audienceLabel}` : ''}${showLangField ? ` · ${targetLanguage}` : ''}`} />
          <SummaryCell label="Engine" value={missingKey ? `${providerInfo(missingKey).name} key needed` : engineLabel} missing={!!missingKey} />
        </dl>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="relative mt-3 flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-ink text-[15.5px] font-semibold text-paper transition-[transform,background-color] duration-200 hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha active:scale-[0.99] disabled:cursor-wait disabled:hover:bg-ink"
        >
          {generating && <span className="sk-sweep pointer-events-none absolute bottom-0 left-0 h-[3px] w-1/3 bg-matcha" />}
          <span>
            {generating ? 'Drafting…'
              : engineMode === 'compare' ? `Compare ${selectedRefs.length} models`
              : outputCount > 1 ? `Generate ${outputCount} drafts` : 'Generate draft'}
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
    <div className="min-w-0 border-b border-r border-line px-3.5 py-3 even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0">
      <dt className="text-[12px] text-ink-mute">{label}</dt>
      <dd className={`mt-0.5 truncate text-[14px] font-semibold ${missing ? 'font-medium text-ink-mute' : 'text-ink'}`} title={value}>{value}</dd>
    </div>
  )
}

function Step({ id, n, title, hint, done, action, collapsible, children }: {
  id: string
  n: string
  title: string
  hint?: string
  done?: boolean
  action?: React.ReactNode
  /** Folds the step to one summary line; used for the optional steps so the panel stays short. */
  collapsible?: { open: boolean; onToggle: () => void; summary: string; warn?: boolean }
  children: React.ReactNode
}) {
  if (collapsible) {
    const { open, onToggle, summary, warn } = collapsible
    return (
      <section
        id={id}
        aria-labelledby={`${id}-title`}
        tabIndex={-1}
        // The output canvas focuses a step to jump to it; a folded step opens so there is something to edit.
        onFocus={(e) => { if (e.target === e.currentTarget && !open) onToggle() }}
        className="scroll-mt-4 outline-none"
      >
        <h3 id={`${id}-title`}>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={`${id}-body`}
            className="group flex w-full items-start gap-3 px-6 py-5 text-left transition-colors hover:bg-paper focus-visible:bg-paper focus-visible:outline-none lg:px-7"
          >
            <StepNumber n={n} done={done} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15.5px] font-semibold leading-7 text-ink">{title}</span>
              <span className={`block truncate text-[13px] ${warn && !open ? 'font-medium text-red-700' : 'text-ink-mute'}`}>
                {open ? hint : summary}
              </span>
            </span>
            <ChevronDown className={`mt-1.5 h-4 w-4 shrink-0 text-ink-mute transition-transform duration-200 group-hover:text-ink ${open ? 'rotate-180' : ''}`} />
          </button>
        </h3>
        {open && (
          <div id={`${id}-body`} className="px-6 pb-6 lg:px-7">
            {children}
          </div>
        )}
      </section>
    )
  }

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

/** First drafting model not already in the comparison, so "Add a third model" never adds a duplicate. */
function nextFreeModel(taken: string[]) {
  for (const p of PROVIDERS) {
    for (const m of p.models) {
      const key = refKey({ provider: p.id, model: m.id })
      if (canWrite(m.kind) && !taken.includes(key)) return key
    }
  }
  return taken[0]
}

/** Native select grouped by provider: keyboard, screen-reader and mobile pickers come for free. */
function ModelSelect({ label, hideLabel, value, taken = [], onChange }: {
  label: string
  hideLabel?: boolean
  value: string
  taken?: string[]
  onChange: (value: string) => void
}) {
  const info = modelInfo(parseRefKey(value))
  return (
    <label className="block">
      <span className={hideLabel ? 'sr-only' : 'mb-1.5 block text-[13px] font-semibold text-ink'}>{label}</span>
      <span className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-lg border border-line bg-white pl-3.5 pr-24 font-mono text-[13px] text-ink transition-colors hover:border-ink/40 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
        >
          {PROVIDERS.map((p) => (
            <optgroup key={p.id} label={p.name}>
              {p.models.map((m) => {
                const key = refKey({ provider: p.id, model: m.id })
                const drafts = canWrite(m.kind)
                return (
                  <option key={key} value={key} disabled={!drafts || taken.includes(key)}>
                    {m.id}{drafts ? '' : ` (${KIND_LABEL[m.kind]})`}{taken.includes(key) ? ' (already chosen)' : ''}
                  </option>
                )
              })}
            </optgroup>
          ))}
        </select>
        <span className="pointer-events-none absolute right-9 rounded-[5px] bg-paper-deep px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
          {providerInfo(parseRefKey(value).provider).name}
        </span>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ink-mute" />
      </span>
      {!hideLabel && info && <span className="mt-1.5 block text-[12.5px] text-ink-mute">Reads {KIND_LABEL[info.kind]}.</span>}
    </label>
  )
}

function KeyField({ provider, value, onChange }: { provider: ProviderId; value: string; onChange: (value: string) => void }) {
  const info = providerInfo(provider)
  const [visible, setVisible] = useState(false)
  const id = `ws-key-${provider}`

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink">{info.name} API key</label>
        <a
          href={info.keyUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[12.5px] font-medium text-ink-soft underline decoration-ink/25 underline-offset-4 hover:text-ink hover:decoration-ink"
        >
          Get a key
        </a>
      </div>
      <span className={`mt-1.5 flex h-11 items-center rounded-lg border bg-white pl-3.5 transition-shadow ${FIELD_FOCUS} ${value.trim() ? 'border-ink/40' : 'border-line'}`}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Optional (${info.keyPlaceholder})`}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-ink outline-none placeholder:font-sans placeholder:text-ink-mute"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${info.name} key` : `Show ${info.name} key`}
          aria-pressed={visible}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-r-lg text-ink-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/30"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      <p className="mt-1.5 text-[12.5px] leading-snug text-ink-mute">
        {value.trim()
          ? <>Sent only to <span className="font-mono text-[12px]">{info.host}</span>. Kept in this tab's memory, never saved.</>
          : `Optional. Leave empty to use Sankshep's shared ${info.name} keys; add your own if they run out.`}
      </p>
    </div>
  )
}
