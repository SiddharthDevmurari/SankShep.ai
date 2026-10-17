// Plays the script against the mockup. The clock only runs while the demo is on screen, the tab is
// visible and the viewer hasn't paused, so nobody arrives halfway through a scene. Seeking resets
// the mockup and replays every earlier beat instantly, so each chapter starts from a real state.
import { useEffect, useRef, useState, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { BEATS, BEAT_START, CHAPTERS, CLICK_MS, CURSOR_FADE_MS, INITIAL, type Beat, type DemoState } from './script'

type Point = { x: number; y: number }

const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
const PRESS_MS = 110

/** A point along a shallow arc from `a` to `b`: hands don't move a mouse in straight lines. */
function along(a: Point, b: Point, e: number, bow: number): Point {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  const off = Math.sin(Math.PI * e) * bow
  return { x: a.x + dx * e - (dy / d) * off, y: a.y + dy * e + (dx / d) * off }
}

interface Options {
  stageRef: RefObject<HTMLDivElement | null>
  cursorRef: RefObject<HTMLDivElement | null>
  /** The stage's CSS scale: measurements come back in screen pixels and are divided by it. */
  scaleRef: RefObject<number>
  /** The stage is mounted and measured. */
  ready: boolean
  startPaused: boolean
  startChapter: number
}

export function useDirector({ stageRef, cursorRef, scaleRef, ready, startPaused, startChapter }: Options) {
  const [state, setState] = useState<DemoState>(INITIAL)
  const stateRef = useRef(INITIAL)
  const [chapter, setChapterState] = useState(0)
  const chapterRef = useRef(0)
  const [paused, setPaused] = useState(startPaused)
  const pausedRef = useRef(startPaused)
  const offscreenRef = useRef(true)
  const hiddenRef = useRef(false)
  const tokenRef = useRef(0)
  const timeRef = useRef(0)
  const posRef = useRef<Point>({ x: 0, y: 0 })
  const lastTargetRef = useRef<{ id: string; at?: [number, number] } | null>(null)
  const bowSign = useRef(1)
  /** Set by the controls: called with the timeline position on every frame. */
  const onProgress = useRef<((ms: number) => void) | null>(null)

  const running = () => !pausedRef.current && !offscreenRef.current && !hiddenRef.current

  // Every change renders synchronously, so the next beat can measure what it changed.
  const commit = (patch: Partial<DemoState>) => {
    const next = { ...stateRef.current, ...patch }
    stateRef.current = next
    flushSync(() => setState(next))
  }
  const setChapter = (n: number) => {
    chapterRef.current = n
    setChapterState(n)
  }

  /* ── Measuring the mockup ─────────────────────────────────────────── */

  const find = (id: string) => stageRef.current?.querySelector<HTMLElement>(`[data-demo="${id}"]`) ?? null

  const pointIn = (el: HTMLElement, at: [number, number] = [0.5, 0.5]): Point => {
    const stage = stageRef.current!
    const s = scaleRef.current || 1
    const sr = stage.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { x: (r.left - sr.left + r.width * at[0]) / s, y: (r.top - sr.top + r.height * at[1]) / s }
  }

  /**
   * Where `scroller` must sit for `el` to be in view (or near its top, with align 'top'). An element taller
   * than the panel only needs the spot being pointed at (`at`) on screen.
   */
  const scrollFor = (el: HTMLElement, scroller: HTMLElement, at: [number, number] = [0.5, 0.5], align?: 'top') => {
    const s = scaleRef.current || 1
    const top = (el.getBoundingClientRect().top - scroller.getBoundingClientRect().top) / s + scroller.scrollTop
    const height = el.getBoundingClientRect().height / s
    const view = scroller.clientHeight
    const pad = 24
    const current = scroller.scrollTop
    let to = current
    if (align === 'top') to = top - pad
    else if (height > view - 2 * pad) {
      const spot = top + height * at[1]
      if (spot < current + pad || spot > current + view - pad) to = spot - view / 2
    } else if (top < current + pad) to = top - pad
    else if (top + height > current + view - pad) to = top + height - view + pad
    return Math.round(Math.max(0, Math.min(scroller.scrollHeight - view, to)))
  }

  const startPoint = (): Point => {
    const st = stageRef.current
    return st ? { x: st.offsetWidth * 0.7, y: st.offsetHeight * 0.8 } : { x: 0, y: 0 }
  }

  /* ── The pointer ──────────────────────────────────────────────────── */

  const place = (p: Point) => {
    posRef.current = p
    if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
  }
  const showCursor = (show: boolean) => {
    if (cursorRef.current) cursorRef.current.style.opacity = show ? '1' : '0'
  }
  const ripple = () => {
    const r = cursorRef.current?.querySelector<HTMLElement>('.demo-cursor-ripple')
    if (!r) return
    r.classList.remove('is-on')
    void r.offsetWidth // restart the animation
    r.classList.add('is-on')
  }

  /* ── Time ─────────────────────────────────────────────────────────── */

  /** Runs `frame(progress)` for `ms` of demo time. Resolves false if a seek cancelled it. */
  const tween = (ms: number, token: number, frame?: (p: number) => void) =>
    new Promise<boolean>((resolve) => {
      const start = timeRef.current
      let elapsed = 0
      let last = performance.now()
      const tick = (now: number) => {
        if (tokenRef.current !== token) return resolve(false)
        const dt = Math.min(now - last, 50)
        last = now
        if (running()) elapsed = Math.min(ms, elapsed + dt)
        const p = ms > 0 ? elapsed / ms : 1
        frame?.(p)
        timeRef.current = start + elapsed
        onProgress.current?.(timeRef.current)
        if (p >= 1) return resolve(true)
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })

  /* ── Beats ────────────────────────────────────────────────────────── */

  const play = async (b: Beat, token: number): Promise<boolean> => {
    switch (b.t) {
      case 'chapter':
        setChapter(b.n)
        return true
      case 'set':
        commit(b.apply(stateRef.current))
        return true
      case 'cursor':
        showCursor(b.show)
        return tween(CURSOR_FADE_MS, token)
      case 'wait':
        return tween(b.ms, token)
      case 'move': {
        if (stateRef.current.hover) commit({ hover: null })
        const el = find(b.to)
        if (!el) return tween(b.ms, token)
        const scroller = el.closest<HTMLElement>('[data-scroll]')
        const fromScroll = scroller?.scrollTop ?? 0
        const toScroll = scroller ? scrollFor(el, scroller, b.at, b.align) : 0
        const from = { ...posRef.current }
        const first = pointIn(el, b.at)
        bowSign.current *= -1
        const bow = Math.min(48, Math.hypot(first.x - from.x, first.y - from.y) * 0.1) * bowSign.current
        const done = await tween(b.ms, token, (p) => {
          // The panel scrolls while the pointer travels, and the pointer follows the target as it moves.
          if (scroller && toScroll !== fromScroll) {
            scroller.scrollTop = fromScroll + (toScroll - fromScroll) * easeInOutSine(Math.min(1, p / 0.8))
          }
          place(along(from, pointIn(el, b.at), easeInOutCubic(p), bow))
        })
        if (!done) return false
        lastTargetRef.current = { id: b.to, at: b.at }
        commit({ hover: b.to })
        return true
      }
      case 'click': {
        cursorRef.current?.setAttribute('data-press', '')
        ripple()
        commit({ press: stateRef.current.hover })
        if (!(await tween(PRESS_MS, token))) return false
        commit({ ...b.apply?.(stateRef.current), press: null })
        cursorRef.current?.removeAttribute('data-press')
        return tween(CLICK_MS - PRESS_MS, token)
      }
      case 'scroll': {
        const scroller = stageRef.current?.querySelector<HTMLElement>(`[data-scroll="${b.area}"]`)
        if (!scroller) return tween(b.ms, token)
        const from = scroller.scrollTop
        const to = b.to === 'end' ? scroller.scrollHeight - scroller.clientHeight : b.to
        return tween(b.ms, token, (p) => { scroller.scrollTop = from + (to - from) * easeInOutSine(p) })
      }
      case 'type': {
        let shown = -1
        return tween(b.ms, token, (p) => {
          const n = Math.round(b.text.length * p)
          if (n !== shown) {
            shown = n
            commit({ refineText: b.text.slice(0, n) })
          }
        })
      }
    }
  }

  /** The same beat with no time: used to rebuild the state a chapter starts from. */
  const playInstantly = (b: Beat) => {
    switch (b.t) {
      case 'chapter':
        setChapter(b.n)
        break
      case 'set':
        commit(b.apply(stateRef.current))
        break
      case 'cursor':
        showCursor(b.show)
        break
      case 'move': {
        const el = find(b.to)
        if (!el) break
        const scroller = el.closest<HTMLElement>('[data-scroll]')
        if (scroller) scroller.scrollTop = scrollFor(el, scroller, b.at, b.align)
        place(pointIn(el, b.at))
        lastTargetRef.current = { id: b.to, at: b.at }
        break
      }
      case 'click':
        commit(b.apply?.(stateRef.current) ?? {})
        break
      case 'scroll': {
        const scroller = stageRef.current?.querySelector<HTMLElement>(`[data-scroll="${b.area}"]`)
        if (scroller) scroller.scrollTop = b.to === 'end' ? scroller.scrollHeight - scroller.clientHeight : b.to
        break
      }
      case 'type':
        commit({ refineText: b.text })
        break
      case 'wait':
        break
    }
  }

  const reset = () => {
    commit(INITIAL)
    stageRef.current?.querySelectorAll<HTMLElement>('[data-scroll]').forEach((el) => { el.scrollTop = 0 })
    cursorRef.current?.removeAttribute('data-press')
    showCursor(false)
    place(startPoint())
    lastTargetRef.current = null
    timeRef.current = 0
    onProgress.current?.(0)
    setChapter(0)
  }

  const fadeStage = (show: boolean, token: number) => {
    if (stageRef.current) stageRef.current.style.opacity = show ? '1' : '0'
    return tween(250, token)
  }

  const run = async (from: number, token: number) => {
    await nextFrame()
    for (let i = from; i < BEATS.length; i++) {
      if (tokenRef.current !== token) return
      timeRef.current = BEAT_START[i]
      if (!(await play(BEATS[i], token))) return
    }
    // Loop: fade out, start again from an empty workspace.
    if (!(await fadeStage(false, token))) return
    reset()
    if (!(await fadeStage(true, token))) return
    void run(0, token)
  }

  const seek = (n: number) => {
    const token = ++tokenRef.current
    if (stageRef.current) stageRef.current.style.opacity = '1'
    reset()
    const c = CHAPTERS[n]
    for (let i = 0; i < c.beat; i++) playInstantly(BEATS[i])
    commit({ hover: lastTargetRef.current?.id ?? null })
    timeRef.current = c.start
    onProgress.current?.(c.start)
    setChapter(n)
    void run(c.beat, token)
  }

  // Start once the stage exists. Reduced motion opens on a finished scene, paused.
  useEffect(() => {
    if (!ready) return
    const token = ++tokenRef.current
    place(startPoint())
    let timer = 0
    if (startChapter > 0) timer = window.setTimeout(() => seek(startChapter), 0)
    else void run(0, token)
    return () => {
      window.clearTimeout(timer)
      tokenRef.current++
    }
  }, [ready])

  // Off screen or in a background tab, the clock stops.
  useEffect(() => {
    const el = stageRef.current
    if (!ready || !el) return
    const io = new IntersectionObserver(([e]) => { offscreenRef.current = !e.isIntersecting }, { threshold: 0.2 })
    io.observe(el)
    const onVisibility = () => { hiddenRef.current = document.hidden }
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ready, stageRef])

  return {
    state,
    chapter,
    paused,
    onProgress,
    togglePause: () => {
      pausedRef.current = !pausedRef.current
      setPaused(pausedRef.current)
    },
    jump: (n: number) => seek(Math.max(0, Math.min(CHAPTERS.length - 1, n))),
    /** After the layout switches between wide and narrow: replay the current chapter in the new layout. */
    restart: () => seek(chapterRef.current),
    /** After a resize: put a resting pointer back on what it was pointing at. */
    resnap: () => {
      const t = lastTargetRef.current
      const el = t && find(t.id)
      if (t && el) place(pointIn(el, t.at))
    },
  }
}
