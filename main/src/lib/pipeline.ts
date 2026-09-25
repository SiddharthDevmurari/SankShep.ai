/**
 * Content transformation pipeline, LangGraph-inspired parallel node execution.
 *
 * Architecture mirrors a LangGraph StateGraph:
 *   ingest_node (images to text) → parse_node → [format_node × model]… → collect_node
 *
 * In comparison mode every selected model gets its own full set of format
 * nodes, all running concurrently (Promise.allSettled). Each node calls the
 * provider directly with the user's own key (lib/providers.ts).
 */

import { chat, type ApiKeys, type ImageInput, type ModelRef, type ProviderId } from './providers'
import { describeReader, pickImageReader, readImages } from './ingest'

export type OutputFormat =
  | 'Video'
  | 'LinkedIn Post'
  | 'Twitter/X Post'
  | 'Advisory'
  | 'Infographic'
  | 'Executive Summary'
  | 'PPT Presentation'
  | 'Blog Post'
  | 'Simplified Explanation'
  | 'Language Translation'
  | 'Custom Format'

export type ToneOption = 'Professional' | 'Technical' | 'Casual-friendly' | 'Academic'

/**
 * The people who will read, watch or receive the finished content: the end consumer,
 * never the person using Sankshep to produce it. Choosing "HR/Sales" means the drafts
 * are written to be handed to HR and sales staff.
 */
export interface Audience {
  name: string
  /** Who these readers are and what they need, written about them, not about the author. */
  description: string
}

export const AUDIENCE_PRESETS: Audience[] = [
  { name: 'Manager/Executive', description: 'Senior managers and executives who will decide or act on this. They are short on time: lead with the conclusion, the business impact and the decision they need to make, and keep detail to what supports that decision.' },
  { name: 'HR/Sales', description: 'HR and sales staff who will use this in their work with employees and customers. Show what changes for those people, give talking points they can repeat, and use plain language over jargon.' },
  { name: 'Technical Team', description: 'Engineers and specialists who will build, run or evaluate this. Keep precise terminology, include mechanisms, constraints and trade-offs, and do not oversimplify.' },
  { name: 'General Public', description: 'Members of the public with no background in the topic. Explain terms, use everyday examples, and say why it matters to them.' },
]

export type EngineMode = 'single' | 'compare'

export interface EngineConfig {
  mode: EngineMode
  /** One model in single mode; two or three in compare mode. */
  models: ModelRef[]
  keys: ApiKeys
}

export interface PipelineInput {
  content: string          // source text or file-extracted text (may be empty when images or a link carry the source)
  images?: ImageInput[]
  url?: string             // a web page to read as the source
  formats: OutputFormat[]
  tone: ToneOption
  customSchema?: string
  targetLanguage?: string  // for Language Translation
  audience?: Audience | null
  engine: EngineConfig
}

export interface FormatResult {
  format: OutputFormat
  output: string
  status: 'success' | 'error'
  error?: string
  model?: string           // the model id the provider reports for this draft
  provider?: ProviderId
}

/** One model's full set of drafts. */
export interface ModelRun {
  ref: ModelRef
  results: Record<OutputFormat, FormatResult>
}

export interface PipelineOutput {
  parsedSource: string
  runs: ModelRun[]
  durationMs: number
  /** Which reader turned the uploaded image into text, when there was one. */
  imageReadBy: string | null
  /** Set when the source was longer than a model takes in one request and only passages of it were sent. */
  sourceNote: string | null
}

// ─── Node: Ingest ────────────────────────────────────────────────────────────

/**
 * Reads a web page as Markdown through Jina Reader, which fetches server-side and allows CORS.
 * Models can't open links themselves; without this they would invent the page.
 */
async function readUrl(raw: string): Promise<string> {
  const url = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`
  let res: Response
  try {
    res = await fetch(`https://r.jina.ai/${url}`, { headers: { Accept: 'text/plain' }, signal: AbortSignal.timeout(60_000) })
  } catch {
    throw new Error(`Couldn't open ${url}. Check the link, or paste the page's text instead.`)
  }
  const text = res.ok ? (await res.text()).trim() : ''
  // The reader prefixes Title / URL Source / Markdown Content headers; the body is what matters.
  const marker = 'Markdown Content:'
  const body = text.includes(marker) ? text.slice(text.indexOf(marker) + marker.length).trim() : text
  if (!body) throw new Error(`Couldn't read ${url} (${res.status}). The page may need a login. Paste its text instead.`)
  // Keep link text but drop images and URLs: they use up the model's source budget and say nothing.
  return body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
}

