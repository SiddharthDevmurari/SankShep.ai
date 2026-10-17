// A picture of the Sankshep workspace, rebuilt from pages/WorkspacePage.tsx and workspace/* with the same
// classes, so it reads as the real app. Nothing here is interactive: the director drives it through
// DemoState, and finds elements by their data-demo id. Keep it in step when the workspace UI changes.
import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react'
import {
  AlignLeft, ArrowUp, ArrowUpRight, ChartNoAxesColumn, Check, ChevronDown, ChevronRight, Cloud, Copy, Download, Eye,
  History, Link2, ListFilter, Lock, LogOut, PanelLeftClose, PenLine, RefreshCw, ScrollText, Shuffle, Square, Upload,
  WandSparkles, X,
} from 'lucide-react'
import { BrandMark } from '../site/SiteChrome'
import { RichText } from '../../workspace/RichText'
import {
  AUDIENCES, DEMO_FORMATS, DRAFTS, EMPTY_QUOTE, FORMATS, LINKEDIN_REFINED, PROVIDERS, SOURCE_CHARS, SOURCE_KB,
  SOURCE_NAME, SOURCE_WORDS, TONES, countWords, engineLabel, formatOf, formatStamp, readsImages, shortModel,
  type DraftId, type FormatId,
} from './content'
import type { DemoState } from './script'

const Ctx = createContext<{ s: DemoState; compact: boolean; scale: number }>(null!)
const useDemo = () => useContext(Ctx)

/** Marks an element as a pointer target, with flags for its hover and pressed looks (data-hover:, data-press:). */
function useTarget() {
  const { s } = useDemo()
  return (id: string) => ({
    'data-demo': id,
    'data-hover': s.hover === id ? '' : undefined,
    'data-press': s.press === id ? '' : undefined,
  })
}

const draftText = (s: DemoState, id: DraftId = s.draft) => (id === 'linkedin' && s.refined ? LINKEDIN_REFINED : DRAFTS[id])

export function Mockup({ state, compact, scale }: { state: DemoState; compact: boolean; scale: number }) {
  return (
    <Ctx.Provider value={{ s: state, compact, scale }}>
      <div className="sk-canvas relative flex h-full flex-col overflow-hidden text-left text-ink">
        <WsHeader />
        <main className={`relative min-h-0 flex-1 ${compact ? 'px-3 pb-3 pt-2.5' : 'px-5 pb-5 pt-3'}`}>
          {/* Transform stays mounted on other tabs, as in the app, so its drafts and scroll survive. */}
          <div className={state.tab === 'transform' ? 'h-full' : 'hidden'}>
            <TransformWindow />
          </div>
          {state.tab === 'history' && <HistoryPage />}
        </main>
        <ModelMenu />
      </div>
    </Ctx.Provider>
  )
}

/* ── Header ──────────────────────────────────────────────────────────── */

const WS_TABS = [
  { id: 'transform', label: 'Transform', icon: Shuffle },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesColumn },
] as const

