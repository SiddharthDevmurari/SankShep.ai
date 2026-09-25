import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion, useInView, useScroll, useSpring } from 'motion/react'
import {
  Check, Database, FileText, Image as ImageIcon, KeyRound, Link2, Monitor, RotateCcw, ScanText, Server, Upload,
} from 'lucide-react'
import { ArrowRight, SitePage } from '../components/site/SiteChrome'
import { ALL_FORMATS, MAX_COMPARE, MAX_FILE_BYTES, MAX_IMAGE_BYTES } from '../workspace/LeftPanel'
import { PROVIDERS } from '../lib/providers'

/*
 * Design read: an explainer for people deciding whether to trust the tool, in the
 * landing page's paper/ink/matcha language. ENERGY 2 / RHYTHM 3 / MOTION 3: this is
 * the one page where motion does the explaining, so each animation shows a real
 * step of lib/pipeline.ts. Everything plays once when it comes into view; nothing
 * loops, and MotionConfig honours reduced-motion settings.
 */

const EASE = [0.22, 1, 0.36, 1] as const
const MB = 1024 * 1024

export default function HowItWorksPage() {
  return (
    <MotionConfig reducedMotion="user">
      <SitePage>
        <Hero />
        <Stages />
        <DataFlow />
        <FromTheCode />
        <Closing />
      </SitePage>
    </MotionConfig>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:pb-28 lg:pt-20">
        <div>
          <p className="text-[13.5px] font-semibold text-ink-soft">How it works</p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-headline mt-4 text-[clamp(3.2rem,7vw,6rem)] text-ink"
          >
            One source in. <span className="font-serif text-matcha-deep">Every format</span> out.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mt-7 max-w-[46ch] text-[17.5px] leading-relaxed text-ink-soft"
          >
            Here is exactly what happens between pressing Generate and reading your drafts, and where your content goes on the way.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/workspace"
              className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
            >
              Try it on a document <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#stages"
              className="rounded-full border border-hair bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
            >
              Walk through the pipeline
            </a>
          </motion.div>
        </div>
        <HeroFlow />
      </div>
    </section>
  )
}

const HERO_OUTPUTS = ['Executive Summary', 'LinkedIn Post', 'Slide Deck', 'Hindi translation']

/** Source document → pipeline → four drafts, drawn once when the hero loads. */
function HeroFlow() {
  const [run, setRun] = useState(0)
  return (
    <div className="relative">
      <div key={run} className="relative grid grid-cols-[minmax(0,1fr)_28px_auto_40px_minmax(0,1.15fr)] items-center rounded-[28px] border-2 border-ink bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,16,15,0.45)] sm:grid-cols-[minmax(0,1fr)_44px_auto_64px_minmax(0,1.15fr)] sm:p-8">
        {/* Source */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="rounded-2xl border border-hair bg-paper p-3.5 sm:p-4"
        >
          <FileText className="h-5 w-5 text-ink" strokeWidth={1.7} />
          <p className="mt-2 truncate font-mono text-[10.5px] text-ink-mute sm:text-[11.5px]">advisory.txt</p>
          <div className="mt-3 space-y-1.5">
            {[92, 78, 86, 60, 72].map((w, i) => (
              <motion.span
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.07, ease: EASE }}
                style={{ width: `${w}%` }}
                className="block h-1.5 origin-left rounded-full bg-ink/15"
              />
            ))}
          </div>
        </motion.div>

        {/* Source → pipeline */}
        <svg viewBox="0 0 40 10" preserveAspectRatio="none" className="h-3 w-full" aria-hidden>
          <motion.path d="M0 5 H40" stroke="#0f100f" strokeWidth="1.5" vectorEffect="non-scaling-stroke" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.7, ease: 'easeInOut' }} />
        </svg>

        {/* Pipeline node */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 1.05 }}
          className="relative grid h-14 w-14 place-items-center rounded-2xl bg-ink sm:h-16 sm:w-16"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-matcha" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2" />
          </svg>
          <motion.span
            aria-hidden
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.7 }}
            transition={{ duration: 1, delay: 1.25, ease: 'easeOut' }}
            className="absolute inset-0 rounded-2xl ring-2 ring-matcha-deep"
          />
        </motion.div>

        {/* Pipeline → four drafts */}
        <svg viewBox="0 0 64 100" preserveAspectRatio="none" className="h-full min-h-[180px] w-full" aria-hidden>
          {[12.5, 37.5, 62.5, 87.5].map((y, i) => (
            <motion.path
              key={y}
              d={`M0 50 C 32 50, 32 ${y}, 64 ${y}`}
              stroke="#0f100f"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1.45 + i * 0.08, ease: 'easeInOut' }}
            />
          ))}
        </svg>

        {/* Drafts */}
        <ul className="grid gap-2.5">
          {HERO_OUTPUTS.map((label, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.8 + i * 0.12, ease: EASE }}
              className="flex items-center gap-2 rounded-xl border border-hair bg-white px-2.5 py-2.5 sm:gap-2.5 sm:px-3"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-matcha">
                <Check className="h-3 w-3 text-ink" strokeWidth={3} />
              </span>
              <span className="truncate text-[11.5px] font-medium text-ink sm:text-[13px]">{label}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="mt-3 ml-auto flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Play again
      </button>
    </div>
  )
}

