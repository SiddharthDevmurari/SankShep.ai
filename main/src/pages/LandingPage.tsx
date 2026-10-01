// Landing page. Nav and footer are shared with the static pages (components/site/SiteChrome).
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter, SiteNav } from '../components/site/SiteChrome'
import { InstallAppButton } from '../components/InstallApp'
import { useCopy, useLang } from '../i18n'
import { LANDING_COPY } from './landingCopy'

/* ---------- tiny inline icon set (stroke, 1.6) ---------- */
type IconProps = { className?: string }
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const ArrowRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const FileIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
)
const Shield = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)
const NoTrain = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6 6l12 12" />
  </svg>
)
const Check = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)
const Sparkle = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
  </svg>
)
const Upload = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M12 15V4M8 8l4-4 4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
  </svg>
)
const Layers = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />
  </svg>
)
const Database = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </svg>
)
const Agents = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <rect x="4" y="8" width="16" height="11" rx="2" />
    <path d="M12 8V5M9 3h6M8 13h.01M16 13h.01M9 16h6" />
  </svg>
)
const Send = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)

/* ---------- word-by-word reveal ---------- */
function Reveal({
  text,
  as: Tag = 'span',
  className = '',
  immediate = false,
  baseDelay = 0,
  accentClass = 'text-matcha-deep',
}: {
  text: string
  as?: 'span' | 'h1' | 'h2' | 'h3'
  className?: string
  immediate?: boolean
  baseDelay?: number
  accentClass?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let interval: ReturnType<typeof setInterval> | undefined
    let raf = 0
    const replay = () => {
      setPlay(false)
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => requestAnimationFrame(() => setPlay(true)))
    }
    const start = () => { replay(); interval = setInterval(replay, 7000) }
    const stop = () => { if (interval) clearInterval(interval); interval = undefined }
    if (immediate) start()
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!interval) start() } else { stop() } }, { threshold: 0.35 })
    io.observe(el)
    return () => { io.disconnect(); stop(); cancelAnimationFrame(raf) }
  }, [immediate])

  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  let idx = 0
  return (
    <Tag ref={ref as never} className={`sk-reveal ${play ? 'sk-play' : ''} ${className}`}>
      {parts.map((part, pi) => {
        const accent = part.startsWith('*') && part.endsWith('*')
        const clean = accent ? part.slice(1, -1) : part
        return clean.split(/(\s+)/).map((tok, ti) => {
          if (/^\s+$/.test(tok)) return <span key={`${pi}-${ti}`}> </span>
          const i = idx++
          return (
            <span key={`${pi}-${ti}`} className={`sk-w ${accent ? `font-serif ${accentClass}` : ''}`} style={{ ['--i' as string]: i + baseDelay }}>
              {tok}
            </span>
          )
        })
      })}
    </Tag>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const t = useCopy(LANDING_COPY).hero
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(#e2dfd2 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)' }} />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
        <div>
          <div className="mb-6">
            <p className="text-[13px] font-semibold text-ink-soft">{t.sihLine}</p>
            <p className="font-serif mt-1 text-[17px] leading-snug text-ink">{t.sihProblem}</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-hair bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{t.chip}</span>
          <Reveal as="h1" immediate text={t.title} className="font-display mt-6 text-[clamp(2.9rem,6.4vw,5rem)] text-ink" />
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">{t.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/workspace" className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5">
              {t.launch} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#how-it-works" className="rounded-full border border-hair bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-paper-deep">{t.seeHow}</a>
            <InstallAppButton />
          </div>
          <div className="mt-8 flex items-center gap-5 text-[13px] text-ink-soft">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-matcha-deep" /> {t.noCard}</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-matcha-deep" /> {t.privateMode}</span>
          </div>
        </div>
        <HeroExplainer />
      </div>
    </section>
  )
}

const SCENE_COUNT = 4
const SCENE_MS = 3000