function WsHeader() {
  const { s, compact } = useDemo()
  const t = useTarget()
  return (
    <header className={`relative z-30 shrink-0 ${compact ? 'px-3 pt-2' : 'px-5 pt-3'}`}>
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-full border border-gray-200 bg-white py-2 pl-2 pr-3 shadow-[0_1px_2px_rgba(15,16,15,0.05),0_8px_24px_-12px_rgba(15,16,15,0.18)]">
        <div className="flex min-w-0 items-center gap-2.5 justify-self-start pr-2">
          <BrandMark className="h-9 w-9 rounded-full" />
          {!compact && <span className="font-display text-[17px] text-ink">Sankshep</span>}
        </div>

        <div className="flex items-center gap-1 rounded-full bg-ink/[0.05] p-1 ring-1 ring-ink/10">
          {WS_TABS.map(({ id, label, icon: Icon }) => {
            const active = s.tab === id
            return (
              <span
                key={id}
                {...t(`ws-tab-${id}`)}
                className={`flex h-9 items-center gap-2 rounded-full text-[13.5px] font-medium transition-all duration-200 data-press:scale-[0.97] ${compact ? 'px-3.5' : 'px-4'} ${
                  active
                    ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(231,228,217,0.9),0_2px_8px_-3px_rgba(15,16,15,0.18)]'
                    : 'text-ink-soft data-hover:bg-white/60 data-hover:text-ink'
                }`}
              >
                <Icon className={`h-[15px] w-[15px] ${active ? 'text-ink' : 'text-ink-mute'}`} />
                {!compact && label}
              </span>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <span className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink font-mono text-[12px] font-semibold text-matcha">D</span>
            {!compact && (
              <span className="min-w-0 text-left">
                {/* The shared demo account, as published in the README */}
                <span className="block max-w-[180px] truncate text-[13px] font-medium leading-tight text-ink">demo@gmail.com</span>
                <span className="block text-[11.5px] leading-tight text-ink-mute">demo</span>
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-ink-mute" />
          </span>
          {!compact && (
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft">
              <LogOut className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

/* ── Transform: one app window, settings panel left, output canvas right ── */

const WINDOW = 'h-full overflow-hidden rounded-2xl border border-edge/80 bg-white shadow-[0_1px_2px_rgba(15,16,15,0.05),0_24px_48px_-32px_rgba(15,16,15,0.28)]'

function TransformWindow() {
  const { s, compact } = useDemo()
  if (compact) {
    // Narrow screens show one side at a time. The new side fades in without sliding, so the pointer's targets stay put.
    return (
      <div className={`relative ${WINDOW}`}>
        <div key={s.pane} className={`demo-fade absolute inset-0 flex flex-col ${s.pane === 'config' ? 'bg-paper-deep' : 'bg-white'}`}>
          {s.pane === 'config' ? <ConfigPanel /> : <><CanvasBar /><Output /></>}
        </div>
      </div>
    )
  }
  return (
    <div className={`flex ${WINDOW}`}>
      <aside className="flex w-[360px] shrink-0 flex-col border-r border-line bg-paper-deep">
        <ConfigPanel />
      </aside>
      <section className="relative flex min-w-0 flex-1 flex-col bg-white">
        <CanvasBar />
        <Output />
      </section>
    </div>
  )
}

/* ── Settings panel (LeftPanel) ──────────────────────────────────────── */

function ConfigPanel() {
  return (
    <>
      <div data-scroll="config" className="min-h-0 flex-1 overflow-hidden">
        <div className="border-b border-line px-5 pb-4 pt-5">
          <h2 className="font-display text-[19px] font-bold leading-tight text-ink">Source &amp; configuration</h2>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-mute">Five steps, then review and generate. Audience and engine start from defaults.</p>
        </div>
        <div className="space-y-3 border-b border-line px-5 py-4">
          <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1">
            <span className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-2.5 text-[13.5px] font-medium text-paper">
              <Cloud className="h-4 w-4 shrink-0 text-matcha" strokeWidth={1.8} /> Cloud APIs <span className="text-[12px] font-normal text-paper/65">Fast</span>
            </span>
            <span className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13.5px] font-medium text-ink-soft">
              <Lock className="h-4 w-4 shrink-0" strokeWidth={1.8} /> Private <span className="text-[12px] font-normal text-ink-mute">On-device</span>
            </span>
          </div>
          <p className="text-[12.5px] leading-snug text-ink-mute">Drafts are written by Groq, Mistral or Gemini. Switch to Private to keep documents on this device.</p>
        </div>
        <div className="divide-y divide-line">
          <SourceStep />
          <OutputsStep />
          <VoiceStep />
          <AudienceStep />
          <EngineStep />
        </div>
        <ReviewBlock />
      </div>
      <GenerateBar />
    </>
  )
}

function StepNumber({ n }: { n: string }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink font-mono text-[12px] font-semibold tabular-nums text-matcha">{n}</span>
  )
}

function Step({ n, title, hint, action, children }: { n: string; title: string; hint: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-5 py-5">
      <header className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <StepNumber n={n} />
          <div>
            <h3 className="text-[14.5px] font-semibold leading-7 text-ink">{title}</h3>
            <p className="text-[12.5px] leading-snug text-ink-mute">{hint}</p>
          </div>
        </div>
        {action && <div className="pt-1">{action}</div>}
      </header>
      {children}
    </section>
  )
}

function FoldStep({ id, n, title, hint, summary, open, children }: {
  id: string; n: string; title: string; hint: string; summary: string; open: boolean; children: ReactNode
}) {
  const t = useTarget()
  return (
    <section>
      <div {...t(id)} className="group flex w-full items-start gap-3 px-5 py-4 text-left transition-colors data-hover:bg-paper">
        <StepNumber n={n} />
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-semibold leading-7 text-ink">{title}</span>
          <span className="block truncate text-[12.5px] text-ink-mute">{open ? hint : summary}</span>
        </span>
        <ChevronDown className={`mt-1.5 h-4 w-4 shrink-0 text-ink-mute transition-transform duration-200 group-data-hover:text-ink ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && <div className="sk-rise px-5 pb-5">{children}</div>}
    </section>
  )
}

const SOURCE_MODES = [
  { label: 'Upload', icon: Upload },
  { label: 'Link', icon: Link2 },
  { label: 'Paste', icon: AlignLeft },
]

function SourceStep() {
  const { s } = useDemo()
  const t = useTarget()
  const dragOver = s.carry && s.hover === 'dropzone'
  return (
    <Step n="01" title="Source" hint="What should we work from?">
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-white p-1">
        {SOURCE_MODES.map(({ label, icon: Icon }, i) => (
          <span key={label} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-[13.5px] font-medium ${i === 0 ? 'bg-ink text-paper' : 'text-ink-soft'}`}>
            <Icon className="h-4 w-4" strokeWidth={1.8} />
            {label}
          </span>
        ))}
      </div>
      <div className="mt-3">
        {s.file === 'none' ? (
          <div
            {...t('dropzone')}
            className={`flex min-h-[128px] flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed px-5 py-6 text-center transition-colors duration-200 ${
              dragOver ? 'border-ink bg-matcha/30' : 'border-ink/25 bg-white data-hover:border-ink/50'
            }`}
          >
            <p className="font-display text-[17px] font-bold leading-snug text-ink [text-wrap:balance]">
              {dragOver ? 'Release to add this file' : 'Drop a file, or click to choose one'}
            </p>
            <p className="mt-1.5 text-[12.5px] text-ink-mute [text-wrap:balance]">PDF, DOCX, TXT, CSV, JSON or an image · up to 30 MB</p>
          </div>
        ) : (
          <div className="sk-pop flex items-center gap-3 rounded-xl border border-line bg-white p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-matcha font-mono text-[11px] font-semibold uppercase text-ink">txt</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-ink">{SOURCE_NAME}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-mute">
                {SOURCE_KB} KB · {s.file === 'reading' ? 'reading text…' : `${SOURCE_CHARS.toLocaleString('en-US')} characters read`}
              </p>
            </div>
            <span className="rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-soft">Replace</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-mute"><X className="h-4 w-4" /></span>
          </div>
        )}
      </div>
    </Step>
  )
}

function OutputsStep() {
  const { s } = useDemo()
  const t = useTarget()
  return (
    <Step
      n="02"
      title="Outputs"
      hint="Each format is drafted in parallel. Instructions shape every draft."
      action={<span className="whitespace-nowrap text-[13px] font-medium text-ink underline decoration-ink/30 underline-offset-4">Select all</span>}
    >
      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map(({ id, short, desc, icon: Icon }) => {
          const selected = s.formats.includes(id)
          return (
            <span
              key={id}
              {...t(`fmt-${id}`)}
              className={`group flex items-center gap-2 rounded-lg border px-2.5 py-2.5 transition-[color,background-color,border-color,transform] duration-200 data-press:scale-[0.98] ${
                selected ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink data-hover:border-ink/40'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${selected ? 'text-matcha' : 'text-ink-mute group-data-hover:text-ink'}`} strokeWidth={1.8} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-tight">{short}</span>
                <span className={`mt-0.5 block truncate text-[12px] leading-tight ${selected ? 'text-paper/75' : 'text-ink-mute'}`}>{desc}</span>
              </span>
            </span>
          )
        })}
      </div>
      <p className="mt-5 flex items-baseline justify-between text-[13px] font-semibold text-ink">
        Custom instructions <span className="text-[12px] font-normal text-ink-mute">Optional</span>
      </p>
      <div className="mt-2 rounded-xl border border-line bg-white">
        <p className="px-4 pt-3 text-[14.5px] leading-[1.65] text-ink-mute">e.g. Start with a one-line verdict, then a risk table, then three recommendations…</p>
        <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-2">
          {['Risk table first', 'Bullets only', 'Action checklist'].map((x) => (
            <span key={x} className="rounded-lg border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-soft">+ {x}</span>
          ))}
        </div>
      </div>
    </Step>
  )
}

function VoiceStep() {
  return (
    <Step n="03" title="Voice" hint="Tone applies to every draft.">
      <div className="grid grid-cols-2 gap-2">
        {TONES.map(({ label, note }, i) => (
          <span key={label} className={`rounded-lg border px-3 py-2 ${i === 0 ? 'border-ink bg-white text-ink ring-1 ring-ink' : 'border-line bg-white text-ink-soft'}`}>
            <span className="block text-[13.5px] font-semibold">{label}</span>
            <span className="block font-serif text-[14px] text-ink-mute">{note}</span>
          </span>
        ))}
      </div>
    </Step>
  )
}

function AudienceStep() {
  const { s } = useDemo()
  const t = useTarget()
  return (
    <FoldStep
      id="audience-toggle"
      n="04"
      title="Audience"
      hint="Who will read, watch or receive the final content. Optional."
      summary={s.audience ?? 'No specific audience'}
      open={s.audienceOpen}
    >
      <div className="grid grid-cols-2 gap-2">
        {AUDIENCES.map(({ id, name }) => {
          const active = s.audience === name
          return (
            <span
              key={id}
              {...t(`aud-${id}`)}
              className={`flex min-h-11 items-center rounded-lg border px-3 py-2 text-[13.5px] font-medium transition-colors duration-200 data-press:scale-[0.98] ${
                active ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink-soft data-hover:border-ink/40 data-hover:text-ink'
              }`}
            >
              {name}
            </span>
          )
        })}
      </div>
    </FoldStep>
  )
}

function EngineStep() {
  const { s } = useDemo()
  const t = useTarget()
  return (
    <FoldStep
      id="engine-toggle"
      n="05"
      title="AI engine & provider"
      hint="Your model, your key."
      summary={engineLabel(s.model)}
      open={s.engineOpen}
    >
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white p-1">
        <span className="flex h-10 items-center justify-center rounded-lg bg-ink text-[13.5px] font-medium text-paper">Single provider</span>
        <span className="flex h-10 items-center justify-center rounded-lg text-[13.5px] font-medium text-ink-soft">Compare models</span>
      </div>
      <div className="mt-3">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">Model</span>
        <span
          {...t('model-select')}
          className={`relative flex h-11 items-center rounded-lg border bg-white pl-3.5 pr-24 font-mono text-[13px] text-ink transition-[border-color,box-shadow] ${
            s.modelMenu ? 'border-ink ring-4 ring-matcha/50' : 'border-line data-hover:border-ink/40'
          }`}
        >
          <span className="truncate">{s.model.model}</span>
          <span className="absolute right-9 rounded-[5px] bg-paper-deep px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-soft">{s.model.provider}</span>
          <ChevronDown className="absolute right-3 h-4 w-4 text-ink-mute" />
        </span>
        <span className="mt-1.5 block text-[12.5px] text-ink-mute">Reads {readsImages(s.model) ? 'text + images' : 'text'}.</span>
      </div>
    </FoldStep>
  )
}

/**
 * The model picker's open list. A native select draws its list above the page, so this one sits in the
 * mockup's top layer instead of being clipped by the scrolling panel. Like a native list, it opens
 * upward when there isn't room below the select.
 */
function ModelMenu() {
  const { s, scale } = useDemo()
  const t = useTarget()
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const menu = ref.current
    const root = menu?.offsetParent as HTMLElement | null
    const anchor = root?.querySelector('[data-demo="model-select"]')
    if (!menu || !root || !anchor) return
    const rr = root.getBoundingClientRect()
    const ar = anchor.getBoundingClientRect()
    const top = (ar.top - rr.top) / scale
    const bottom = (ar.bottom - rr.top) / scale
    const fitsBelow = bottom + 4 + menu.offsetHeight <= root.offsetHeight - 8
    menu.style.left = `${(ar.left - rr.left) / scale}px`
    menu.style.top = `${fitsBelow ? bottom + 4 : Math.max(8, top - 4 - menu.offsetHeight)}px`
    menu.style.width = `${ar.width / scale}px`
  })
  if (!s.modelMenu) return null
  return (
    <div ref={ref} className="sk-float sk-pop absolute z-40 max-h-[248px] overflow-hidden rounded-lg bg-white py-1">
      {PROVIDERS.map((p) => (
        <div key={p.name}>
          <p className="px-3 pb-1 pt-1.5 text-[11.5px] font-semibold text-ink-mute">{p.name}</p>
          {p.models.map(([id]) => {
            const current = s.model.model === id
            return (
              <span
                key={id}
                {...t(`model-${id}`)}
                className={`flex h-7 items-center justify-between px-3 pl-5 font-mono text-[12.5px] ${current ? 'bg-paper-deep text-ink' : 'text-ink'} data-hover:bg-ink data-hover:text-paper`}
              >
                {id}
                {current && <Check className="h-3.5 w-3.5" />}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function SummaryCell({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="min-w-0 bg-white px-3 py-2.5">
      <dt className="text-[11.5px] text-ink-mute">{label}</dt>
      <dd className={`mt-0.5 truncate text-[13px] font-semibold ${missing ? 'font-medium text-ink-mute' : 'text-ink'}`}>{value}</dd>
    </div>
  )
}

function ReviewBlock() {
  const { s } = useDemo()
  const n = s.formats.length
  return (
    <div className="border-t border-line px-5 pb-5 pt-4">
      <h3 className="mb-2.5 text-[13px] font-semibold text-ink">Review</h3>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
        <SummaryCell label="Source" value={s.file !== 'none' ? SOURCE_NAME : 'Not added'} missing={s.file === 'none'} />
        <SummaryCell label="Drafts" value={n === 0 ? 'None chosen' : `${n} ${n === 1 ? 'format' : 'formats'}`} missing={n === 0} />
        <SummaryCell label="Voice" value={`Professional${s.audience ? ` · ${s.audience}` : ''}`} />
        <SummaryCell label="Engine" value={engineLabel(s.model)} />
      </dl>
    </div>
  )
}

function GenerateBar() {
  const { s } = useDemo()
  const t = useTarget()
  const n = s.formats.length
  return (
    <div className="z-10 shrink-0 border-t border-line bg-paper-deep px-5 pb-5 pt-4 shadow-[0_-12px_24px_-20px_rgba(15,16,15,0.35)]">
      {s.phase === 'generating' ? (
        <span className="relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-white text-[15px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
          <span className="sk-sweep absolute bottom-0 left-0 h-[3px] w-1/3 bg-red-200" />
          <Square className="h-3.5 w-3.5 fill-current" />
          Stop generating
        </span>
      ) : (
        <span
          {...t('generate')}
          className="relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-ink text-[15.5px] font-semibold text-paper transition-[transform,background-color] duration-200 data-hover:bg-ink-soft data-press:scale-[0.98]"
        >
          {n > 1 ? `Generate ${n} drafts` : 'Generate draft'}
          <span className="flex items-center gap-1 text-[12px] font-medium text-paper/70">
            <kbd className="rounded border border-paper/25 px-1.5 py-0.5 font-sans">Ctrl</kbd>
            <kbd className="rounded border border-paper/25 px-1.5 py-0.5 font-sans">↵</kbd>
          </span>
        </span>
      )}
    </div>
  )
}

/* ── Output canvas (TransformView + RightPanel) ──────────────────────── */

function CanvasBar() {
  const { s, compact } = useDemo()
  const drafting = s.phase === 'generating'
  return (
    <div className={`flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 border-b border-hair ${compact ? 'px-4 py-3' : 'px-5 py-3'}`}>
      {!compact && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-soft ring-1 ring-hair">
          <PanelLeftClose className="h-[18px] w-[18px]" />
        </span>
      )}
      <div className="min-w-[13.5rem] flex-1">
        <p className="flex items-center gap-1 text-[12px] text-ink-mute">
          Workspace <ChevronRight className="h-3 w-3" /> <span className="font-medium text-ink-soft">Transform</span>
        </p>
        <p className="mt-0.5 truncate text-[15.5px] font-semibold tracking-[-0.01em] text-ink">Find exactly what you need.</p>
      </div>
      <div className={`flex items-stretch overflow-hidden rounded-xl border border-hair bg-white ${compact ? 'w-full' : ''}`}>
        <dl className="flex min-w-0 flex-1 divide-x divide-hair">
          <div className="min-w-[96px] flex-1 px-3.5 py-1.5">
            <dt className="text-[11.5px] text-ink-mute">Engine</dt>
            <dd className="mt-0.5 flex h-5 items-center gap-2 text-[13.5px] font-semibold text-ink">
              <span className="relative flex h-2 w-2 shrink-0">
                {drafting && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-matcha-deep opacity-60" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${drafting ? 'bg-matcha-deep' : 'bg-green-600'}`} />
              </span>
              {drafting ? 'Drafting…' : 'Ready'}
            </dd>
          </div>
          <div className="min-w-[96px] flex-1 px-3.5 py-1.5">
            <dt className="text-[11.5px] text-ink-mute">Drafts</dt>
            <dd className="mt-0.5 flex h-5 items-center text-[15px] font-semibold leading-none text-ink tabular-nums">{s.drafts}</dd>
          </div>
        </dl>
        <div className="flex shrink-0 items-center border-l border-hair bg-paper p-1">
          <span className="flex h-full min-h-10 items-center gap-2 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-paper">
            History <ArrowUpRight className="h-4 w-4 text-matcha" />
          </span>
        </div>
      </div>
    </div>
  )
}

function Output() {
  const { s } = useDemo()
  if (s.phase === 'idle') return <EmptyCanvas />
  if (s.phase === 'generating') return <DraftingCanvas />
  return <DraftsCanvas />
}

function EmptyCanvas() {
  const { compact } = useDemo()
  return (
    <div className={`flex min-h-0 flex-1 items-center justify-center ${compact ? 'px-6 py-10' : 'px-10 py-16'}`}>
      <div className="sk-rise flex max-w-[34rem] flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-deep text-ink-mute ring-1 ring-hair">
          <PenLine className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <blockquote className={`mt-7 font-serif italic leading-[1.45] text-ink-soft [text-wrap:balance] ${compact ? 'text-[19px]' : 'text-[24px]'}`}>
          “{EMPTY_QUOTE}”
        </blockquote>
        <p className="mt-6 text-[13px] text-ink-mute">Nothing generated yet. Your drafts will open here.</p>
      </div>
    </div>
  )
}

function DraftingCanvas() {
  const { s, compact } = useDemo()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-hair py-3 ${compact ? 'px-4' : 'px-8'}`}>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-0.5">
          <h2 className="font-display text-[18px] font-bold text-ink">Output canvas</h2>
          <p className="text-[12.5px] text-ink-mute">Drafting {s.formats.length} formats · {engineLabel(s.model)}</p>
        </div>
        <span className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-[13px] font-medium text-red-700 ring-1 ring-inset ring-red-200">
          <Square className="h-3 w-3 fill-current" /> Stop generating
        </span>
      </div>
      <div className={`flex-1 overflow-hidden ${compact ? 'px-4 py-6' : 'px-10 py-10'}`}>
        <div className="mx-auto w-full max-w-[640px]">
          <p className="text-[14px] text-ink-mute">Reading your source, then writing each format in parallel. This usually takes under a minute.</p>
          <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
            {s.formats.map((id, i) => (
              <li key={id} className="sk-rise flex items-center gap-4 px-4 py-3.5" style={{ animationDelay: `${i * 60}ms` }}>
                <span className={`shrink-0 truncate text-[14px] font-medium text-ink ${compact ? 'w-28' : 'w-40'}`}>{formatOf(id).short}</span>
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

function DraftsCanvas() {
  const { s, compact } = useDemo()
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <Toolbar />
      <div className="relative min-h-0 flex-1 bg-paper">
        <div data-scroll="canvas" className={`h-full overflow-hidden ${compact ? 'px-3 pb-36 pt-5' : 'px-8 pb-44 pt-8'}`}>
          <div key={`${s.draft}-${s.view}-${s.refined}`} className="sk-rise">
            {s.view === 'editor' ? <EditorSheet /> : <PreviewSheet />}
          </div>
        </div>
        <Composer />
      </div>
    </div>
  )
}

function IconButton({ children }: { children: ReactNode }) {
  return <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-soft ring-1 ring-hair">{children}</span>
}

function Toolbar() {
  const { s, compact } = useDemo()
  const t = useTarget()
  return (
    <div className={`relative z-20 flex min-h-[60px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-hair bg-white py-2.5 ${compact ? 'px-3' : 'px-5'}`}>
      <div className="flex max-w-full items-center gap-1 overflow-hidden rounded-full bg-paper-deep/80 p-1 ring-1 ring-hair">
        {DEMO_FORMATS.map((id) => {
          const active = s.draft === id
          return (
            <span
              key={id}
              {...t(`tab-${id}`)}
              className={`flex h-9 shrink-0 items-center rounded-full font-medium transition-all duration-200 data-press:scale-[0.97] ${compact ? 'px-3 text-[12.5px]' : 'px-4 text-[13px]'} ${
                active
                  ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(231,228,217,0.9),0_2px_8px_-3px_rgba(15,16,15,0.18)]'
                  : 'text-ink-soft data-hover:text-ink'
              }`}
            >
              {formatOf(id).short}
            </span>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-full bg-paper-deep/80 p-1 ring-1 ring-hair">
          {([['editor', 'Edit', PenLine], ['preview', 'Preview', Eye]] as const).map(([mode, label, Icon]) => (
            <span
              key={mode}
              {...t(`view-${mode}`)}
              className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-all data-press:scale-[0.97] ${
                s.view === mode ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(231,228,217,0.9)]' : 'text-ink-soft data-hover:text-ink'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
          ))}
        </div>
        {!compact && <IconButton><ScrollText className="h-4 w-4" /></IconButton>}
        <IconButton><Copy className="h-4 w-4" /></IconButton>
        <DownloadMenu />
      </div>
    </div>
  )
}

function DownloadMenu() {
  const { s } = useDemo()
  const t = useTarget()
  const options = [
    ...(s.draft === 'deck' ? [{ kind: 'pptx', label: 'PowerPoint', hint: '.pptx' }] : []),
    { kind: 'md', label: 'Markdown', hint: '.md' },
    { kind: 'txt', label: 'Plain text', hint: '.txt' },
  ]
  return (
    <div className="relative">
      <span
        {...t('download')}
        className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 transition-all duration-200 ${
          s.downloadMenu ? 'bg-ink text-paper ring-ink' : 'bg-white text-ink-soft ring-hair data-hover:-translate-y-0.5 data-hover:text-ink data-hover:ring-ink/20'
        }`}
      >
        <Download className="h-4 w-4" />
      </span>
      {s.downloadMenu && (
        <div className="sk-float sk-pop absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl bg-white p-1.5">
          <p className="px-2.5 pb-1.5 pt-1 text-[11.5px] font-medium text-ink-mute">Download as</p>
          {options.map((o) => (
            <span
              key={o.kind}
              {...t(`dl-${o.kind}`)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-ink transition-colors data-hover:bg-paper-deep ${s.downloadBusy ? 'opacity-60' : ''}`}
            >
              {o.label}
              {s.downloadBusy && o.kind === 'pptx'
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
                : <span className="font-mono text-[11.5px] text-ink-mute">{o.hint}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** The draft as the editor shows it: the model's raw Markdown, ready to edit. */
function EditorSheet() {
  const { s, compact } = useDemo()
  const t = useTarget()
  const text = draftText(s)
  const words = countWords(text)
  return (
    <article {...t('draft-body')} className={`sk-sheet mx-auto max-w-[900px] rounded-2xl bg-white ${compact ? 'px-6 py-7' : 'px-14 py-12'}`}>
      <header className="mb-8 border-b border-hair pb-7">
        <p className="text-[12.5px] font-semibold text-ink-mute">
          Draft · professional{s.audience && <> · for {s.audience}</>}
        </p>
        <h2 className={`mt-3 font-display font-bold text-ink ${compact ? 'text-[28px]' : 'text-[38px]'}`}>{formatOf(s.draft).label}</h2>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px] text-ink-mute">
          <span>{words.toLocaleString('en-US')} words</span>
          <span>{Math.max(1, Math.ceil(words / 230))} min read</span>
          <span>{text.length.toLocaleString('en-US')} chars</span>
          <span>{s.model.model}</span>
        </p>
      </header>
      <div className={`whitespace-pre-wrap leading-[1.8] text-ink/90 ${compact ? 'text-[14.5px]' : 'text-[16.5px]'}`}>{text}</div>
    </article>
  )
}

/** Preview mode (RightPanel MockupView): each format as it will look. */
function PreviewSheet() {
  const { s, compact } = useDemo()
  const text = draftText(s)
  if (s.draft === 'linkedin') {
    return (
      <div className="sk-sheet mx-auto max-w-[560px] rounded-2xl bg-white p-6">
        <div className="flex items-center gap-3">
          <BrandMark className="h-11 w-11 rounded-full" />
          <div>
            <p className="text-[14px] font-semibold text-ink">Sankshep.ai</p>
            <p className="text-[11.5px] text-ink-mute">AI Content Platform · Just now</p>
          </div>
        </div>
        <div className="mt-2 [&_p]:text-[14.5px] [&_p]:leading-[1.7]"><RichText text={text} /></div>
      </div>
    )
  }
  const pad = compact ? 'px-6 py-7' : 'px-14 py-12'
  if (s.draft === 'exec') {
    return (
      <div className={`sk-sheet mx-auto max-w-[900px] rounded-2xl bg-white ${pad}`}>
        <div className="mb-7 border-b-2 border-ink pb-5">
          <p className="text-[12.5px] font-semibold text-ink-mute">Executive brief</p>
          <h2 className="mt-2 font-display text-[30px] text-ink">Executive Summary</h2>
        </div>
        <RichText text={text} />
      </div>
    )
  }
  return (
    <article className={`sk-sheet mx-auto max-w-[900px] rounded-2xl bg-white ${pad}`}>
      <span className="rounded-md bg-matcha/40 px-2 py-1 text-[12.5px] font-semibold text-ink">PPT Presentation</span>
      <div className="mt-6"><RichText text={text} /></div>
    </article>
  )
}

function Composer() {
  const { s, compact } = useDemo()
  const t = useTarget()
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/90 to-transparent ${compact ? 'px-3 pb-4 pt-12' : 'px-8 pb-6 pt-16'}`}>
      <div
        className={`sk-float mx-auto flex max-w-[900px] items-center gap-2 rounded-2xl bg-white p-2 transition-shadow ${
          s.refineFocus ? 'shadow-[0_0_0_1px_rgba(15,16,15,0.3),0_0_0_5px_rgba(212,237,100,0.35),0_12px_40px_-14px_rgba(15,16,15,0.22)]' : ''
        }`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-paper-deep text-ink-soft">
          <WandSparkles className="h-[18px] w-[18px]" />
        </span>
        <span {...t('refine-input')} className="flex min-w-0 flex-1 items-center self-stretch text-[14.5px]">
          {s.refineText
            ? <span className="truncate text-ink">{s.refineText}</span>
            : <span className="truncate text-ink-mute">Refine this {formatOf(s.draft).short}: “shorter”, “add a risk table”…</span>}
          {s.refineFocus && <span className="ml-px h-[1.15em] w-px shrink-0 animate-[sk-blink_1s_steps(1)_infinite] bg-ink" />}
        </span>
        {!compact && <span className="font-mono text-[10.5px] text-ink-mute">this draft only</span>}
        {s.refining ? (
          <span className="flex h-11 shrink-0 items-center gap-2 rounded-[15px] bg-white px-4 text-[13.5px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-700" />
            {!compact && 'Stop'}
          </span>
        ) : (
          <span
            {...t('refine-submit')}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-[15px] bg-ink text-[13.5px] font-semibold text-paper transition-all data-press:scale-[0.97] ${compact ? 'px-3.5' : 'px-5'} ${s.refineText ? '' : 'opacity-40'}`}
          >
            <ArrowUp className="h-4 w-4" />
            {!compact && 'Refine'}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── History tab (HistoryView) ───────────────────────────────────────── */

const COLUMNS = 'grid-cols-[minmax(0,2.3fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]'

interface Row { key: string; format: DraftId; detail: string; output: number; at: number }

/** History lists one row per draft this demo wrote, newest first: the refined post, then the run. */
function historyRows(s: DemoState): Row[] {
  if (s.phase !== 'done' || s.generatedAt === null) return []
  const base = `Professional · ${SOURCE_NAME}`
  const rows: Row[] = DEMO_FORMATS.map((id) => ({ key: id, format: id, detail: base, output: countWords(DRAFTS[id]), at: s.generatedAt! }))
  if (s.refined) rows.unshift({ key: 'linkedin-refined', format: 'linkedin', detail: `Refined · ${base}`, output: countWords(LINKEDIN_REFINED), at: s.generatedAt })
  return rows
}

const FILTERS: (FormatId | null)[] = [null, ...FORMATS.map((f) => f.id)]

function HistoryPage() {
  const { s, compact } = useDemo()
  const t = useTarget()
  const rows = historyRows(s).filter((r) => !s.filter || r.format === s.filter)
  const filterLabel = s.filter ? formatOf(s.filter).short : 'All formats'
  return (
    <div className={`sk-rise h-full overflow-hidden ${compact ? 'px-1' : 'px-5'}`}>
      <header className={`flex border-b border-ink/10 py-5 ${compact ? 'flex-col gap-4' : 'items-center justify-between gap-10'}`}>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[12.5px] text-ink-mute">
            Workspace <ChevronRight className="h-3 w-3" /> <span className="font-medium text-ink-soft">Log</span>
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            {/* Not an h1: the landing page keeps one heading at that level, and this is a picture of another page. */}
            <p className="text-[20px] font-semibold tracking-[-0.015em] text-ink">History</p>
            <p className="text-[13.5px] text-ink-mute">Recent transformations from this workspace.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span
              {...t('history-filter')}
              className={`relative flex h-11 min-w-[210px] items-center rounded-full border bg-white pl-10 pr-10 text-[13.5px] font-medium text-ink shadow-[0_1px_2px_rgba(38,36,24,0.06)] transition-colors ${
                s.filterMenu ? 'border-ink ring-4 ring-matcha/50' : 'border-line data-hover:border-ink/30'
              }`}
            >
              <ListFilter className="absolute left-3.5 h-4 w-4 text-ink-mute" />
              {filterLabel}
              <ChevronDown className="absolute right-3.5 h-4 w-4 text-ink-mute" />
            </span>
            {s.filterMenu && (
              <div className="sk-float sk-pop absolute left-0 top-full z-30 mt-2 w-[230px] overflow-hidden rounded-xl bg-white p-1.5">
                {FILTERS.map((id) => {
                  const current = s.filter === id
                  return (
                    <span
                      key={id ?? 'all'}
                      {...t(`filter-${id ?? 'all'}`)}
                      className={`flex h-7 items-center justify-between rounded-md px-2.5 text-[13px] ${current ? 'font-semibold text-ink' : 'text-ink-soft'} data-hover:bg-ink data-hover:text-paper`}
                    >
                      {id ? formatOf(id).short : 'All formats'}
                      {current && <Check className="h-3.5 w-3.5" />}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <span className="flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-paper">
            <RefreshCw className="h-4 w-4 text-matcha" /> Refresh
          </span>
        </div>
      </header>

      <section className="sk-elevated mt-5 overflow-hidden rounded-xl border border-edge bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <p className="text-[13.5px] text-ink-mute">
            <span className="font-mono font-medium text-ink tabular-nums">{rows.length}</span> {rows.length === 1 ? 'draft' : 'drafts'}
            {s.filter && <> · <span className="text-ink">{filterLabel}</span> only</>}
          </p>
          {s.filter && <span className="text-[13px] font-medium text-ink-soft underline decoration-ink/25 underline-offset-4">Clear filter</span>}
        </div>
        {!compact && (
          <div className={`grid gap-6 border-b border-line bg-paper px-6 py-2.5 text-[12px] font-medium text-ink-mute ${COLUMNS}`}>
            <span>Type</span>
            <span>Provider / model</span>
            <span className="text-right">Input</span>
            <span className="text-right">Output</span>
            <span className="text-right">Date</span>
          </div>
        )}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink"><History className="h-6 w-6 text-matcha" /></span>
            <h2 className="font-headline mt-5 text-[30px] text-ink">{s.filter ? `No ${filterLabel} drafts yet` : 'Nothing here yet'}</h2>
            <p className="mt-2 max-w-[42ch] text-[14px] leading-relaxed text-ink-mute">
              Run a transformation in the Transform tab. Every draft it writes is listed here with its size and model.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r, i) => <HistoryRow key={r.key} row={r} index={i} model={s.model.model} provider={s.model.provider} />)}
          </ul>
        )}
        {rows.length > 0 && (
          <div className="flex justify-center border-t border-line bg-paper px-6 py-3.5">
            <p className="text-[12.5px] text-ink-mute">That's everything in your history.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function HistoryRow({ row, index, model, provider }: { row: Row; index: number; model: string; provider: string }) {
  const { compact } = useDemo()
  const t = useTarget()
  const { short, icon: Icon } = formatOf(row.format)
  const stamp = formatStamp(row.at)
  const words = (n: number) => (
    <span className="whitespace-nowrap text-[13px] text-ink-mute">
      <span className="font-mono text-[14px] font-medium text-ink tabular-nums">{n.toLocaleString('en-US')}</span> words
    </span>
  )
  return (
    <li
      {...t(`history-row-${row.key}`)}
      className={`sk-rise group grid transition-colors duration-200 data-hover:bg-paper-deep/60 ${compact ? 'grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3.5' : `items-center gap-6 px-6 py-4 ${COLUMNS}`}`}
      style={{ animationDelay: `${index * 25}ms` }}
    >
      <div className={`flex min-w-0 items-center gap-3.5 ${compact ? 'col-span-2' : ''}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-paper-deep ring-1 ring-line transition-colors group-data-hover:bg-white">
          <Icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.8} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-medium text-ink">{short}</span>
          <span className="block truncate text-[12.5px] text-ink-mute">{row.detail}</span>
        </span>
      </div>
      <div className={`min-w-0 ${compact ? 'col-span-2' : ''}`}>
        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-paper px-2.5 py-1 text-[12px]">
          <span className="font-medium text-ink">{provider}</span>
          <span className="h-3 w-px shrink-0 bg-line" />
          <span className="truncate font-mono text-[11.5px] text-ink-mute">{shortModel(model)}</span>
        </span>
      </div>
      <div className={compact ? '' : 'text-right'}>{words(SOURCE_WORDS)}</div>
      <div className="text-right">{words(row.output)}</div>
      <p className={`text-[13px] text-ink-mute ${compact ? 'col-span-2' : 'text-right'}`}>
        <span className="text-ink">{stamp.date}</span>
        <span className="mx-1.5 text-ink/30">•</span>
        <span className="font-mono tabular-nums">{stamp.time}</span>
      </p>
    </li>
  )
}
