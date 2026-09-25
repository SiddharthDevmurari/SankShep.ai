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
import { describeReader, pickImageReader, readImage } from './ingest'

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

export interface Audience {
  name: string
  description: string
}

export const AUDIENCE_PRESETS: Audience[] = [
  { name: 'Manager/Executive', description: 'Time-poor decision makers. Lead with the conclusion, the business impact and the decision needed; keep detail to what supports a decision.' },
  { name: 'HR/Sales', description: 'People-facing teams. Focus on what changes for customers and employees, talking points they can reuse, and plain language over jargon.' },
  { name: 'Technical Team', description: 'Engineers and specialists. Keep precise terminology, include mechanisms, constraints and trade-offs, and do not oversimplify.' },
  { name: 'General Public', description: 'Readers with no background in the topic. Explain terms, use everyday examples, and say why it matters to them.' },
]

export type EngineMode = 'single' | 'compare'

export interface EngineConfig {
  mode: EngineMode
  /** One model in single mode; two or three in compare mode. */
  models: ModelRef[]
  keys: ApiKeys
}

export interface PipelineInput {
  content: string          // source text or file-extracted text (may be empty when images carry the source)
  images?: ImageInput[]
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
}

// ─── Node: Ingest ────────────────────────────────────────────────────────────

async function ingestNode(input: PipelineInput): Promise<{ text: string; readBy: string | null }> {
  if (!input.images?.length) return { text: input.content, readBy: null }
  const reader = pickImageReader(input.engine.models, input.engine.keys)
  const extracted = await Promise.all(input.images.map((img) => readImage(img, reader, input.engine.keys)))
  return {
    text: [input.content.trim(), ...extracted].filter(Boolean).join('\n\n'),
    readBy: describeReader(reader),
  }
}

// ─── Node: Parse ─────────────────────────────────────────────────────────────

async function parseNode(raw: string, ref: ModelRef, keys: ApiKeys): Promise<string> {
  // For URL/file content already extracted to text, this is a light cleaning pass
  const result = await chat(
    ref,
    [
      {
        role: 'system',
        content:
          'You are a document parser. Clean and structure the provided raw content into well-formatted paragraphs. Remove noise, fix formatting, preserve all factual content. Output only the cleaned text.',
      },
      { role: 'user', content: raw.slice(0, 12000) },
    ],
    keys,
  )
  return result.content
}

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
    'Language Translation': {
      system: `You are a professional translator and cultural adaptation specialist.${schemaInstr}`,
      user: `Translate the following content into ${targetLanguage ?? 'Hindi'}. Requirements:
- Maintain the original meaning, tone, and structure
- Use natural, idiomatic phrasing (not literal translation)
- Preserve technical terms with their ${targetLanguage ?? 'Hindi'} equivalent (add English in brackets if no equivalent)
- Output the full translation

Source content:
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

function audienceInstruction(audience?: Audience | null) {
  if (!audience?.name.trim()) return ''
  const traits = audience.description.trim()
  return `\n\nTarget audience: ${audience.name.trim()}.${traits ? ` ${traits}` : ''} Choose vocabulary, depth, examples and emphasis for this audience.`
}

async function formatNode(
  format: OutputFormat,
  parsedSource: string,
  input: PipelineInput,
  ref: ModelRef,
): Promise<FormatResult> {
  try {
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
          content: `You are refining existing ${format} content. Apply the user's change instructions precisely. Output only the updated content, no meta-commentary.${audienceInstruction(audience)}`,
        },
        {
          role: 'user',
          content: `Original source:\n${originalSource.slice(0, 4000)}\n\nCurrent ${format} output:\n${currentOutput}\n\nRefinement instructions: ${refinement}\n\nOutput the fully revised ${format}:`,
        },
      ],
      keys,
      { maxTokens: 2048, temperature: 0.65 },
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
  const [primary] = input.engine.models

  // Node 1: Ingest. An image that can't be read stops the run: there is no source without it.
  const ingested = await ingestNode(input)

  // Node 2: Parse once with the first model; every model then drafts from the same cleaned source.
  let parsedSource: string
  try {
    parsedSource = await parseNode(ingested.text, primary, input.engine.keys)
  } catch {
    parsedSource = ingested.text // fallback to raw if parse fails
  }

  // When no standard formats are selected but a custom schema is provided,
  // treat it as a standalone Custom Format generation.
  const formatsToRun: OutputFormat[] =
    input.formats.length === 0 && input.customSchema?.trim()
      ? ['Custom Format']
      : input.formats

  // Node 3+: every (model, format) pair in parallel
  const runs = await Promise.all(
    input.engine.models.map(async (ref): Promise<ModelRun> => {
      const settled = await Promise.allSettled(formatsToRun.map((fmt) => formatNode(fmt, parsedSource, input, ref)))
      const results: Record<string, FormatResult> = {}
      settled.forEach((s, i) => {
        const fmt = formatsToRun[i]
        results[fmt] = s.status === 'fulfilled'
          ? s.value
          : { format: fmt, output: '', status: 'error', error: s.reason?.message ?? 'Unknown error' }
      })
      return { ref, results: results as Record<OutputFormat, FormatResult> }
    }),
  )

  return { parsedSource, runs, durationMs: Date.now() - t0, imageReadBy: ingested.readBy }
}