/* ─── The four stages (scroll-driven) ────────────────────────────────────── */

const STAGES = [
  {
    title: 'Ingest',
    lead: 'Bring the source in however you have it.',
    body: `Paste text, drop a link, or upload a TXT, Markdown, CSV or JSON file up to ${MAX_FILE_BYTES / MB} MB. Images up to ${MAX_IMAGE_BYTES / MB} MB are read too: by a vision model when you have picked one, otherwise by an OCR engine that runs in your browser.`,
    facts: ['Paste, link or upload', 'Images: vision model or on-device OCR'],
  },
  {
    title: 'Clean',
    lead: 'One pass turns raw input into tidy source text.',
    body: 'The first model you selected strips noise, repairs broken formatting and keeps every fact. If that call fails, the run carries on with your original text, so a hiccup here never stops your drafts.',
    facts: ['One call, first selected model', 'Falls back to the raw text'],
  },
  {
    title: 'Draft in parallel',
    lead: 'Every format, from every model, at the same time.',
    body: `Each format is its own step with its own prompt, carrying your tone and audience. They all run at once, and in comparison mode each of up to ${MAX_COMPARE} models writes the full set. One failed draft never takes the others down.`,
    facts: ['Formats × models, all at once', 'Failures stay contained'],
  },
  {
    title: 'Review and refine',
    lead: 'Read, compare, refine, keep.',
    body: 'Drafts land on the output canvas, side by side when you compare models. Refine any single draft with a plain instruction, copy or export it, and find it again later in History.',
    facts: ['Refine one draft at a time', 'Saved to your History'],
  },
]

