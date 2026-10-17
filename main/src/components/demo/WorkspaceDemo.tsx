// The hero's product demo: the workspace mockup, scaled to fit, with a scripted pointer and the
// controls to pause it or jump to a step. Wide screens get the two-panel workspace; below 900px the
// mockup switches to the app's own one-panel layout instead of shrinking the desktop one to a sliver.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCopy } from '../../i18n'
import { DEMO_COPY } from './copy'
import { DemoCursor } from './Cursor'
import { Mockup } from './Mockup'
import { CHAPTERS } from './script'
import { useDirector } from './useDirector'
import './demo.css'

const WIDE_MIN = 900
const WIDE = { w: 1180, h: 700 }
const NARROW = { minW: 400, h: 640 }

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function WorkspaceDemo() {
  const t = useCopy(DEMO_COPY)
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [reduced] = useState(prefersReducedMotion)

  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const wide = width >= WIDE_MIN
  const stageW = wide ? WIDE.w : Math.max(width, NARROW.minW)
  const stageH = wide ? WIDE.h : NARROW.h
  const scale = width ? Math.min(1, width / stageW) : 1
  const scaleRef = useRef(scale)
  scaleRef.current = scale
  const ready = width > 0

  const director = useDirector({ stageRef, cursorRef, scaleRef, ready, startPaused: reduced, startChapter: reduced ? 4 : 0 })

  // Wide and narrow are different layouts: replay the current step in the new one. Same layout: re-aim the pointer.
  const wasWide = useRef(wide)
  useEffect(() => {
    if (!ready) return
    if (wasWide.current === wide) {
      director.resnap()
      return
    }
    wasWide.current = wide
    const id = window.setTimeout(director.restart, 0)
    return () => window.clearTimeout(id)
  }, [wide, width, ready])

  return (
    <div role="region" aria-label={t.region}>
      <div
        ref={frameRef}
        className="relative overflow-hidden rounded-[18px] border-2 border-ink bg-canvas shadow-[0_28px_60px_-28px_rgba(15,16,15,0.45)]"
        style={ready ? { height: Math.round(stageH * scale) } : { aspectRatio: `${WIDE.w} / ${WIDE.h}` }}
      >
        {ready && (
          <div
            ref={stageRef}
            lang="en"
            aria-hidden="true"
            inert
            className="demo-stage pointer-events-none absolute left-0 top-0 origin-top-left select-none transition-opacity duration-300"
            style={{ width: stageW, height: stageH, transform: `scale(${scale})` }}
          >
            <Mockup state={director.state} compact={!wide} scale={scale} />
            <DemoCursor ref={cursorRef} carry={director.state.carry} />
          </div>
        )}
      </div>
      <p className="sr-only">{t.description}</p>
      <DemoControls
        chapter={director.chapter}
        paused={director.paused}
        onTogglePause={director.togglePause}
        onJump={director.jump}
        progress={director.onProgress}
      />
    </div>
  )
}

function DemoControls({ chapter, paused, onTogglePause, onJump, progress }: {
  chapter: number
  paused: boolean
  onTogglePause: () => void
  onJump: (n: number) => void
  progress: ReturnType<typeof useDirector>['onProgress']
}) {
  const t = useCopy(DEMO_COPY)
  // Two progress bar sets (the step buttons from sm up, a plain bar below it), filled straight from the clock.
  const fills = useRef<(HTMLSpanElement | null)[]>([])
  useEffect(() => {
    progress.current = (ms) => {
      CHAPTERS.forEach((c, i) => {
        const width = `${Math.max(0, Math.min(1, (ms - c.start) / (c.end - c.start))) * 100}%`
        const a = fills.current[i * 2]
        const b = fills.current[i * 2 + 1]
        if (a) a.style.width = width
        if (b) b.style.width = width
      })
    }
    return () => { progress.current = null }
  }, [progress])

  const total = t.chapters.length
  const current = t.chapters[chapter]
  const bar = (i: number, set: 0 | 1) => (
    <span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-hair">
      <span ref={(el) => { fills.current[i * 2 + set] = el }} className="absolute inset-y-0 left-0 w-0 rounded-full bg-ink" />
    </span>
  )

  return (
    <div className="mt-4 flex items-start gap-3 sm:gap-4">
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? t.play : t.pause}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
      >
        {paused ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M7 5l12 7-12 7z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {/* sm and up: every step is a button */}
        <ol className="hidden gap-1.5 sm:flex">
          {t.chapters.map((c, i) => (
            <li key={i} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-label={t.jump(c.label)}
                aria-current={i === chapter ? 'step' : undefined}
                className="group flex min-h-11 w-full flex-col justify-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                {bar(i, 0)}
                <span className={`hidden truncate text-[12.5px] lg:block ${i === chapter ? 'font-semibold text-ink' : 'text-ink-mute group-hover:text-ink'}`}>
                  {c.label}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* Phones: seven targets won't fit at 44px, so the bar is passive and two buttons step through */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="flex min-w-0 flex-1 gap-1" aria-hidden>
            {t.chapters.map((_, i) => <span key={i} className="min-w-0 flex-1">{bar(i, 1)}</span>)}
          </div>
          <button
            type="button"
            onClick={() => onJump(chapter - 1)}
            disabled={chapter === 0}
            aria-label={t.prev}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hair bg-white text-ink transition-colors hover:bg-paper-deep disabled:text-ink-mute/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onJump(chapter + 1)}
            disabled={chapter === total - 1}
            aria-label={t.next}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hair bg-white text-ink transition-colors hover:bg-paper-deep disabled:text-ink-mute/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p key={chapter} className="sk-rise mt-1.5 text-[14px] leading-snug text-ink-soft">
          <span className="font-semibold text-ink lg:hidden">{t.stepOf(chapter + 1, total)} · {current.label}. </span>
          {current.caption}
        </p>
      </div>
    </div>
  )
}