function HeroExplainer() {
  const [scene, setScene] = useState(0)
  const [playing, setPlaying] = useState(true)
  const copy = useCopy(LANDING_COPY).explainer
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setScene((s) => (s + 1) % SCENE_COUNT), SCENE_MS)
    return () => clearTimeout(t)
  }, [scene, playing])
  return (
    <div className="relative">
      <div className="sk-glow-ring pointer-events-none absolute -inset-3 rounded-[26px] bg-matcha/50 blur-2xl" />
      <div className="pointer-events-none absolute -inset-px rounded-[19px] bg-gradient-to-br from-matcha via-transparent to-matcha/40" />
      <div className="relative overflow-hidden rounded-[18px] border-2 border-ink bg-white shadow-[0_20px_50px_-20px_rgba(15,16,15,0.45)] ring-1 ring-ink/5">
        <div className="flex items-center gap-1.5 border-b border-hair px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5e2d6]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5e2d6]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5e2d6]" />
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-soft/70">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> {copy.label}
          </span>
        </div>
        <div className="relative h-[360px] bg-paper px-6 py-6 sm:h-[380px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-matcha-deep">{copy.scenes[scene].tag}</p>
          <div className="mt-4 h-[264px]"><SceneStage scene={scene} /></div>
        </div>
        <div className="border-t border-hair px-5 py-4">
          <div className="flex items-center gap-1.5">
            {copy.scenes.map((_, i) => (
              <button key={i} onClick={() => setScene(i)} className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-hair" aria-label={`${copy.scene} ${i + 1}`}>
                <span className="absolute inset-y-0 left-0 rounded-full bg-ink" style={i < scene ? { width: '100%' } : i === scene ? { width: '100%', animation: playing ? `sk-bar ${SCENE_MS}ms linear both` : 'none' } : { width: '0%' }} />
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => setPlaying((p) => !p)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform hover:scale-105" aria-label={playing ? copy.pause : copy.play}>
              {playing ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>
              )}
            </button>
            <p key={scene} className="sk-rise text-[14px] font-medium text-ink">{copy.scenes[scene].caption}</p>
            <span className="ml-auto text-[12px] tabular-nums text-ink-soft/70">0:0{scene * 3} / 0:12</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SceneStage({ scene }: { scene: number }) {
  const copy = useCopy(LANDING_COPY).explainer
  if (scene === 0) return (
    <div key="s0" className="sk-rise flex h-full flex-col items-center justify-center">
      <div className="w-full rounded-2xl border-2 border-dashed border-hair bg-white p-8 text-center">
        <span className="sk-pop mx-auto grid h-14 w-14 place-items-center rounded-xl bg-ink text-paper"><FileIcon className="h-7 w-7" /></span>
        <p className="mt-4 text-[15px] font-semibold">Q3_Report.pdf</p>
        <p className="text-[12px] text-ink-soft">{copy.fileMeta}</p>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {copy.sources.map((t) => (
          <span key={t} className="rounded-full border border-hair bg-white px-3 py-1 text-[11px] font-medium text-ink-soft">{t}</span>
        ))}
      </div>
    </div>
  )
  if (scene === 1) return (
    <div key="s1" className="sk-rise flex h-full flex-col justify-center">
      <div className="relative overflow-hidden rounded-2xl border border-hair bg-white p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-matcha/70 to-transparent" style={{ animation: 'sk-scan 1.6s ease-in-out infinite' }} />
        <div className="relative space-y-2.5">
          {[92, 78, 85, 64, 88, 72].map((w, i) => <div key={i} className="h-2.5 rounded-full bg-paper-deep" style={{ width: `${w}%` }} />)}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-medium text-ink-soft">
        <Sparkle className="h-4 w-4 text-matcha-deep" /> {copy.analysing}
      </div>
    </div>
  )
  if (scene === 2) return (
    <div key="s2" className="sk-rise grid h-full grid-cols-2 content-center gap-2.5">
      {copy.chips.map((label, i) => (
        <div key={label} className="sk-pop flex items-center justify-between rounded-xl border border-ink/15 bg-matcha/70 px-3.5 py-3.5" style={{ animationDelay: `${i * 140}ms` }}>
          <span className="text-[13.5px] font-medium leading-tight">{label}</span>
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-paper"><Check className="h-3 w-3" /></span>
        </div>
      ))}
    </div>
  )
  return (
    <div key="s3" className="sk-rise flex h-full flex-col justify-center gap-2.5">
      {copy.outputs.map((o, i) => (
        <div key={o.t} className="sk-pop flex items-center gap-3 rounded-xl border border-hair bg-white px-4 py-3" style={{ animationDelay: `${i * 160}ms` }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-matcha text-ink"><Check className="h-4 w-4" /></span>
          <div className="min-w-0"><p className="truncate text-[14px] font-semibold">{o.t}</p><p className="text-[12px] text-ink-soft">{o.d}</p></div>
          <ArrowRight className="ml-auto h-4 w-4 text-ink-soft" />
        </div>
      ))}
    </div>
  )
}

// ── Security / Workflow / ChatBlock / HowItWorks / CTA / Footer ───────────────
// (keeping these identical to original App.tsx)

// One icon per pipeline stage, in the order of the copy's `pipeline.stages`.
const STAGE_ICONS = [Upload, FileIcon, Layers, Database, Agents, Sparkle, Shield, Send]
type Stage = (typeof LANDING_COPY.en.pipeline.stages)[number] & { icon: typeof Upload }

/** The data rows (in the copy) say what each processing mode sends off the user's computer; they match the workspace's actual behaviour. */
const SECURITY_ICONS = [Shield, NoTrain, Check]

function Security() {
  const t = useCopy(LANDING_COPY).security
  const items = t.items.map((item, i) => ({ ...item, icon: SECURITY_ICONS[i] }))
  return (
    <section id="security" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-matcha">{t.eyebrow}</span>
            <Reveal as="h2" text={t.title} accentClass="text-matcha" className="font-display mt-4 text-[clamp(2.2rem,4.8vw,3.6rem)] text-paper" />
          </div>
          <div>
            <p className="text-[16px] leading-relaxed text-paper/75">
              {t.body}
            </p>
            <Link to="/features#private-mode" className="group mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-matcha">
              {t.link} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* The difference, row by row: what leaves the computer in each mode */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-hair-dark">
          <table className="w-full border-collapse text-left text-[14px]">
            <caption className="sr-only">{t.caption}</caption>
            <thead>
              <tr className="border-b border-hair-dark text-[12.5px] text-paper/55">
                <th scope="col" className="px-5 py-3.5 font-medium lg:px-7">{t.head[0]}</th>
                <th scope="col" className="hidden px-5 py-3.5 font-medium sm:table-cell lg:px-7">{t.head[1]}</th>
                <th scope="col" className="px-5 py-3.5 font-medium text-matcha lg:px-7">{t.head[2]}</th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r.what} className="border-b border-hair-dark last:border-b-0">
                  <th scope="row" className="px-5 py-4 font-medium text-paper lg:px-7">{r.what}</th>
                  <td className="hidden px-5 py-4 text-paper/55 sm:table-cell lg:px-7">{r.cloud}</td>
                  <td className="px-5 py-4 lg:px-7">
                    <span className="flex items-start gap-2 text-paper"><Check className="mt-0.5 h-4 w-4 shrink-0 text-matcha" />{r.local}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-hair-dark bg-hair-dark md:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-ink p-7 lg:p-9">
              <Icon className="h-6 w-6 text-matcha" />
              <h3 className="mt-6 text-[19px] font-medium">{title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-paper/55">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PipelineCard({ stage, index, active, onPick }: { stage: Stage; index: number; active: boolean; onPick: () => void }) {
  const { icon: Icon } = stage
  return (
    <button
      onClick={onPick}
      className={`group relative flex w-full flex-col rounded-2xl border p-4 text-left transition-all duration-300 ${
        active
          ? '-translate-y-1 border-ink/15 bg-white shadow-[0_22px_45px_-26px_rgba(15,16,15,0.5)]'
          : 'border-hair bg-white hover:border-ink/10 hover:shadow-md'
      }`}
    >
      {active && <span className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-matcha-deep" />}
      <div className="flex items-start justify-between">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink">
          <Icon className="h-[18px] w-[18px] text-matcha" />
        </span>
        <span className="font-serif text-[22px] leading-none text-ink-soft/45">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="mt-4 text-[15.5px] font-semibold leading-tight text-ink">{stage.title}</h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{stage.desc}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {stage.tags.map((t) => (
          <span
            key={t}
            className={`rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${
              active ? 'border-ink/15 bg-matcha/40 text-ink' : 'border-hair bg-paper text-ink-soft'
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  )
}

function PipelineMap() {
  const [active, setActive] = useState(0)
  const [running, setRunning] = useState(true)
  const copy = useCopy(LANDING_COPY).pipeline
  const STAGES: Stage[] = copy.stages.map((s, i) => ({ ...s, icon: STAGE_ICONS[i] }))
  const ref = useRef<HTMLDivElement>(null)
  const inView = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    const t = setInterval(() => {
      if (inView.current && running) setActive((a) => (a + 1) % STAGE_ICONS.length)
    }, 2000)
    return () => { io.disconnect(); clearInterval(t) }
  }, [running])

  // Row 1: indices 0-3  (Ingest → Parse → Chunk → Embed & store)
  const row1 = [0, 1, 2, 3]
  // Row 2: indices 7,6,5,4  (Deliver ← Validate ← Generate ← Orchestrate)
  const row2 = [7, 6, 5, 4]

  const HArrow = ({ lit, flip }: { lit: boolean; flip?: boolean }) => (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition-colors ${lit ? 'text-matcha-deep' : 'text-ink-soft/30'} ${flip ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  )

  return (
    <div
      ref={ref}
      className="mt-10"
      onMouseEnter={() => setRunning(false)}
      onMouseLeave={() => setRunning(true)}
    >
      {/* Status badge */}
      <div className="mb-8 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-hair bg-white px-4 py-1.5 text-[13px] font-medium shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-ink-soft">{copy.step} {active + 1}/8</span>
          <span className="hidden text-ink sm:inline">· {STAGES[0].live}</span>
        </span>
      </div>

      {/* Desktop snake grid */}
      <div className="hidden lg:block">
        {/* Row 1: left → right */}
        <div className="grid grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] items-center gap-y-3">
          {row1.flatMap((idx, pos) => {
            const cells = [
              <PipelineCard key={`c${idx}`} stage={STAGES[idx]} index={idx} active={active === idx} onPick={() => setActive(idx)} />,
            ]
            if (pos < row1.length - 1) cells.push(<HArrow key={`a${pos}`} lit={active === row1[pos + 1]} />)
            return cells
          })}
        </div>

        {/* Down connector */}
        <div className="flex justify-end pr-[calc(12.5%-8px)] py-1">
          <svg
            viewBox="0 0 24 24"
            className={`h-6 w-6 transition-colors ${active === 3 || active === 4 ? 'text-matcha-deep' : 'text-ink-soft/30'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </div>

        {/* Row 2: Deliver | Validate | Generate | Orchestrate, with ← arrows */}
        <div className="grid grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] items-center gap-y-3">
          {row2.flatMap((idx, pos) => {
            const cells = [
              <PipelineCard key={`c${idx}`} stage={STAGES[idx]} index={idx} active={active === idx} onPick={() => setActive(idx)} />,
            ]
            if (pos < row2.length - 1) cells.push(<HArrow key={`a${pos}`} lit={active === row2[pos + 1]} flip />)
            return cells
          })}
        </div>
      </div>

      {/* Mobile: single column 1–8 */}
      <div className="flex flex-col gap-3 lg:hidden">
        {STAGES.map((s, i) => (
          <PipelineCard key={i} stage={s} index={i} active={active === i} onPick={() => setActive(i)} />
        ))}
      </div>
    </div>
  )
}

function Workflow() {
  const t = useCopy(LANDING_COPY).pipeline
  return (
    <section id="how-it-works" className="relative overflow-hidden border-y border-hair bg-paper">
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'linear-gradient(#ece9dd 1px, transparent 1px), linear-gradient(90deg, #ece9dd 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 100%)' }} />
      <div className="relative mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft"><span className="flex h-1.5 w-1.5 rounded-full bg-matcha-deep" /> {t.eyebrow}</span>
          <Reveal as="h2" text={t.title} className="font-display mt-4 text-[clamp(2.2rem,4.8vw,3.6rem)] text-ink" />
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">{t.body}</p>
        </div>
        <PipelineMap />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {t.highlights.map((p) => (
            <div key={p.k} className="rounded-2xl border border-hair bg-white/70 p-5">
              <p className="flex items-center gap-2 text-[14px] font-semibold"><Check className="h-4 w-4 text-matcha-deep" />{p.k}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{p.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ChatBlock() {
  const t = useCopy(LANDING_COPY).chat
  return (
    <section id="custom-prompts" className="bg-matcha text-ink">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60">{t.eyebrow}</span>
          <Reveal as="h2" text={t.title} accentClass="text-ink" className="font-display mt-4 text-[clamp(2.6rem,5.8vw,4.6rem)] text-ink" />
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/70">{t.body}</p>
        </div>
        <div className="relative">
          <div className="absolute -left-5 -top-5 hidden h-20 w-20 rounded-2xl bg-white/40 blur-xl sm:block" />
          <div className="relative rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_30px_70px_-35px_rgba(15,16,15,0.5)]">
            <div className="flex items-center gap-2 text-[12px] font-medium text-ink-soft">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-ink text-matcha"><span className="font-serif text-[13px] leading-none">S</span></span>
              Sankshep Chat <span className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-soft/70"><span className="h-1.5 w-1.5 rounded-full bg-matcha-deep" /> {t.generating}</span>
            </div>
            <div className="mt-4 rounded-xl border border-hair bg-paper p-4 text-[15px] leading-relaxed">
              {t.prompt[0]}<mark className="rounded bg-mist px-1 py-0.5 text-ink">{t.prompt[1]}</mark>{t.prompt[2]}<mark className="rounded bg-mist px-1 py-0.5 text-ink">{t.prompt[3]}</mark>{t.prompt[4]}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-hair bg-white px-4 py-2.5 text-[13px] text-ink-soft/70">{t.placeholder}</div>
              <button className="group flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-paper">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...stroke}><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
                {t.regenerate}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const STEP_ACCENTS = ['file', 'formats', 'custom'] as const

function HowItWorks() {
  const t = useCopy(LANDING_COPY).how
  const steps = t.steps.map((s, i) => ({ ...s, n: `0${i + 1}`, accent: STEP_ACCENTS[i] }))
  const tags = t.tags
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{t.eyebrow}</span>
          <Reveal as="h2" text={t.title} className="font-display mt-4 max-w-xl text-[clamp(2.2rem,4.8vw,3.6rem)] text-ink" />
        </div>
        <Link to="/workspace" className="group flex items-center gap-1.5 text-[14px] font-medium text-ink">
          {t.explore} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div id="formats" className="mt-14 grid gap-5 lg:grid-cols-3">
        {steps.map((s) => (
          <article key={s.n} className="flex flex-col rounded-2xl border border-hair bg-white p-6 transition-shadow hover:shadow-[0_24px_50px_-32px_rgba(15,16,15,0.35)]">
            <div className="flex items-center justify-between">
              <span className="font-serif text-[28px] text-matcha-deep">{s.n}</span>
              <span className="h-8 w-8 rounded-full border border-hair" />
            </div>
            {s.accent === 'file' && (
              <div className="mt-6 rounded-xl border border-dashed border-hair bg-paper p-5">
                <div className="grid place-items-center gap-2 py-3 text-center">
                  <FileIcon className="h-7 w-7 text-ink-soft" />
                  <p className="text-[12px] font-medium text-ink-soft">{t.drop}</p>
                  <p className="text-[11px] text-ink-soft/60">{t.fileTypes}</p>
                </div>
              </div>
            )}
            {s.accent === 'formats' && (
              <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-hair bg-paper p-5">
                {tags.map((t, i) => <span key={t} className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${i < 3 ? 'border-ink/15 bg-matcha/70' : 'border-hair bg-white text-ink-soft'}`}>{t}</span>)}
              </div>
            )}
            {s.accent === 'custom' && (
              <div className="mt-6 rounded-xl border border-hair bg-paper p-5">
                <div className="rounded-lg border border-hair bg-white px-3 py-2 text-[12px] text-ink-soft">
                  <span className="text-ink-soft/60">{t.promptLabel}</span> {t.promptText}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-matcha-deep"><Sparkle className="h-3.5 w-3.5" /> {t.building}</div>
              </div>
            )}
            <h3 className="mt-6 text-[20px] font-medium leading-snug">{s.title}</h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const DEMO_VIDEO_ID = 'u4sPNRXTmRE'

function DemoVideo() {
  const t = useCopy(LANDING_COPY).demo
  return (
    <section id="demo" className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{t.eyebrow}</span>
          <Reveal as="h2" text={t.title} accentClass="text-ink" className="font-display mt-4 max-w-xl text-[clamp(2.2rem,4.8vw,3.6rem)] text-ink" />
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">{t.body}</p>
        </div>
        <a href={`https://youtu.be/${DEMO_VIDEO_ID}`} target="_blank" rel="noreferrer" className="group flex items-center gap-1.5 text-[14px] font-medium text-ink">
          {t.open} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
      <div className="mt-10 overflow-hidden rounded-[18px] border-2 border-ink bg-ink shadow-[0_20px_50px_-20px_rgba(15,16,15,0.45)]">
        <iframe
          className="aspect-video w-full"
          src={`https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}?rel=0`}
          title={t.frameTitle}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </section>
  )
}

function CtaBanner() {
  const t = useCopy(LANDING_COPY).cta
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-hair bg-ink px-8 py-16 text-center text-paper sm:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(#d4ed64 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative">
          <Reveal as="h2" text={t.title} accentClass="text-matcha" className="font-display mx-auto max-w-2xl text-[clamp(2.2rem,4.8vw,3.4rem)] text-paper" />
          <p className="mx-auto mt-4 max-w-md text-[15px] text-paper/60">{t.body}</p>
          <Link to="/workspace" className="mt-8 inline-flex items-center gap-2 rounded-full bg-matcha px-6 py-3.5 text-[15px] font-medium text-ink transition-transform hover:-translate-y-0.5">
            {t.button} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const { lang } = useLang()
  return (
    <div lang={lang} className="min-h-screen bg-paper">
      <SiteNav />
      <main>
        <Hero />
        <DemoVideo />
        <Security />
        <Workflow />
        <ChatBlock />
        <HowItWorks />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  )
}