function Stages() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 60%', 'end 70%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  return (
    <section id="stages" ref={sectionRef} className="scroll-mt-24 border-y border-hair bg-paper-deep">
      <div className="mx-auto max-w-[1200px] px-5 pt-20 sm:px-8 lg:pt-28">
        <p className="text-[13.5px] font-semibold text-ink-soft">The pipeline</p>
        <h2 className="font-display mt-3 max-w-[18ch] text-[clamp(2.2rem,4.8vw,3.6rem)] text-ink">Four steps, one run.</h2>
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pb-28">
        {/* Sticky stage visual (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-28 flex h-[calc(100vh-9rem)] max-h-[720px] flex-col justify-center">
            <ol className="mb-5 grid grid-cols-4 gap-2" aria-label="Pipeline progress">
              {STAGES.map((s, i) => (
                <li key={s.title} className={`text-[12.5px] font-medium transition-colors ${i <= active ? 'text-ink' : 'text-ink-mute'}`}>
                  <span className="font-mono tabular-nums">{String(i + 1).padStart(2, '0')}</span> {s.title}
                </li>
              ))}
            </ol>
            <div className="h-1 overflow-hidden rounded-full bg-hair">
              <motion.div style={{ scaleX: progress }} className="h-full origin-left rounded-full bg-ink" />
            </div>
            <div className="relative mt-6 aspect-[5/4] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-0"
                >
                  <StageVisual index={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stage copy; each block claims the visual while it crosses the middle of the screen */}
        <div>
          {STAGES.map((stage, i) => (
            <StageCopy key={stage.title} index={i} onActive={() => setActive(i)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StageCopy({ index, onActive }: { index: number; onActive: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => { if (inView) onActive() }, [inView, onActive])
  const stage = STAGES[index]

  return (
    <div ref={ref} className="flex flex-col justify-center py-10 lg:min-h-[78vh] lg:py-0">
      <div className="mb-8 aspect-[5/4] w-full lg:hidden">
        <StageVisualOnView index={index} />
      </div>
      <p className="font-mono text-[13px] text-ink-mute tabular-nums">{String(index + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}</p>
      <h3 className="font-headline mt-3 text-[clamp(2.4rem,4.5vw,3.6rem)] text-ink">{stage.title}</h3>
      <p className="mt-4 text-[19px] font-medium leading-snug text-ink">{stage.lead}</p>
      <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.75] text-ink-soft">{stage.body}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {stage.facts.map((f) => (
          <li key={f} className="rounded-lg border border-hair bg-white px-3 py-1.5 text-[13px] text-ink-soft">{f}</li>
        ))}
      </ul>
    </div>
  )
}

/** Mobile: each stage plays its own visual when it scrolls into view. */
function StageVisualOnView({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  return <div ref={ref} className="h-full">{inView && <StageVisual index={index} />}</div>
}

function StageVisual({ index }: { index: number }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-ink bg-white shadow-[0_24px_60px_-34px_rgba(15,16,15,0.5)]">
      <div className="flex items-center justify-between border-b border-hair px-5 py-3">
        <span className="text-[12.5px] font-semibold text-ink">{STAGES[index].title}</span>
        <span className="font-mono text-[11.5px] text-ink-mute">step {index + 1} of {STAGES.length}</span>
      </div>
      <div className="relative min-h-0 flex-1 bg-paper p-5 sm:p-6">
        {index === 0 && <IngestVisual />}
        {index === 1 && <CleanVisual />}
        {index === 2 && <FanOutVisual />}
        {index === 3 && <DeliverVisual />}
      </div>
    </div>
  )
}

function IngestVisual() {
  const sources = [
    { icon: FileText, label: 'Paste text' },
    { icon: Link2, label: 'Link' },
    { icon: Upload, label: 'report.md' },
  ]
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {sources.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: EASE }}
            className="flex items-center gap-2 rounded-xl border border-hair bg-white px-3 py-2.5"
          >
            <Icon className="h-4 w-4 shrink-0 text-ink" strokeWidth={1.8} />
            <span className="truncate text-[12.5px] font-medium text-ink">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* An image being read: scan line sweeps once, then the text it found appears */}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="relative overflow-hidden rounded-xl border border-hair bg-white p-4"
        >
          <div className="flex items-center gap-2 text-[12px] font-medium text-ink-soft">
            <ImageIcon className="h-4 w-4" strokeWidth={1.8} /> q3-slide.png
          </div>
          <p className="mt-4 text-[15px] font-bold leading-tight text-ink">Q3 revenue grew 12%</p>
          <p className="mt-1.5 text-[13px] text-ink-soft">Churn fell to 3%</p>
          <motion.div
            aria-hidden
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 1.4, delay: 0.9, ease: 'easeInOut' }}
            className="absolute inset-x-0 h-10 -translate-y-full bg-gradient-to-b from-transparent to-matcha/70"
          />
        </motion.div>
        <div className="flex flex-col rounded-xl border border-dashed border-ink/25 bg-white/60 p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-ink-soft">
            <ScanText className="h-4 w-4" strokeWidth={1.8} /> Text read
          </div>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3, duration: 0.4 }} className="mt-4 font-mono text-[12px] leading-relaxed text-ink">
            Q3 revenue grew 12%
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 0.4 }} className="font-mono text-[12px] leading-relaxed text-ink">
            Churn fell to 3%
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }} className="mt-auto text-[11.5px] text-ink-mute">
            On-device OCR, nothing uploaded
          </motion.p>
        </div>
      </div>
    </div>
  )
}

