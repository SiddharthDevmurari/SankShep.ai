import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion, useInView } from 'motion/react'
import { AppWindow, Check, Cloud, Cpu, FileText, KeyRound, Lock, Server, Square, WandSparkles } from 'lucide-react'
import { ArrowRight, BrandMark, SitePage } from '../components/site/SiteChrome'
import { ALL_FORMATS, MAX_COMPARE } from '../workspace/LeftPanel'

/*
 * Design read: a features page for people deciding whether Sankshep is worth trying, in the
 * landing page's paper/ink/matcha language. ENERGY 2 / RHYTHM 3 / MOTION 2.
 * The page reads like six short chapters, each with a different composition: a split with a
 * setup checklist, a dark band whose tiles take the shape of each format, a switch showing what a
 * repeat Generate sends and keeps, a pinned draft that changes as you scroll, two small
 * previews you can press, and a second dark band mapping where a document goes in each processing
 * mode. Every visual is a mock of the real
 * workspace, labelled as a preview, and uses one example document, so nothing reads as live data.
 * Motion plays once on view (the two previews play when pressed); MotionConfig honours reduced motion.
 */

const EASE = [0.22, 1, 0.36, 1] as const

const CHAPTERS = [
  { id: 'no-setup', title: 'Works without setup', line: 'No API keys to find. Sign in and generate.' },
  { id: 'one-to-many', title: 'One source, many drafts', line: 'A PDF or a link becomes briefs, posts, slides and more.' },
  { id: 'no-waste', title: 'Your tokens, respected', line: 'New formats are added. Drafts you have are never paid for twice.' },
  { id: 'refine', title: 'Talk to your draft', line: 'Ask for changes the way you’d ask a colleague.' },
  { id: 'your-key', title: 'Your key, your call', line: 'If your own key fails, we ask before switching.' },
  { id: 'private-mode', title: 'Private mode', line: 'Drafts written on your own computer. Nothing leaves it.' },
] as const

const EXAMPLE_FILE = 'solar-policy-report.pdf'

export default function FeaturesPage() {
  return (
    <MotionConfig reducedMotion="user">
      <SitePage>
        <Hero />
        <NoSetup />
        <OneToMany />
        <NoWaste />
        <Refine />
        <YourKey />
        <PrivateMode />
        <Everyday />
        <Closing />
      </SitePage>
    </MotionConfig>
  )
}

/* ─── Shared bits ────────────────────────────────────────────────────────── */

