import { Sparkles, type LucideIcon } from 'lucide-react'
import { ALL_FORMATS } from './LeftPanel'

/** Formats a History filter can pick, in the same order as the Transform picker. */
export const FILTER_FORMATS: string[] = [...ALL_FORMATS.map((f) => f.label), 'Custom Format']

const META = new Map<string, { short: string; icon: LucideIcon }>(
  ALL_FORMATS.map((f) => [f.label, { short: f.short, icon: f.icon }]),
)
META.set('Custom Format', { short: 'Custom Format', icon: Sparkles })

export function formatMeta(format: string) {
  return META.get(format) ?? { short: format, icon: Sparkles }
}


/** Drops the vendor prefix so the pill stays short: "openai/gpt-oss-20b" → "gpt-oss-20b". */
export function shortModel(model: string) {
  return model.includes('/') ? model.slice(model.lastIndexOf('/') + 1) : model
}

const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

/** "Sep 24, 2026 • 15:43" */
export function formatStamp(iso: string) {
  const d = new Date(iso)
  return { date: DATE.format(d), time: TIME.format(d) }
}

const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 60], ['minute', 60], ['hour', 24], ['day', 7], ['week', 4.35], ['month', 12], ['year', Infinity],
]

/** "2 hours ago", "yesterday", "just now". */
export function relativeTime(iso: string, now = Date.now()) {
  let value = (new Date(iso).getTime() - now) / 1000
  if (Math.abs(value) < 45) return 'just now'
  for (const [unit, size] of STEPS) {
    if (Math.abs(value) < size) return RELATIVE.format(Math.round(value), unit)
    value /= size
  }
  return RELATIVE.format(Math.round(value), 'year')
}

export const NUMBER = new Intl.NumberFormat('en-US')