const NOISY = [
  { w: 34, noise: 'Accept cookies' },
  { w: 88 },
  { w: 22, noise: 'Share · Print · Email' },
  { w: 71 },
  { w: 95 },
  { w: 18, noise: 'Advertisement' },
  { w: 64 },
]

function CleanVisual() {
  return (
    <div className="grid h-full grid-cols-[1fr_auto_1fr] items-stretch gap-3">
      <div className="rounded-xl border border-hair bg-white p-4">
        <p className="text-[12px] font-medium text-ink-mute">Raw input</p>
        <div className="mt-4 space-y-2.5">
          {NOISY.map((line, i) =>
            line.noise ? (
              <motion.p
                key={i}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0.35, textDecorationColor: 'rgba(185,28,28,0.8)' }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                className="truncate font-mono text-[11px] text-red-800 line-through decoration-transparent"
              >
                {line.noise}
              </motion.p>
            ) : (
              <span key={i} style={{ width: `${line.w}%` }} className="block h-2 rounded-full bg-ink/20" />
            ),
          )}
        </div>
      </div>
      <div className="flex items-center">
        <ArrowRight className="h-5 w-5 text-ink" />
      </div>
      <div className="rounded-xl border border-ink/20 bg-white p-4">
        <p className="text-[12px] font-medium text-ink-mute">Clean source</p>
        <div className="mt-4 space-y-4">
          {[[100, 96, 58], [100, 88, 100, 40]].map((para, p) => (
            <div key={p} className="space-y-2">
              {para.map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3 + (p * 3 + i) * 0.08, duration: 0.45, ease: EASE }}
                  style={{ width: `${w}%` }}
                  className="block h-2 origin-left rounded-full bg-ink/70"
                />
              ))}
            </div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }} className="mt-5 flex items-center gap-1.5 text-[11.5px] text-ink-soft">
          <Check className="h-3.5 w-3.5 text-matcha-deep" strokeWidth={2.5} /> Every fact kept
        </motion.p>
      </div>
    </div>
  )
}

const FAN_FORMATS = ['Summary', 'LinkedIn', 'Slides', 'Blog']
// Durations differ on purpose: parallel drafts finish in whatever order they finish.
const FAN_TIMES = [[1.4, 1.9], [1.1, 1.6], [1.8, 1.3], [1.5, 2.1]]

function FanOutVisual() {
  return (
    <div className="grid h-full grid-cols-[auto_52px_minmax(0,1fr)] items-center">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-xl bg-ink px-3.5 py-3 text-[12px] font-medium text-paper"
      >
        Clean<br />source
      </motion.div>
      <svg viewBox="0 0 52 100" preserveAspectRatio="none" className="h-[78%] w-full" aria-hidden>
        {[10, 37, 63, 90].map((y, i) => (
          <motion.path
            key={y}
            d={`M0 50 C 26 50, 26 ${y}, 52 ${y}`}
            stroke="#0f100f"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
          />
        ))}
      </svg>
      <div>
        <div className="mb-2 grid grid-cols-[72px_1fr_1fr] gap-2 px-1 font-mono text-[10.5px] text-ink-mute">
          <span />
          <span>Model A</span>
          <span>Model B</span>
        </div>
        <div className="space-y-2">
          {FAN_FORMATS.map((f, r) => (
            <div key={f} className="grid grid-cols-[72px_1fr_1fr] items-center gap-2 rounded-lg bg-white p-1.5 pl-2.5">
              <span className="truncate text-[12px] font-medium text-ink">{f}</span>
              {FAN_TIMES[r].map((t, c) => (
                <div key={c} className="relative h-6 overflow-hidden rounded-md bg-paper-deep">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: t, ease: 'easeInOut' }}
                    className="absolute inset-0 origin-left bg-matcha"
                  />
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + t, type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute right-1.5 top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded bg-ink"
                  >
                    <Check className="h-2.5 w-2.5 text-matcha" strokeWidth={3} />
                  </motion.span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }} className="mt-3 px-1 text-[11.5px] text-ink-soft">
          8 drafts, started together
        </motion.p>
      </div>
    </div>
  )
}

function useTypewriter(text: string, delayMs: number) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    let i = 0
    let interval: number | undefined
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i++
        setShown(text.slice(0, i))
        if (i >= text.length) window.clearInterval(interval)
      }, 45)
    }, delayMs)
    return () => { window.clearTimeout(start); window.clearInterval(interval) }
  }, [text, delayMs])
  return shown
}

