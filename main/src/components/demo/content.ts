// What the demo works on. The source is the real SIH26154 problem statement, and every count shown
// in the mockup is computed from these strings.
import {
  AtSign, Briefcase, ChartPie, Clapperboard, FileText, Languages, Lightbulb, Newspaper, Presentation, ShieldAlert,
} from 'lucide-react'
import source from '../../imports/Problem_Statement_details.txt?raw'

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0)

export const SOURCE_NAME = 'Problem_Statement_details.txt'
export const SOURCE_TEXT = source.trim()
export const SOURCE_CHARS = SOURCE_TEXT.length
export const SOURCE_WORDS = countWords(SOURCE_TEXT)
export const SOURCE_KB = Math.max(1, Math.round(new TextEncoder().encode(source).length / 1024))

/** The workspace's format grid, in its order (LeftPanel ALL_FORMATS). */
export const FORMATS = [
  { id: 'exec', label: 'Executive Summary', short: 'Executive Summary', desc: 'C-suite brief', icon: FileText },
  { id: 'linkedin', label: 'LinkedIn Post', short: 'LinkedIn Post', desc: 'Up to 3,000 chars', icon: Briefcase },
  { id: 'x', label: 'Twitter/X Post', short: 'X / Twitter', desc: 'Hook + thread', icon: AtSign },
  { id: 'video', label: 'Video', short: 'Video', desc: 'Script & storyboard', icon: Clapperboard },
  { id: 'deck', label: 'PPT Presentation', short: 'Slide Deck', desc: 'Slides + notes', icon: Presentation },
  { id: 'blog', label: 'Blog Post', short: 'Blog Post', desc: 'SEO long-form', icon: Newspaper },
  { id: 'advisory', label: 'Advisory', short: 'Advisory', desc: 'Findings & actions', icon: ShieldAlert },
  { id: 'infographic', label: 'Infographic', short: 'Infographic', desc: 'Stats & layout', icon: ChartPie },
  { id: 'simple', label: 'Simplified Explanation', short: 'Simplified', desc: 'Plain language', icon: Lightbulb },
  { id: 'translation', label: 'Language Translation', short: 'Translation', desc: '13 languages', icon: Languages },
] as const

export type FormatId = (typeof FORMATS)[number]['id']
export const formatOf = (id: FormatId) => FORMATS.find((f) => f.id === id)!

/** The three formats the pointer picks. */
export const DEMO_FORMATS = ['exec', 'linkedin', 'deck'] as const satisfies readonly FormatId[]
export type DraftId = (typeof DEMO_FORMATS)[number]

export const TONES = [
  { label: 'Professional', note: 'polished' },
  { label: 'Technical', note: 'precise' },
  { label: 'Casual', note: 'conversational' },
  { label: 'Academic', note: 'scholarly' },
]

export const AUDIENCES = [
  { id: 'manager', name: 'Manager/Executive' },
  { id: 'hr', name: 'HR/Sales' },
  { id: 'tech', name: 'Technical Team' },
  { id: 'public', name: 'General Public' },
]

/** The cloud models the workspace offers (lib/providers.ts), grouped as its model picker groups them. */
export const PROVIDERS = [
  { name: 'Groq', models: [['qwen/qwen3.8-27b', 'chat'], ['openai/gpt-oss-120b', 'chat'], ['openai/gpt-oss-20b', 'chat'], ['openai/gpt-oss-safeguard-20b', 'chat']] },
  { name: 'Gemini', models: [['gemini-3.5-flash-lite', 'vision'], ['gemini-3.8-flash', 'vision']] },
  { name: 'Mistral', models: [['mistral-large-latest', 'chat'], ['mistral-medium-latest', 'vision'], ['mistral-small-latest', 'vision'], ['open-mistral-nemo', 'chat'], ['codestral-latest', 'chat']] },
] as const

export type ModelChoice = { provider: string; model: string }
export const DEFAULT_MODEL: ModelChoice = { provider: 'Groq', model: 'openai/gpt-oss-120b' }
// Gemini reads much longer sources, so it's the one the pointer switches to.
export const DEMO_MODEL: ModelChoice = { provider: 'Gemini', model: 'gemini-3.8-flash' }

export const shortModel = (model: string) => (model.includes('/') ? model.slice(model.lastIndexOf('/') + 1) : model)
export const engineLabel = (m: ModelChoice) => `${m.provider} · ${shortModel(m.model)}`
export const readsImages = (m: ModelChoice) =>
  PROVIDERS.some((p) => p.models.some(([id, kind]) => id === m.model && kind === 'vision'))

export const EMPTY_QUOTE =
  'Transform your content into multiple formats. Upload your source, select your outputs, and generate accurate, editable drafts in seconds.'

export const REFINE_PROMPT = 'Shorter, end with one question'

// The drafts are written from the source above: no figures beyond what it states.
export const DRAFTS: Record<DraftId, string> = {
  exec: `## The ask
NTRO wants one platform that turns any source (news, reports, advisories, threat intelligence, policy papers) into the exact deliverable an operator asks for, from a single dashboard.

## Why it matters
Today every artefact is written by hand. Someone reads the source, works out the objective and drafts the format. It is slow, it needs content and domain expertise, and quality varies from writer to writer.

## What the platform must do
- Accept text, documents, images, video or a free-form prompt as the source.
- Let the operator pick one or more outputs: video package, LinkedIn post, X thread, advisory, infographic, executive summary or slides.
- Give controls for audience, tone, language, level of detail and objective.
- Draft every selected format from the same source, so they stay consistent.

## What will be judged
Source code, a README with setup steps, a two-page architecture note, a two-minute demo video and a five-slide technical deck.

## Decision needed
Pick two or three recent advisories as pilot sources, and agree who reviews the drafts before they go out.`,

  linkedin: `One report often turns into five deliverables: a briefing, a post, a slide deck, a video script and an advisory. Each one is written from scratch.

The Smart India Hackathon 2026 problem SIH26154, set by NTRO, asks for a platform that does this from a single source. Upload the content, choose the formats, set the audience and tone, and every deliverable is drafted together.

That is what we are building with Sankshep.ai. One source in, consistent drafts out, and a Private mode that keeps sensitive documents on your own machine.

If your team rewrites the same material for different audiences, which deliverable would you hand off first?

#SIH2026 #GenAI #NTRO`,

  deck: `## Slide 1: One source, every format
SIH26154 · Gen AI Platform for Automated Content Transformation · NTRO

## Slide 2: The problem
- Every artefact is drafted by hand from the source
- Slow, expertise-heavy and inconsistent between writers

## Slide 3: What the operator does
- Submits text, documents, images or video
- Picks the outputs and sets audience, tone and language

## Slide 4: What comes back
- Video package, posts, advisory, infographic, summary and slides
- Every format drafted from the same source

## Slide 5: How it is judged
- Source code, README and a two-page architecture note
- A two-minute demo video and a five-slide deck`,
}

/** The LinkedIn draft after the pointer asks for REFINE_PROMPT. */
export const LINKEDIN_REFINED = `One report, five deliverables, each written from scratch.

SIH26154 from NTRO asks for a platform that drafts them all from one source. We are building it as Sankshep.ai, with a Private mode for sensitive documents.

Which deliverable would you hand off first?

#SIH2026 #GenAI`

const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

/** History's stamp: "Oct 18, 2026 • 14:32", from the moment the demo generated. */
export const formatStamp = (ms: number) => ({ date: DATE.format(ms), time: TIME.format(ms) })