async function ingestNode(input: PipelineInput): Promise<{ text: string; readBy: string | null }> {
  const parts = [input.content.trim()]
  if (input.url?.trim()) parts.push(await readUrl(input.url))
  let readBy: string | null = null
  if (input.images?.length) {
    const read = await readImages(input.images, pickImageReader(input.engine.models, input.engine.keys), input.engine.keys)
    parts.push(read.text)
    readBy = describeReader(read.reader)
  }
  return { text: parts.filter(Boolean).join('\n\n'), readBy }
}

// ─── Node: Parse ─────────────────────────────────────────────────────────────

/**
 * Normalises extracted text locally. An earlier version had a model rewrite the
 * source, which cut it at 12,000 characters and spent the rate limit before any draft.
 */
function parseNode(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Characters of source each provider gets per draft. Groq's free tier allows 8,000 tokens a
 * minute across prompt and draft, so one request must stay well under that; Mistral and
 * Gemini take far more.
 */
const SOURCE_BUDGET: Record<ProviderId, number> = { groq: 12_000, mistral: 60_000, gemini: 200_000 }

/** Parallel drafts per provider. More than this only trips per-minute limits sooner. */
const CONCURRENCY: Record<ProviderId, number> = { groq: 2, mistral: 2, gemini: 3 }

const SAMPLE_WINDOWS = 6

/** Fits a long source into `budget` by taking the opening of evenly spaced sections, so the whole document is represented. */
function fitSource(text: string, budget: number): string {
  if (text.length <= budget) return text
  const window = text.length / SAMPLE_WINDOWS
  const take = Math.floor(budget / SAMPLE_WINDOWS) - 10
  const pieces: string[] = []
  for (let i = 0; i < SAMPLE_WINDOWS; i++) {
    const from = Math.floor(i * window)
    let piece = text.slice(from, from + take)
    // End on a sentence or line break so no piece stops mid-word.
    const cut = Math.max(piece.lastIndexOf('\n'), piece.lastIndexOf('. '))
    if (cut > take * 0.6) piece = piece.slice(0, cut + 1)
    pieces.push(piece.trim())
  }
  return pieces.join('\n\n[…]\n\n')
}

/** Runs `tasks` with at most `limit` in flight, keeping results in order. */
async function withLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let next = 0
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

const WORDS = new Intl.NumberFormat('en-US')
const wordCount = (text: string) => text.match(/\S+/g)?.length ?? 0

// ─── Node: Format Generator ──────────────────────────────────────────────────

function buildPrompt(
  format: OutputFormat,
  source: string,
  tone: ToneOption,
  customSchema: string,
  targetLanguage?: string,
): { system: string; user: string } {
  const toneMap: Record<ToneOption, string> = {
    Professional: 'professional and polished',
    Technical: 'technical and precise with domain terminology',
    'Casual-friendly': 'casual, friendly, and conversational',
    Academic: 'academic and scholarly with formal citations',
  }
  const toneInstr = `Write in a ${toneMap[tone]} tone.`
  const schemaInstr = customSchema
    ? `\n\nCustom format instructions (highest priority): ${customSchema}`
    : ''

  const prompts: Record<OutputFormat, { system: string; user: string }> = {
    'Video': {
      system: `You are a professional video scriptwriter. ${toneInstr} Produce a complete video package.${schemaInstr}`,
      user: `Based on the following content, create a comprehensive video package including:
1. **Video Script** (with narration text and timing cues)
2. **Storyboard** (scene-by-scene visual descriptions)
3. **Narration Text** (standalone read-aloud script)
4. **Subtitle Text** (formatted SRT-style captions)
5. **Visual Recommendations** (b-roll, graphics, transitions)

Source content:
${source}`,
    },
    'LinkedIn Post': {
      system: `You are a LinkedIn content strategist. ${toneInstr} Write engaging, algorithm-optimised LinkedIn posts.${schemaInstr}`,
      user: `Write a LinkedIn post based on this content. Requirements:
- Maximum 3000 characters
- Open with a strong hook (no "I'm excited to share…")
- Use short paragraphs and strategic line breaks
- Include 3-5 relevant hashtags at the end
- End with a clear call-to-action

Source content:
${source}`,
    },
    'Twitter/X Post': {
      system: `You are a Twitter/X content strategist. ${toneInstr} Write punchy, viral-optimised content.${schemaInstr}`,
      user: `Write a Twitter/X thread based on this content. Requirements:
- First tweet: ≤280 characters (the hook)
- If a thread is warranted, write up to 8 numbered tweets
- Each tweet ≤280 characters
- Add 2-3 hashtags to the final tweet only

Source content:
${source}`,
    },
    'Advisory': {
      system: `You are a senior policy analyst. ${toneInstr} Write structured advisories.${schemaInstr}`,
      user: `Generate a structured advisory document from this content. Include:
1. **ADVISORY NOTICE** header with date
2. **Executive Overview** (2-3 sentences)
3. **Key Findings** (numbered list)
4. **Risk Assessment** (Low/Medium/High for each finding)
5. **Recommended Actions** (numbered, prioritised)
6. **Implementation Timeline** (immediate / 30-day / 90-day)
7. **Conclusion**

Source content:
${source}`,
    },
    'Infographic': {
      system: `You are an infographic designer and content strategist. ${toneInstr}${schemaInstr}`,
      user: `Create infographic content from this material. Provide:
1. **Infographic Title** (punchy, ≤8 words)
2. **Subtitle** (one clarifying sentence)
3. **Key Statistics** (5-7 data points in "number + label" format)
4. **Main Sections** (3-5 sections, each with a headline and 2-3 bullet points)
5. **Call-to-Action** (bottom banner text)
6. **Layout Recommendation** (describe the visual flow)
7. **Color Palette Suggestion** (3-4 hex colors with usage labels)

Source content:
${source}`,
    },
    'Executive Summary': {
      system: `You are a C-suite communications expert. ${toneInstr} Write crisp executive summaries.${schemaInstr}`,
      user: `Create a concise executive summary from this content. Structure:
- **EXECUTIVE SUMMARY** (bold title)
- **Context** (1 paragraph — why this matters)
- **Key Points** (5-7 bullets, each ≤25 words)
- **Financial / Strategic Impact** (if applicable)
- **Decision Required** (clear ask or recommendation)
- **Next Steps** (3 action items with owners)

Maximum 400 words total.

Source content:
${source}`,
    },
    'PPT Presentation': {
      system: `You are a presentation designer. ${toneInstr} Create compelling slide decks.${schemaInstr}`,
      user: `Generate a complete presentation structure from this content. For each slide provide:
- Slide number and title
- 3-5 bullet points (≤12 words each)
- Speaker notes (2-4 sentences for presenter)
- Suggested visual (chart type, image description, or diagram)

Include: Title slide, Agenda, 5-8 content slides, and Conclusion slide.

Use exactly this layout for every slide, so the deck can be exported to PowerPoint:
## Slide 1: <title>
- <bullet>
- <bullet>
**Speaker notes:** <notes>
**Visual:** <suggestion>

Source content:
${source}`,
    },
    'Blog Post': {
      system: `You are a professional blogger and SEO writer. ${toneInstr} Write long-form, engaging blog posts.${schemaInstr}`,
      user: `Write a full blog post from this content. Requirements:
- SEO-optimised H1 title
- Meta description (155 characters)
- Introduction (hook + thesis, 100-150 words)
- 3-5 main sections with H2 headings
- Each section: 150-250 words with examples
- Conclusion with takeaway and CTA
- Suggested tags: 5 keywords

Source content:
${source}`,
    },
    'Simplified Explanation': {
      system: `You are an expert science communicator. ${toneInstr} Make complex topics accessible.${schemaInstr}`,
      user: `Explain this content in simple, accessible language. Requirements:
- Write for someone with no domain expertise
- Use analogies and everyday examples
- Replace jargon with plain English (define if unavoidable)
- Use short sentences (≤20 words)
- Structure: Brief intro → core concept → real-world example → key takeaway

Source content:
${source}`,
    },
    // Sent once per chunk by translateNode, so a long document is translated in full.
    'Language Translation': {
      system: `You are a professional translator. Translate the ENTIRE provided text strictly line-by-line. Do not summarize, truncate, or omit any sections. The text may be one part of a longer document: translate exactly this part, with no introduction or closing remarks.${schemaInstr}`,
      user: `Translate the following text into ${targetLanguage ?? 'Hindi'}. Requirements:
- Translate every line, heading, list item and table cell, in the original order
- Keep the line breaks, Markdown and numbering exactly as in the source
- Use natural, idiomatic ${targetLanguage ?? 'Hindi'}, keeping the original meaning and tone
- Keep technical terms, adding the English in brackets when there is no ${targetLanguage ?? 'Hindi'} equivalent
- Output only the translation

Text to translate:
${source}`,
    },
    'Custom Format': {
      system: `You are a content generation expert. ${toneInstr} Follow the user's custom format instructions exactly and completely.`,
      user: `Generate content from the source below, following these custom instructions precisely:

${customSchema}

Source content:
${source}`,
    },
  }

  return prompts[format]
}

/**
 * Tells the model who will consume the content. The audience is the end reader, not the
 * person asking for the draft: without saying so, models write *to the requester about*
 * the audience ("share these points with HR") instead of writing *for* the audience.
 */
function audienceInstruction(audience?: Audience | null, opts: { translation?: boolean } = {}) {
  if (!audience?.name.trim()) return ''
  const name = audience.name.trim()
  const traits = audience.description.trim()
  const rules = opts.translation
    // A translation must stay faithful; the audience only steers register and word choice.
    ? `- Keep the full meaning and every line of the source; use only the register and word choices that suit ${name}.`
    : `- Write the content itself, ready to be given to ${name}: choose vocabulary, depth, examples and emphasis for them.
- Do not address the person who requested it, and do not give them advice on how to present this to ${name}.
- Do not treat ${name} as the author or as the subject: they are the ones receiving it.`
  return `

AUDIENCE (end readers): the finished content will be read, watched or received by ${name}. They are the end consumers of this content, not the person asking you to write it.${traits ? `
About these readers: ${traits}` : ''}
${rules}`
}

async function formatNode(
  format: OutputFormat,
  parsedSource: string,
  input: PipelineInput,
  ref: ModelRef,
): Promise<FormatResult> {
  try {
    if (format === 'Language Translation') {
      const { text, model } = await translateNode(parsedSource, input, ref)
      return { format, output: text, status: 'success', model, provider: ref.provider }
    }
    const { system, user } = buildPrompt(format, parsedSource, input.tone, input.customSchema ?? '', input.targetLanguage)
    const result = await chat(
      ref,
      [
        { role: 'system', content: system + audienceInstruction(input.audience) },
        { role: 'user', content: user },
      ],
      input.engine.keys,
      { maxTokens: 2048, temperature: 0.72 },
    )
    return { format, output: result.content, status: 'success', model: result.model, provider: ref.provider }
  } catch (err) {
    return {
      format,
      output: '',
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ─── Node: Translate ─────────────────────────────────────────────────────────

/**
 * Source characters per translation request. The translation comes out longer than the source
 * (Indic scripts take 2–4× the tokens of English), so a chunk must leave its translation room
 * inside TRANSLATION_MAX_TOKENS.
 */
const TRANSLATION_CHUNK: Record<ProviderId, number> = { groq: 2_500, mistral: 4_000, gemini: 8_000 }
const TRANSLATION_MAX_TOKENS = 6_000
/** Below this a chunk that still overflows is sent as it is, rather than split again. */
const MIN_SPLIT_CHARS = 300

/** Splits text into chunks of at most `size` characters, at paragraph, line or sentence breaks. */
function chunkText(text: string, size: number): string[] {
  if (text.length <= size) return [text]
  const chunks: string[] = []
  let rest = text
  while (rest.length > size) {
    const window = rest.slice(0, size)
    const cut = [window.lastIndexOf('\n\n'), window.lastIndexOf('\n'), window.lastIndexOf('. ')].find((i) => i > size * 0.4)
    const end = cut !== undefined ? cut + 1 : size
    chunks.push(rest.slice(0, end).trim())
    rest = rest.slice(end)
  }
  if (rest.trim()) chunks.push(rest.trim())
  return chunks
}

/**
 * Translates the whole source, not a sample: chunk by chunk in order, joined back together.
 * A chunk whose translation hits the output limit is halved and retried, so nothing is cut off.
 */
async function translateNode(source: string, input: PipelineInput, ref: ModelRef): Promise<{ text: string; model: string }> {
  let model = ref.model
  const translate = async (chunk: string): Promise<string> => {
    const { system, user } = buildPrompt('Language Translation', chunk, input.tone, input.customSchema ?? '', input.targetLanguage)
    const result = await chat(
      ref,
      [
        { role: 'system', content: system + audienceInstruction(input.audience, { translation: true }) },
        { role: 'user', content: user },
      ],
      input.engine.keys,
      { maxTokens: TRANSLATION_MAX_TOKENS, temperature: 0.2 },
    )
    model = result.model
    if (!result.truncated || chunk.length < MIN_SPLIT_CHARS) return result.content
    const halves = chunkText(chunk, Math.ceil(chunk.length / 2))
    const parts: string[] = []
    for (const half of halves) parts.push(await translate(half))
    return parts.join('\n\n')
  }

  const parts: string[] = []
  // In order, one at a time: the parts must line up, and the provider's rate limit is shared.
  for (const chunk of chunkText(source, TRANSLATION_CHUNK[ref.provider])) parts.push(await translate(chunk))
  return { text: parts.join('\n\n'), model }
}

// ─── Regenerate a single format (independent, no side-effects) ───────────────

export async function regenerateFormat(
  format: OutputFormat,
  currentOutput: string,
  refinement: string,
  originalSource: string,
  tone: ToneOption,
  ref: ModelRef,
  keys: ApiKeys,
  audience?: Audience | null,
): Promise<FormatResult> {
  try {
    const result = await chat(
      ref,
      [
        {
          role: 'system',
          content: `You are refining existing ${format} content. Apply the user's change instructions precisely. Output only the updated content, no meta-commentary.${audienceInstruction(audience, { translation: format === 'Language Translation' })}`,
        },
        {
          role: 'user',
          content: `Original source:\n${originalSource.slice(0, 4000)}\n\nCurrent ${format} output:\n${currentOutput}\n\nRefinement instructions: ${refinement}\n\nOutput the fully revised ${format}:`,
        },
      ],
      keys,
      // A refined translation is rewritten whole, so it needs the translation's room, not a draft's.
      { maxTokens: format === 'Language Translation' ? TRANSLATION_MAX_TOKENS : 2048, temperature: 0.65 },
    )
    return { format, output: result.content, status: 'success', model: result.model, provider: ref.provider }
  } catch (err) {
    return {
      format,
      output: currentOutput,
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ─── Pipeline Runner ─────────────────────────────────────────────────────────

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const t0 = Date.now()

  // Node 1: Ingest. A source that can't be read stops the run: there is nothing to draft from.
  const ingested = await ingestNode(input)

  // Node 2: Parse locally; every model drafts from the same cleaned source.
  const parsedSource = parseNode(ingested.text)
  if (!parsedSource) throw new Error('The source has no readable text. Try another file, or paste the text.')

  // When no standard formats are selected but a custom schema is provided,
  // treat it as a standalone Custom Format generation.
  const formatsToRun: OutputFormat[] =
    input.formats.length === 0 && input.customSchema?.trim()
      ? ['Custom Format']
      : input.formats

  // Node 3+: every (model, format) pair, a few at a time per provider so rate limits hold.
  // Models from the same provider share its limit, so they queue behind each other.
  const queues = new Map<ProviderId, Promise<unknown>>()
  const runs = await Promise.all(
    input.engine.models.map(async (ref): Promise<ModelRun> => {
      const source = fitSource(parsedSource, SOURCE_BUDGET[ref.provider])
      // Translation works through the full source in chunks; every other format drafts from the fitted sample.
      const tasks = formatsToRun.map((fmt) => () => formatNode(fmt, fmt === 'Language Translation' ? parsedSource : source, input, ref))
      const drafts = (queues.get(ref.provider) ?? Promise.resolve()).then(() => withLimit(tasks, CONCURRENCY[ref.provider]))
      queues.set(ref.provider, drafts)
      const results: Record<string, FormatResult> = {}
      for (const r of await drafts) results[r.format] = r
      return { ref, results: results as Record<OutputFormat, FormatResult> }
    }),
  )

  const smallest = Math.min(...input.engine.models.map((r) => SOURCE_BUDGET[r.provider]))
  const sampled = formatsToRun.some((f) => f !== 'Language Translation')
  const sourceNote = sampled && parsedSource.length > smallest
    ? `The source is ${WORDS.format(wordCount(parsedSource))} words, more than ${input.engine.models.length > 1 ? 'some of these models' : 'this model'} can take in one request, so the drafts were written from passages spread across the whole document (about ${WORDS.format(wordCount(fitSource(parsedSource, smallest)))} words)${formatsToRun.includes('Language Translation') ? '. The translation covers the full text' : ''}. Gemini models read much longer sources.`
    : null

  return { parsedSource, runs, durationMs: Date.now() - t0, imageReadBy: ingested.readBy, sourceNote }
}