function DeliverVisual() {
  const typed = useTypewriter('Shorter, three bullets', 1300)
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-1.5">
        {['Summary', 'LinkedIn', 'Slides'].map((t, i) => (
          <span key={t} className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium ${i === 0 ? 'bg-white text-ink ring-1 ring-hair' : 'text-ink-mute'}`}>{t}</span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5">
        {['A', 'B'].map((m, c) => (
          <motion.div
            key={m}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + c * 0.12, duration: 0.45, ease: EASE }}
            className="rounded-xl bg-white p-3.5 ring-1 ring-hair"
          >
            <span className="grid h-5 w-5 place-items-center rounded-md bg-ink font-mono text-[10px] font-semibold text-matcha">{m}</span>
            <div className="mt-3 space-y-1.5">
              {[92, 80, 96, 64, 85].map((w, i) => <span key={i} style={{ width: `${w}%` }} className="block h-1.5 rounded-full bg-ink/15" />)}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white p-1.5 ring-1 ring-hair">
        <span className="min-w-0 flex-1 truncate px-2 text-[12.5px] text-ink">
          {typed}
          <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 bg-ink" aria-hidden />
        </span>
        <span className="rounded-lg bg-ink px-3 py-1.5 text-[11.5px] font-semibold text-paper">Refine</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 0.4, ease: EASE }}
        className="flex items-center gap-2 text-[12px] text-ink-soft"
      >
        <Check className="h-3.5 w-3.5 text-matcha-deep" strokeWidth={2.5} /> Saved to History
      </motion.div>
    </div>
  )
}

/* ─── What goes where ────────────────────────────────────────────────────── */

type Reach = 'yes' | 'partly' | 'never'

const PLACES = [
  { id: 'browser', icon: Monitor, name: 'Your browser', stack: 'React 19, Vite, Tailwind CSS, Tesseract.js' },
  { id: 'provider', icon: Server, name: 'The AI provider you pick', stack: 'Groq, Google Gemini or Mistral' },
  { id: 'database', icon: Database, name: 'Sankshep database', stack: 'Supabase Auth and Postgres, row-level security' },
] as const

const ITEMS: { label: string; reach: Record<(typeof PLACES)[number]['id'], [Reach, string]> }[] = [
  {
    label: 'Your source text',
    reach: { browser: ['yes', 'Read here first'], provider: ['yes', 'Sent to write the drafts'], database: ['partly', 'First 300 characters only'] },
  },
  {
    label: 'Your API key',
    reach: { browser: ['yes', 'Held in tab memory'], provider: ['yes', 'Sent with each request'], database: ['never', 'Never stored'] },
  },
  {
    label: 'An uploaded image',
    reach: { browser: ['yes', 'OCR runs here'], provider: ['partly', 'Only if you pick a vision model'], database: ['never', 'Never stored'] },
  },
  {
    label: 'Your drafts',
    reach: { browser: ['yes', 'Shown on the canvas'], provider: ['yes', 'Written there'], database: ['yes', 'Kept for your History'] },
  },
  {
    label: 'Your password',
    reach: { browser: ['yes', 'Typed here'], provider: ['never', 'Never sent'], database: ['yes', 'Stored as a salted hash'] },
  },
]

const REACH_STYLE: Record<Reach, string> = {
  yes: 'bg-ink text-paper',
  partly: 'bg-matcha text-ink',
  never: 'bg-white text-ink-mute ring-1 ring-hair',
}
const REACH_LABEL: Record<Reach, string> = { yes: 'Goes here', partly: 'Partly', never: 'Never' }

function DataFlow() {
  const [item, setItem] = useState(0)
  const current = ITEMS[item]

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="text-[13.5px] font-semibold text-ink-soft">The stack</p>
          <h2 className="font-display mt-3 text-[clamp(2.2rem,4.8vw,3.6rem)] text-ink">What goes where.</h2>
        </div>
        <p className="max-w-[48ch] text-[16px] leading-relaxed text-ink-soft lg:justify-self-end">
          Three places touch your content. Pick something you care about and see which of them ever receives it.
        </p>
      </div>

      <div role="radiogroup" aria-label="Choose what to trace" className="mt-10 flex flex-wrap gap-2">
        {ITEMS.map((it, i) => (
          <button
            key={it.label}
            type="button"
            role="radio"
            aria-checked={item === i}
            onClick={() => setItem(i)}
            className="relative min-h-11 rounded-full px-4 py-2 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            {item === i && (
              <motion.span layoutId="trace-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} className="absolute inset-0 rounded-full bg-ink" />
            )}
            <span className={`relative ${item === i ? 'text-paper' : 'text-ink-soft hover:text-ink'}`}>{it.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLACES.map(({ id, icon: Icon, name, stack }, i) => {
          const [reach, note] = current.reach[id]
          return (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
              className={`flex flex-col rounded-3xl border p-6 transition-colors duration-300 sm:p-7 ${reach === 'never' ? 'border-hair bg-paper' : 'border-ink/20 bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink">
                  <Icon className="h-5 w-5 text-matcha" strokeWidth={1.8} />
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${item}-${reach}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${REACH_STYLE[reach]}`}
                  >
                    {REACH_LABEL[reach]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <h3 className="mt-6 text-[19px] font-semibold text-ink">{name}</h3>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${item}-note`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 min-h-[1.6em] text-[15px] text-ink-soft"
                >
                  {note}
                </motion.p>
              </AnimatePresence>
              <p className="mt-6 border-t border-hair pt-4 text-[13px] leading-relaxed text-ink-mute">{stack}</p>
            </motion.article>
          )
        })}
      </div>

      <p className="mt-6 flex items-start gap-2 text-[13.5px] text-ink-mute">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
        <span>
          The full detail is in the <Link to="/privacy-policy" className="font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">Privacy Policy</Link>.
        </span>
      </p>
    </section>
  )
}