/** Chapter number and name above each section heading: the page's repeated motif. */
function ChapterLabel({ n, children, dark }: { n: number; children: ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[13.5px] font-semibold ${dark ? 'text-paper/75' : 'text-ink-soft'}`}>
      <span className={`font-mono text-[12.5px] tabular-nums ${dark ? 'text-matcha' : 'text-ink'}`}>{String(n).padStart(2, '0')}</span>
      <span aria-hidden className={`h-px w-8 ${dark ? 'bg-paper/25' : 'bg-ink/20'}`} />
      {children}
    </p>
  )
}

/**
 * The serif accent in every headline. Lime text on paper is about 1.4:1, too faint to read, so on light
 * sections the lime becomes a highlighter stroke behind ink; on the ink band the lime itself carries it.
 */
function Accent({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return dark ? (
    <span className="font-serif text-matcha">{children}</span>
  ) : (
    <span className="font-serif whitespace-nowrap bg-[linear-gradient(transparent_58%,#d4ed64_58%,#d4ed64_92%,transparent_92%)] px-[0.06em] text-ink [box-decoration-break:clone]">
      {children}
    </span>
  )
}

/** "Why it matters" note that closes each chapter's copy. */
function WhyItMatters({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`mt-8 border-l-2 pl-4 text-[15.5px] leading-relaxed ${dark ? 'border-matcha text-paper/80' : 'border-matcha-deep text-ink-soft'}`}>
      <span className={`font-semibold ${dark ? 'text-paper' : 'text-ink'}`}>Why it matters: </span>
      {children}
    </p>
  )
}

/** Tag on every mock, so a preview never passes for the real thing. */
function PreviewTag({ children = 'Preview' }: { children?: ReactNode }) {
  return <span className="rounded-md bg-paper-deep px-2 py-0.5 text-[11.5px] font-medium text-ink-soft">{children}</span>
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: EASE },
} as const

/* ─── Hero: the headline, and the four chapters as a table of contents ───── */

function Hero() {
  return (
    <section className="mx-auto grid grid-cols-1 max-w-[1200px] gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16 lg:pb-28 lg:pt-20">
      <div>
        <p className="text-[13.5px] font-semibold text-ink-soft">Features</p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="font-headline mt-4 text-[clamp(3.1rem,7.2vw,6.2rem)] text-ink"
        >
          One document. Every audience. <Accent>No setup.</Accent>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="mt-7 max-w-[48ch] text-[17.5px] leading-relaxed text-ink-soft"
        >
          Here is what Sankshep.ai does for you, one feature at a time, and why each one matters when a report lands on your desk and five
          people need something different from it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
          className="mt-9"
        >
          <Link
            to="/workspace"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
          >
            Try it on a document <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>

      <motion.nav
        aria-label="Features on this page"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
      >
        <ol className="border-b border-hair">
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-5 border-t border-hair py-5 transition-colors hover:bg-white/60 focus-visible:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 sm:px-2"
              >
                <span className="pt-1 font-mono text-[12.5px] text-ink-mute tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-[17px] font-semibold text-ink">{c.title}</span>
                  <span className="mt-1 block text-[14px] leading-snug text-ink-soft">{c.line}</span>
                </span>
                {/* A jump link: the arrow says "goes down the page", and moves on hover. */}
                <ArrowRight className="mt-1.5 h-4 w-4 rotate-90 text-ink-mute transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-ink" />
              </a>
            </li>
          ))}
        </ol>
      </motion.nav>
    </section>
  )
}

/* ─── 01 Works without setup ─────────────────────────────────────────────── */

function NoSetup() {
  return (
    <section id="no-setup" className="scroll-mt-28 border-t border-hair bg-white">
      <div className="mx-auto grid grid-cols-1 max-w-[1200px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-20 lg:py-28">
        <motion.div {...fadeUp}>
          <ChapterLabel n={1}>Works without setup</ChapterLabel>
          <h2 className="font-headline mt-5 text-[clamp(2.6rem,5vw,4.2rem)] text-ink">
            No keys. <Accent>No setup.</Accent> Just start.
          </h2>
          <p className="mt-6 text-[18px] font-medium leading-snug text-ink">
            Most AI tools send you somewhere else first: make an account, find a secret key, paste it back in. Sankshep doesn’t.
          </p>
          <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.75] text-ink-soft">
            We keep working keys for Groq, Gemini and Mistral on our side, and a good model is already picked for you. The first time you
            open the workspace, everything is ready: add your document, choose your formats, press Generate. If you have a key of your own
            you can add it, but you never have to.
          </p>
          <WhyItMatters>your first draft is one click away, not a setup guide away. That is the difference between trying a tool and giving up on it.</WhyItMatters>
        </motion.div>
        <SetupVisual />
      </div>
    </section>
  )
}

const SETUP_STEPS = [
  { label: 'Sign in', note: 'or use the demo account' },
  { label: 'Choose a model', note: 'already picked for you' },
  { label: 'Paste an API key', note: 'not needed' },
]

function SetupVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  return (
    <div ref={ref} className="rounded-[28px] border border-hair bg-paper p-3 shadow-[0_30px_70px_-40px_rgba(15,16,15,0.45)] sm:p-4">
      <div className="rounded-[20px] border border-hair bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink">Before your first draft</p>
          <PreviewTag />
        </div>

        <ol className="mt-5 space-y-2.5">
          {SETUP_STEPS.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.35, ease: EASE }}
              className="flex items-center gap-3 rounded-xl border border-hair px-3.5 py-3"
            >
              <motion.span
                initial={{ scale: 0.4, backgroundColor: '#f2f0e8' }}
                animate={inView ? { scale: 1, backgroundColor: '#d4ed64' } : {}}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.35, ease: EASE }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink"
                aria-hidden
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.span>
              <span className={`text-[14.5px] font-medium ${i === 2 ? 'text-ink-mute line-through decoration-ink/30' : 'text-ink'}`}>{s.label}</span>
              <span className="ml-auto text-[13px] text-ink-soft">{s.note}</span>
            </motion.li>
          ))}
        </ol>

        {/* A slice of the real AI engine step, as it looks on a first visit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.3, ease: EASE }}
          className="mt-6 rounded-2xl bg-paper-deep/70 p-4"
        >
          <p className="text-[12.5px] font-semibold text-ink">Model</p>
          <div className="mt-1.5 flex h-11 items-center justify-between rounded-lg border border-line bg-white px-3.5">
            <span className="font-mono text-[13px] text-ink">openai/gpt-oss-120b</span>
            <span className="rounded-[5px] bg-paper-deep px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">Groq</span>
          </div>
          <p className="mt-4 text-[12.5px] font-semibold text-ink">Groq API key</p>
          <div className="mt-1.5 flex h-11 items-center rounded-lg border border-line bg-white px-3.5 text-[13px] text-ink-mute">Optional (gsk_…)</div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">Leave it empty to use Sankshep’s shared Groq keys.</p>
        </motion.div>

        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.7 }}
          className="mt-4 flex h-12 items-center justify-center gap-3 rounded-xl bg-ink text-[15px] font-semibold text-paper"
        >
          Generate draft
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-matcha">
            <span className="h-1.5 w-1.5 rounded-full bg-matcha" /> Ready
          </span>
        </motion.div>
      </div>
    </div>
  )
}

/* ─── 02 One source, many drafts (dark band) ─────────────────────────────── */

function OneToMany() {
  const [run, setRun] = useState(0)
  const others = ALL_FORMATS.filter((f) => !BOARD_FORMATS.includes(f.label as (typeof BOARD_FORMATS)[number]))

  return (
    <section id="one-to-many" className="scroll-mt-28 bg-ink text-paper">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20">
          <motion.div {...fadeUp}>
            <ChapterLabel n={2} dark>One source, many drafts</ChapterLabel>
            <h2 className="font-headline mt-5 text-[clamp(2.6rem,5.4vw,4.6rem)]">
              One source. <Accent dark>Ten ways</Accent> to share it.
            </h2>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <p className="text-[17px] leading-relaxed text-paper/85">
              Drop in a PDF, a Word file, a web link, a photo of a page, or just paste text. Pick the formats you want, and Sankshep writes
              every one of them at the same time, from that one source.
            </p>
            <WhyItMatters dark>
              you read the report once. Your manager gets a summary, your network gets a post, Monday’s meeting gets slides, and nobody
              copies and pastes between five documents.
            </WhyItMatters>
          </motion.div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-6">
          <p className="flex items-center gap-2.5 text-[13.5px] text-paper/75">
            <span className="rounded-md bg-paper/10 px-2 py-0.5 font-mono text-[12px] text-paper">{EXAMPLE_FILE}</span>
            Example source, five formats, drafted in parallel
          </p>
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            className="min-h-11 rounded-full border border-paper/25 px-4 text-[13.5px] font-medium text-paper transition-colors hover:border-paper/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
          >
            Run it again
          </button>
        </div>

        <FormatBoard key={run} />

        <p className="mt-6 text-[14px] leading-relaxed text-paper/75">
          Also on the list: {others.map((f) => f.short).join(', ')}. Or describe a format of your own in plain words.
        </p>
      </div>
    </section>
  )
}

const BOARD_FORMATS = ['Executive Summary', 'PPT Presentation', 'LinkedIn Post', 'Twitter/X Post', 'Language Translation'] as const

/**
 * Five drafts from one example source. Each tile takes the shape of its format (a tall brief,
 * a wide slide, a short post, a thread, a translation) and finishes at its own moment, the way
 * parallel drafts arrive in the workspace.
 */
function FormatBoard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  return (
    <div ref={ref} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-[auto_auto_auto]">
      <Tile label="Executive Summary" delay={1.1} start={inView} className="lg:col-span-2 lg:row-span-2">
        <p className="text-[11.5px] font-semibold text-ink-mute">Executive brief</p>
        <p className="font-display mt-1.5 text-[21px] font-bold leading-tight text-ink">Rooftop solar for small shops</p>
        <div className="mt-3 h-0.5 w-full bg-ink" />
        <ul className="mt-4 space-y-2.5 text-[13.5px] leading-snug text-ink/85">
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" />The government now pays 40% of installation costs.</li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" />Every state must offer net-metering.</li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" />Payback drops from 6.5 to 3.9 years.</li>
        </ul>
        <p className="mt-5 text-[12.5px] font-semibold text-ink">Decision required</p>
        <p className="mt-1 text-[13.5px] leading-snug text-ink/85">Approve a pilot across our ten largest stores this quarter.</p>
      </Tile>

      <Tile label="Slide Deck" delay={0.7} start={inView} className="sm:col-span-2 lg:col-span-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex aspect-video flex-col justify-between rounded-lg bg-ink p-4 text-paper">
            <span className="font-mono text-[10.5px] text-paper/60">Slide 3 of 8</span>
            <div>
              <p className="font-display text-[19px] font-bold leading-tight">The subsidy, in one line</p>
              <p className="mt-1 text-[12.5px] text-paper/75">40% of the cost, paid up front</p>
            </div>
          </div>
          <div className="text-[13px] leading-snug text-ink/85">
            <p className="font-semibold text-ink">Speaker notes</p>
            <p className="mt-1.5">Start with the number people remember: forty percent. Then show what it means for one shop’s bill.</p>
          </div>
        </div>
      </Tile>

      <Tile label="LinkedIn Post" delay={1.5} start={inView} className="lg:col-span-2">
        <div className="flex items-center gap-2">
          <BrandMark className="h-7 w-7 rounded-full" />
          <p className="text-[12.5px] font-semibold text-ink">Sankshep.ai</p>
        </div>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink/85">
          Small shops just got a real reason to go solar. The new policy pays 40% of the setup, and every state now lets you sell spare power
          back.
        </p>
        <p className="mt-2 text-[12.5px] font-medium text-ink-soft">#Solar #SmallBusiness</p>
      </Tile>

      <Tile label="X / Twitter" delay={0.9} start={inView} className="lg:col-span-2">
        <ol className="space-y-2">
          {['Rooftop solar just got 40% cheaper for small shops.', 'And net-metering is now in every state.', 'Payback: 3.9 years, down from 6.5.'].map(
            (t, i) => (
              <li key={t} className="flex gap-2.5 rounded-lg bg-paper px-3 py-2 text-[13px] leading-snug text-ink/85">
                <span className="font-mono text-[11px] text-ink-mute tabular-nums">{i + 1}/3</span>
                {t}
              </li>
            ),
          )}
        </ol>
      </Tile>

      <Tile label="Translation · Hindi" delay={1.9} start={inView} className="sm:col-span-2 lg:col-span-6">
        <p lang="hi" className="text-[16px] leading-relaxed text-ink">
          छोटी दुकानों के लिए रूफटॉप सोलर: स्थापना लागत का 40% सरकार वहन करेगी, और हर राज्य में नेट-मीटरिंग अनिवार्य होगी।
        </p>
      </Tile>
    </div>
  )
}

/** One format on the board: shimmers while "writing", then shows its draft. */
function Tile({ label, delay, start, className = '', children }: { label: string; delay: number; start: boolean; className?: string; children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!start) return
    const t = window.setTimeout(() => setReady(true), delay * 1000)
    return () => window.clearTimeout(t)
  }, [start, delay])

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={start ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.25, ease: EASE }}
      aria-label={`${label} draft`}
      className={`flex min-w-0 flex-col rounded-2xl bg-white p-4 text-ink sm:p-5 ${className}`}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-ink">{label}</span>
        <span className={`flex items-center gap-1.5 text-[11.5px] font-medium ${ready ? 'text-ink' : 'text-ink-mute'}`} aria-live="polite">
          <span className={`h-1.5 w-1.5 rounded-full ${ready ? 'bg-matcha-deep' : 'bg-ink/25'}`} />
          {ready ? 'Ready' : 'Writing…'}
        </span>
      </header>
      {/* The draft is laid out from the start (just invisible), so tiles don't grow and push the page when it lands. */}
      <div className="relative min-h-0 flex-1">
        <motion.div
          initial={false}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: EASE }}
          aria-hidden={!ready}
        >
          {children}
        </motion.div>
        <AnimatePresence>
          {!ready && (
            <motion.div key="writing" exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-x-0 top-0 space-y-2.5" aria-hidden>
              <span className="sk-skeleton block h-2.5 w-3/4 rounded-full" />
              <span className="sk-skeleton block h-2.5 w-full rounded-full" />
              <span className="sk-skeleton block h-2.5 w-5/6 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

/* ─── 03 Your tokens, respected ──────────────────────────────────────────── */

function NoWaste() {
  return (
    <section id="no-waste" className="scroll-mt-28 border-b border-hair bg-paper">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-20 lg:py-28">
        <motion.div {...fadeUp}>
          <ChapterLabel n={3}>Your tokens, respected</ChapterLabel>
          <h2 className="font-headline mt-5 text-[clamp(2.6rem,5vw,4.2rem)] text-ink">
            Every token buys <Accent>something new.</Accent>
          </h2>
          <p className="mt-6 text-[18px] font-medium leading-snug text-ink">
            Asked for two formats, then decided you want two more? Sankshep won’t quietly write the first two again.
          </p>
          <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.75] text-ink-soft">
            Before anything is sent, it checks which drafts are already on your canvas from the same source and settings. If some are,
            it asks: <span className="font-medium text-ink">generate only the new formats</span>, or regenerate everything. Pick the
            first and only the drafts you don’t have yet are written. The ones you already have stay exactly as they are, edits
            included.
          </p>
          <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.75] text-ink-soft">
            The same care runs through the rest of the app: small edits in Refine don’t send your whole document again, and Stop
            ends a run the moment you no longer need it.
          </p>
          <WhyItMatters>
            tokens cost money on a paid key and run out on a free one. We treat them as yours, and spend them only on work you
            don’t already have.
          </WhyItMatters>
        </motion.div>
        <TokenVisual />
      </div>
    </section>
  )
}

/** An example canvas: two drafts already written (one edited), two formats just added. */
const TOKEN_TILES: { format: string; onCanvas: boolean; edited?: boolean }[] = [
  { format: 'Executive Summary', onCanvas: true, edited: true },
  { format: 'Video', onCanvas: true },
  { format: 'Advisory', onCanvas: false },
  { format: 'Infographic', onCanvas: false },
]

/** Switch between the two choices to see what each one would send and what it would keep. */
function TokenVisual() {
  const [choice, setChoice] = useState<'new' | 'all'>('new')
  const sentCount = TOKEN_TILES.filter((t) => choice === 'all' || !t.onCanvas).length

  return (
    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rounded-[28px] border border-hair bg-paper-deep p-3 shadow-[0_30px_70px_-40px_rgba(15,16,15,0.45)] sm:p-4">
      <div className="rounded-[20px] border border-hair bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink">You press Generate with four formats</p>
          <PreviewTag />
        </div>

        <div role="radiogroup" aria-label="What to generate" className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-paper-deep p-1">
          {([['new', 'Generate only new formats'], ['all', 'Regenerate all']] as const).map(([value, label]) => {
            const active = choice === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setChoice(value)}
                className={`min-h-11 rounded-lg px-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                  active ? (value === 'new' ? 'bg-ink text-paper' : 'bg-white text-ink ring-1 ring-inset ring-line') : 'text-ink-soft hover:text-ink'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TOKEN_TILES.map((t) => {
            const info = ALL_FORMATS.find((f) => f.label === t.format)
            const Icon = info?.icon ?? FileText
            const sent = choice === 'all' || !t.onCanvas
            const status = !sent ? (t.edited ? 'Kept, with your edits' : 'Kept as it is')
              : t.onCanvas ? (t.edited ? 'Written again, edits lost' : 'Written again')
              : 'New, sent to the AI'
            return (
              <li
                key={t.format}
                className={`flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-3 transition-colors duration-300 ${
                  !sent ? 'bg-paper-deep/70' : t.onCanvas ? 'bg-white ring-1 ring-inset ring-red-200' : 'bg-white ring-1 ring-inset ring-matcha-deep'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 text-ink-mute" strokeWidth={1.8} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">{info?.short ?? t.format}</span>
                  <span className={`block truncate text-[12px] ${sent && t.onCanvas ? 'text-red-700' : 'text-ink-soft'}`}>{status}</span>
                </span>
                {!sent && <Check className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={2.5} aria-hidden />}
              </li>
            )
          })}
        </ul>

        {/* One segment per format: filled means it is sent to the AI this time */}
        <div className="mt-5 border-t border-hair pt-4" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] text-ink-soft">
              <span className="font-mono text-[15px] font-semibold text-ink tabular-nums">{sentCount} of {TOKEN_TILES.length}</span> formats sent to the AI
            </p>
            <p className="text-[12.5px] text-ink-mute">{choice === 'new' ? 'Only what you don’t have yet' : 'Everything, again'}</p>
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-1.5" aria-hidden>
            {TOKEN_TILES.map((t) => {
              const sent = choice === 'all' || !t.onCanvas
              return <span key={t.format} className={`h-2 rounded-full transition-colors duration-300 ${sent ? 'bg-ink' : 'bg-hair'}`} />
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── 04 Talk to your draft (pinned draft, scrolling instructions) ───────── */

const DRAFT_START =
  'Small shops just got a real reason to go solar. Under the new 2026 rooftop policy, the government covers 40% of installation costs, and every state now has to offer net-metering, which means shops can sell the power they don’t use back to the grid. For a typical corner store, that turns a big upfront cost into a much smaller one.'

const REFINE_STEPS: { ask: string; title: string; body: string; source: boolean; draft: string; added?: string }[] = [
  {
    ask: 'Make it shorter',
    title: 'Too long? Say so.',
    body: 'Trim it, tighten it, cut it in half. Sankshep works from the draft itself for edits like this, so your facts stay exactly as they were.',
    source: false,
    draft: 'Small shops just got a real reason to go solar: the 2026 policy covers 40% of installation costs, and net-metering is now in every state.',
  },
  {
    ask: 'Sound more casual',
    title: 'Change the voice, keep the point.',
    body: 'Friendlier, more formal, more technical: the same facts come back in different words, without starting over.',
    source: false,
    draft: 'Running a small shop? Going solar just got a lot cheaper. The new policy pays 40% of the setup, and you can sell your spare power back to the grid.',
  },
  {
    ask: 'Add the budget figure from the report',
    title: 'Missing something? Ask for it.',
    body: 'When you ask for a fact that isn’t in the draft yet, Sankshep goes back to your original document to find it, rather than guessing.',
    source: true,
    draft: 'Running a small shop? Going solar just got a lot cheaper. The new policy pays 40% of the setup, backed by a ₹18,000 crore national budget, and you can sell your spare power back to the grid.',
    added: 'backed by a ₹18,000 crore national budget',
  },
]

const words = (text: string) => text.split(/\s+/).filter(Boolean).length

function Refine() {
  const [active, setActive] = useState(0)
  return (
    <section id="refine" className="scroll-mt-28 border-b border-hair bg-paper-deep">
      <div className="mx-auto max-w-[1200px] px-5 pt-20 sm:px-8 lg:pt-28">
        <motion.div {...fadeUp} className="max-w-[40rem]">
          <ChapterLabel n={4}>Talk to your draft</ChapterLabel>
          <h2 className="font-headline mt-5 text-[clamp(2.6rem,5vw,4.2rem)] text-ink">
            Don’t rewrite it. <Accent>Just ask.</Accent>
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
            Every draft has a small box underneath it. Type what you want changed, the way you’d say it to a colleague, and only that draft
            is rewritten. Everything else on the page stays put.
          </p>
        </motion.div>
      </div>

      <div className="mx-auto grid grid-cols-1 max-w-[1200px] gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:pb-28">
        <div>
          {REFINE_STEPS.map((step, i) => (
            <RefineStep key={step.ask} index={i} onActive={setActive} />
          ))}
          <WhyItMatters>
            you stay in one place and keep what’s already good. And since Sankshep only reaches for the original when your request needs it,
            small edits don’t send your whole document again.
          </WhyItMatters>
        </div>

        {/* Pinned draft (desktop): it changes as each instruction crosses the middle of the screen */}
        <div className="hidden lg:block">
          <div className="sticky top-28 flex h-[calc(100vh-9rem)] max-h-[640px] items-center">
            <RefineVisual step={active} />
          </div>
        </div>
      </div>
    </section>
  )
}

function RefineStep({ index, onActive }: { index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => { if (inView) onActive(index) }, [inView, index, onActive])
  const step = REFINE_STEPS[index]

  return (
    <div ref={ref} className="flex flex-col justify-center py-10 lg:min-h-[70vh] lg:py-0">
      <p className="inline-flex w-fit items-center gap-2 rounded-full border border-hair bg-white py-1.5 pl-2 pr-3.5 text-[14px] text-ink">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper-deep text-ink-soft" aria-hidden>
          <WandSparkles className="h-3.5 w-3.5" />
        </span>
        “{step.ask}”
      </p>
      <h3 className="font-headline mt-5 text-[clamp(2rem,3.6vw,2.9rem)] text-ink">{step.title}</h3>
      <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.75] text-ink-soft">{step.body}</p>
      <p className="mt-5 text-[13.5px] text-ink-soft">
        Reads: <span className="font-semibold text-ink">{step.source ? 'your draft and your original document' : 'your draft only'}</span>
      </p>
      {/* Mobile: each instruction brings its own before-and-after */}
      <div className="mt-8 lg:hidden">
        <RefineVisual step={index} />
      </div>
    </div>
  )
}

function RefineVisual({ step }: { step: number }) {
  const s = REFINE_STEPS[step]
  const before = step === 0 ? DRAFT_START : REFINE_STEPS[step - 1].draft
  const [head, tail] = s.added ? s.draft.split(s.added) : [s.draft, '']

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-hair bg-white shadow-[0_30px_70px_-40px_rgba(15,16,15,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-hair px-5 py-3.5">
        <span className="text-[13px] font-semibold text-ink">LinkedIn Post</span>
        <PreviewTag>Example</PreviewTag>
      </div>

      {/* What this refinement read: the draft always, the source only when the request needs it */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hair bg-paper px-5 py-3 text-[12.5px]">
        <span className="text-ink-soft">Reads</span>
        <span className="flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 font-medium text-paper">
          <Check className="h-3 w-3 text-matcha" strokeWidth={3} /> Your draft
        </span>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors duration-300 ${
            s.source ? 'bg-matcha text-ink' : 'bg-white text-ink-mute ring-1 ring-inset ring-hair'
          }`}
        >
          {s.source && <Check className="h-3 w-3" strokeWidth={3} />} {EXAMPLE_FILE}
        </span>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="text-[15.5px] leading-[1.75] text-ink">
              {head}
              {s.added && <mark className="rounded bg-matcha/70 px-1 text-ink">{s.added}</mark>}
              {tail}
            </p>
            <p className="mt-4 font-mono text-[11.5px] text-ink-mute tabular-nums">
              {words(before)} words before · {words(s.draft)} after
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-hair bg-paper px-4 py-3">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-hair">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper-deep text-ink-soft" aria-hidden>
            <WandSparkles className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{s.ask}</span>
          <span className="flex h-9 shrink-0 items-center rounded-xl bg-ink px-3.5 text-[13px] font-semibold text-paper" aria-hidden>Refine</span>
        </div>
      </div>
    </div>
  )
}

/* ─── 05 Your key, your call ─────────────────────────────────────────────── */

function YourKey() {
  return (
    <section id="your-key" className="scroll-mt-28 bg-white">
      <div className="mx-auto grid grid-cols-1 max-w-[1200px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:py-28">
        <div className="order-2 space-y-4 lg:order-1">
          <ConsentPreview />
          <StopPreview />
        </div>
        <motion.div {...fadeUp} className="order-1 lg:order-2 lg:pt-6">
          <ChapterLabel n={5}>Your key, your call</ChapterLabel>
          <h2 className="font-headline mt-5 text-[clamp(2.6rem,5vw,4.2rem)] text-ink">
            Your key, <Accent>your call.</Accent>
          </h2>
          <p className="mt-6 text-[18px] font-medium leading-snug text-ink">
            If you add your own API key and it stops working, Sankshep doesn’t quietly swap in something else behind your back.
          </p>
          <p className="mt-4 max-w-[50ch] text-[16px] leading-[1.75] text-ink-soft">
            Keys expire, hit their daily limit, or get pasted with a typo. When that happens, Sankshep pauses, shows you exactly what the
            provider said, and asks whether you’d like to use its free key instead. Say yes and your drafts carry on. Say no and nothing
            else is sent.
          </p>
          <p className="mt-4 max-w-[50ch] text-[16px] leading-[1.75] text-ink-soft">
            The same goes for time. If a run is taking longer than you’d like, press Stop. Drafts that already finished stay on the page, and
            the rest are simply not written.
          </p>
          <WhyItMatters>you always know whose key wrote your drafts, and you are never stuck waiting on a run you no longer need.</WhyItMatters>
        </motion.div>
      </div>
    </section>
  )
}

type ConsentPhase = 'ask' | 'drafting' | 'done' | 'cancelled'

/** The prompt from the workspace, pressable: both buttons show what would happen. Nothing is sent. */
function ConsentPreview() {
  const [phase, setPhase] = useState<ConsentPhase>('ask')
  useEffect(() => {
    if (phase !== 'drafting') return
    const t = window.setTimeout(() => setPhase('done'), 1800)
    return () => window.clearTimeout(t)
  }, [phase])

  return (
    <div className="rounded-[28px] bg-paper-deep p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1">
        <p className="text-[13px] font-medium text-ink-soft">Try the buttons: this is a preview, nothing is sent.</p>
        <PreviewTag />
      </div>
      <div className="overflow-hidden rounded-2xl border border-hair bg-white shadow-[0_24px_60px_-30px_rgba(15,16,15,0.35)]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'ask' ? (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="px-5 pb-5 pt-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-deep text-ink ring-1 ring-hair" aria-hidden>
                    <KeyRound className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <p className="text-[15.5px] font-semibold text-ink">Your Groq API key didn’t work</p>
                </div>
                <p className="mt-4 break-words rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 font-mono text-[12px] leading-relaxed text-red-800">
                  Groq daily limit reached for your API key (429): Rate limit reached on tokens per day.
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-ink">Would you like to generate this using Sankshep.ai's free API key instead?</p>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-hair bg-paper px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setPhase('cancelled')}
                  className="min-h-11 rounded-xl px-4 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('drafting')}
                  className="min-h-11 rounded-xl bg-ink px-5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
                >
                  Use Sankshep Key
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={phase === 'cancelled' ? 'cancelled' : 'shared'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex min-h-[244px] flex-col items-start justify-center gap-4 px-5 py-8 sm:px-6"
            >
              {phase === 'cancelled' ? (
                <>
                  <p className="text-[16px] font-semibold text-ink">Nothing was sent.</p>
                  <p className="max-w-[40ch] text-[14.5px] leading-relaxed text-ink-soft">You’re back where you started. Fix the key, or choose another model, whenever you’re ready.</p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-[16px] font-semibold text-ink">
                    {phase === 'done' ? <Check className="h-4 w-4 text-matcha-deep" strokeWidth={3} /> : <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/15 border-t-ink" aria-hidden />}
                    {phase === 'done' ? 'Draft ready' : 'Drafting with Sankshep’s key…'}
                  </p>
                  <p className="max-w-[40ch] text-[14.5px] leading-relaxed text-ink-soft">
                    {phase === 'done' ? 'Written with Sankshep’s key, because you said so. Your own key is still in place for next time.' : 'Only because you chose it. Your settings stay as they were.'}
                  </p>
                </>
              )}
              {phase !== 'drafting' && (
                <button
                  type="button"
                  onClick={() => setPhase('ask')}
                  className="min-h-11 rounded-full border border-hair px-4 text-[13.5px] font-medium text-ink transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                >
                  Show the prompt again
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const STOP_FORMATS = ['Executive Summary', 'LinkedIn Post', 'X / Twitter', 'Slide Deck', 'Blog Post']
/** When each preview draft "finishes", in seconds after Generate. */
const STOP_TIMES = [1.2, 2.2, 3.4, 4.8, 6.2]

type StopPhase = 'idle' | 'running' | 'stopped' | 'finished'

/** Generate turns into Stop while drafts are being written; stopping keeps what already finished. */
function StopPreview() {
  const [phase, setPhase] = useState<StopPhase>('idle')
  const [done, setDone] = useState(0)
  const timers = useRef<number[]>([])

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clear, [])

  const start = () => {
    clear()
    setDone(0)
    setPhase('running')
    timers.current = STOP_TIMES.map((s, i) =>
      window.setTimeout(() => {
        setDone(i + 1)
        if (i === STOP_TIMES.length - 1) setPhase('finished')
      }, s * 1000),
    )
  }
  const stop = () => {
    clear()
    setPhase('stopped')
  }

  return (
    <div className="rounded-[28px] bg-paper-deep p-3 sm:p-4">
      <div className="overflow-hidden rounded-2xl border border-hair bg-white">
        <ul className="divide-y divide-hair">
          {STOP_FORMATS.map((f, i) => {
            const finished = i < done
            const cut = phase === 'stopped' && !finished
            return (
              <li key={f} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px]">
                <span className={`w-36 shrink-0 truncate font-medium ${cut ? 'text-ink-mute' : 'text-ink'}`}>{f}</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
                  {finished ? (
                    <span className="absolute inset-0 rounded-full bg-matcha-deep" />
                  ) : phase === 'running' ? (
                    <span className="sk-skeleton absolute inset-0 rounded-full" />
                  ) : null}
                </span>
                <span className={`w-20 shrink-0 text-right text-[12px] ${finished ? 'font-medium text-ink' : 'text-ink-mute'}`}>
                  {finished ? 'Ready' : cut ? 'Not written' : phase === 'running' ? 'Writing…' : 'Waiting'}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair bg-paper px-4 py-3">
          <p className="text-[13px] text-ink-soft" aria-live="polite">
            {phase === 'stopped' ? `Stopped. ${done} of ${STOP_FORMATS.length} drafts finished and kept.`
              : phase === 'finished' ? `All ${STOP_FORMATS.length} drafts ready.`
              : phase === 'running' ? 'Press Stop at any moment.'
              : 'A five-draft run, sped up.'}
          </p>
          {phase === 'running' ? (
            <button
              type="button"
              onClick={stop}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-[13.5px] font-semibold text-red-700 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <Square className="h-3 w-3 fill-current" aria-hidden /> Stop generating
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className="min-h-11 rounded-xl bg-ink px-4 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
            >
              {phase === 'idle' ? `Generate ${STOP_FORMATS.length} drafts` : 'Run it again'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── 06 Private mode (dark band) ────────────────────────────────────────── */

const PRIVATE_FACTS: { title: string; body: string }[] = [
  { title: 'Drafts on your own GPU', body: 'Qwen 2.5 VL runs through Ollama. The page talks to it at localhost:11434, straight from your browser, with no server in between and no API key.' },
  { title: 'Scans read in the browser', body: 'Images and scanned pages are read with on-device OCR, then passed to the model as text. That keeps each request small and fast.' },
  { title: 'History without the text', body: 'A private run records counts, formats and the model name. The source, the file name and every draft stay off the database.' },
  { title: 'Fits an 8 GB laptop GPU', body: 'Each request is held to a 4,096-token window, so a 7B model runs on an ordinary laptop, one draft at a time.' },
]

function PrivateMode() {
  return (
    <section id="private-mode" className="scroll-mt-28 bg-ink text-paper">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-20">
          <motion.div {...fadeUp}>
            <ChapterLabel n={6} dark>Private mode</ChapterLabel>
            <h2 className="font-headline mt-5 text-[clamp(2.6rem,5vw,4.2rem)]">
              Your documents <Accent dark>never leave</Accent> your computer.
            </h2>
            <p className="mt-6 text-[18px] font-medium leading-snug text-paper">
              Most AI writing tools only work by sending your document to someone else’s servers. Sankshep can do the whole job on your own
              machine.
            </p>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.75] text-paper/75">
              Switch the workspace to Private and every draft is written by Qwen 2.5 VL, running locally through Ollama. Drafts stream onto
              the canvas as they’re written, Stop freezes them exactly where they are, and refining a draft stays on your machine too.
              Links are switched off in this mode, because a link can only be fetched by a cloud service.
            </p>
            <WhyItMatters dark>
              legal, finance and government teams can finally use AI on the documents they need it for most: the ones that can’t be uploaded
              anywhere.
            </WhyItMatters>
          </motion.div>
          <DataPathPreview />
        </div>

        <dl className="mt-16 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVATE_FACTS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: EASE }}
              className="border-t border-paper/15 py-6"
            >
              <dt className="text-[16px] font-semibold text-paper">{item.title}</dt>
              <dd className="mt-2 text-[14.5px] leading-relaxed text-paper/70">{item.body}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}

type PathMode = 'cloud' | 'local'

/**
 * Where a document goes in each mode, as a map: the dashed line is the user's computer. Private lights
 * the path to Ollama inside it; Cloud lights the path out to Sankshep's server and the provider.
 */
function DataPathPreview() {
  const [mode, setMode] = useState<PathMode>('local')
  const local = mode === 'local'

  return (
    <div className="rounded-[28px] border border-paper/15 bg-paper/5 p-3 sm:p-4">
      <div className="rounded-[20px] bg-white p-4 text-ink sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink">Where your document goes</p>
          <PreviewTag />
        </div>

        <div role="radiogroup" aria-label="Processing mode" className="mt-4 grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1">
          {([['cloud', 'Cloud APIs', Cloud], ['local', 'Private', Lock]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={mode === id}
              onClick={() => setMode(id)}
              className={`flex h-10 items-center justify-center gap-2 rounded-full text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                mode === id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
              }`}
            >
              <Icon className={`h-4 w-4 ${mode === id ? 'text-matcha' : ''}`} strokeWidth={1.8} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {/* Your computer: the dashed boundary */}
        <div className="relative mt-6 rounded-2xl border-[1.5px] border-dashed border-ink/25 bg-paper px-2.5 pb-3 pt-7 sm:px-4">
          <span className="absolute left-3 top-2 text-[11.5px] font-semibold text-ink-soft sm:left-4">Your computer</span>
          <div className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)]">
            <PathNode icon={FileText} label="Your document" sub="PDF, DOCX, scan" on />
            <PathArrow on />
            <PathNode icon={AppWindow} label="Sankshep" sub="in your browser" on />
            <PathArrow on={local} />
            <PathNode icon={Cpu} label="Ollama" sub="qwen2.5vl:7b" on={local} />
          </div>
        </div>

        {/* The way out: only Cloud mode takes it */}
        <div className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_16px_minmax(0,1fr)] gap-1 px-2.5 sm:grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)] sm:px-4">
          <span className="col-start-3 flex justify-center py-1.5"><PathArrow on={!local} down /></span>
        </div>
        <div className="relative rounded-2xl border border-hair px-2.5 pb-3 pt-7 sm:px-4">
          <span className="absolute left-3 top-2 text-[11.5px] font-semibold text-ink-soft sm:left-4">The internet</span>
          {local && (
            <span className="absolute right-3 top-2 rounded-md bg-matcha px-2 py-0.5 text-[11.5px] font-semibold text-ink sm:right-4">Nothing sent</span>
          )}
          <div className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)]">
            <span />
            <span />
            <PathNode icon={Server} label="Sankshep server" sub="shared keys" on={!local} />
            <PathArrow on={!local} />
            <PathNode icon={Cloud} label="AI provider" sub="Groq, Mistral, Gemini" on={!local} />
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2.5 text-[13px] leading-snug text-ink-soft" aria-live="polite">
          {local ? (
            <>
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600" aria-hidden />
              <span><span className="font-semibold text-ink">Local engine ready · qwen2.5vl:7b.</span> The document is read, drafted and refined inside the dashed line.</span>
            </>
          ) : (
            <>
              <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" aria-hidden />
              <span><span className="font-semibold text-ink">Fastest, on any device.</span> The text crosses to Sankshep’s server and the AI provider to be drafted.</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

function PathNode({ icon: Icon, label, sub, on }: { icon: typeof FileText; label: string; sub: string; on: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5 text-center transition-[opacity,border-color,background-color] duration-500 sm:px-2.5 ${
        on ? 'border-ink/20 bg-white' : 'border-hair bg-transparent opacity-40'
      }`}
    >
      <span className={`grid h-8 w-8 place-items-center rounded-lg transition-colors duration-500 ${on ? 'bg-ink text-matcha' : 'bg-paper-deep text-ink-mute'}`}>
        <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
      </span>
      {/* Phones get the name only, wrapped; the detail line needs the wider layout. */}
      <span className="w-full break-words text-[11.5px] font-semibold leading-tight text-ink [text-wrap:balance] sm:truncate sm:text-[12.5px]">{label}</span>
      <span className="hidden w-full truncate text-[11px] leading-tight text-ink-soft sm:block">{sub}</span>
    </div>
  )
}

function PathArrow({ on, down }: { on: boolean; down?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`mx-auto h-4 w-4 transition-colors duration-500 ${down ? 'rotate-90' : ''} ${on ? 'text-ink' : 'text-ink/15'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/* ─── The everyday things ────────────────────────────────────────────────── */

const EVERYDAY: { title: string; body: string }[] = [
  { title: 'Compare models side by side', body: `Run the same brief through up to ${MAX_COMPARE} models and read their drafts next to each other.` },
  { title: 'Write for the right readers', body: 'Pick managers, HR and sales, engineers or the general public, or describe your own readers and save them for next time.' },
  { title: 'Choose a tone once', body: 'Professional, technical, casual or academic, applied to every draft in the run.' },
  { title: 'Six Indian languages', body: 'Translate into Hindi, Gujarati, Marathi, Bengali, Telugu or Tamil, the whole document, line by line.' },
  { title: 'Read images and scans', body: 'Photos of pages and scanned PDFs are read first, so a picture of a report works as a source too.' },
  { title: 'Take it with you', body: 'Copy any draft, download it as Markdown or plain text, and take slide decks away as PowerPoint. Past runs wait for you in History.' },
]

function Everyday() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
        <motion.div {...fadeUp}>
          <p className="text-[13.5px] font-semibold text-ink-soft">And the everyday things</p>
          <h2 className="font-display mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-ink">The small things you’ll use every day.</h2>
        </motion.div>
        <dl className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
          {EVERYDAY.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: (i % 2) * 0.08, ease: EASE }}
              className="border-t border-hair py-6"
            >
              <dt className="text-[16.5px] font-semibold text-ink">{item.title}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">{item.body}</dd>
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
    <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
      <motion.div {...fadeUp} className="flex flex-col gap-8 rounded-3xl bg-ink px-8 py-12 text-paper sm:px-12 sm:py-14 md:flex-row md:items-end md:justify-between">
        <p className="font-headline max-w-[16ch] text-[clamp(2.2rem,4.4vw,3.4rem)]">
          Bring one document. <Accent dark>Leave with the rest.</Accent>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/workspace"
            className="flex items-center gap-2 rounded-full bg-matcha px-6 py-3.5 text-[15px] font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
          >
            Open the workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/how-it-works"
            className="rounded-full border border-paper/25 px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:border-paper/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
          >
            See how it works
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