/* ─── Numbers read from the code ─────────────────────────────────────────── */

function FromTheCode() {
  const draftingModels = PROVIDERS.flatMap((p) => p.models).length
  const facts: { value: string; label: ReactNode }[] = [
    { value: String(ALL_FORMATS.length), label: <>output formats, plus one you describe yourself</> },
    { value: String(draftingModels), label: <>drafting models across {PROVIDERS.length} providers</> },
    { value: String(MAX_COMPARE), label: <>models side by side in one comparison</> },
    { value: `${MAX_FILE_BYTES / MB} MB`, label: <>largest file you can upload</> },
    { value: '0', label: <>API keys stored anywhere</> },
  ]
  return (
    <section className="border-y border-hair bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <p className="text-[13.5px] font-semibold text-ink-soft">Read straight from the code</p>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
          {facts.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
              className="flex flex-col-reverse border-l border-hair pl-4"
            >
              <dt className="mt-3 text-[13.5px] leading-snug text-ink-soft">{f.label}</dt>
              <dd className="font-mono text-[clamp(2rem,3.6vw,2.9rem)] font-medium leading-none tracking-[-0.04em] text-ink tabular-nums">{f.value}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ─── Closing ────────────────────────────────────────────────────────────── */

function Closing() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center text-paper sm:px-12">
        <h2 className="font-headline mx-auto max-w-2xl text-[clamp(2.4rem,5vw,3.8rem)]">
          Try it on <span className="font-serif text-matcha">your own</span> document.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-paper/70">Use the demo account, or sign up and keep your History private.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 rounded-full bg-matcha px-6 py-3.5 text-[15px] font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
          >
            Open Workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/about"
            className="rounded-full border border-paper/25 px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:border-paper/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
          >
            Meet the team
          </Link>
        </div>
      </div>
    </section>
  )
}
