/**
 * Provider catalogue and one chat client for Groq, Gemini and Mistral.
 *
 * Every call goes straight from the browser to the provider (all three allow
 * CORS), authenticated with the key the user pasted into the workspace. Groq
 * alone can fall back to this deployment's own key (lib/groq.ts). Keys live
 * only in memory and are never logged or sent to Supabase.
 */

import { hasGroqKey as hasWorkspaceGroqKey, nextWorkspaceGroqKey } from './groq'

export type ProviderId = 'groq' | 'gemini' | 'mistral'

/** What a model can do. Only `chat` and `vision` models can write drafts. */
export type ModelKind = 'chat' | 'vision' | 'speech-to-text' | 'text-to-speech' | 'safety-classifier'

export interface ModelInfo {
  id: string
  kind: ModelKind
}

export interface ProviderInfo {
  id: ProviderId
  name: string
  keyPlaceholder: string
  keyUrl: string
  host: string
  models: ModelInfo[]
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'groq',
    name: 'Groq',
    keyPlaceholder: 'gsk_…',
    keyUrl: 'https://console.groq.com/keys',
    host: 'api.groq.com',
    models: [
      { id: 'qwen/qwen3.8-27b', kind: 'chat' },
      { id: 'canopylabs/orpheus-arabic-saudi', kind: 'text-to-speech' },
      { id: 'canopylabs/orpheus-v1-english', kind: 'text-to-speech' },
      { id: 'meta-llama/llama-prompt-guard-2-22m', kind: 'safety-classifier' },
      { id: 'meta-llama/llama-prompt-guard-2-86m', kind: 'safety-classifier' },
      { id: 'openai/gpt-oss-120b', kind: 'chat' },
      { id: 'openai/gpt-oss-20b', kind: 'chat' },
      { id: 'openai/gpt-oss-safeguard-20b', kind: 'chat' },
      { id: 'whisper-large-v3', kind: 'speech-to-text' },
      { id: 'whisper-large-v3-turbo', kind: 'speech-to-text' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    keyPlaceholder: 'AIza…',
    keyUrl: 'https://aistudio.google.com/apikey',
    host: 'generativelanguage.googleapis.com',
    models: [
      { id: 'gemini-3.5-flash-lite', kind: 'vision' },
      { id: 'gemini-3.8-flash', kind: 'vision' },
      { id: 'gemini-2.5-flash', kind: 'vision' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    keyPlaceholder: 'Paste your Mistral key',
    keyUrl: 'https://console.mistral.ai/api-keys',
    host: 'api.mistral.ai',
    models: [
      { id: 'mistral-large-latest', kind: 'chat' },
      { id: 'mistral-medium-latest', kind: 'vision' },
      { id: 'mistral-small-latest', kind: 'vision' },
      { id: 'open-mistral-nemo', kind: 'chat' },
      { id: 'codestral-latest', kind: 'chat' },
    ],
  },
]

export interface ModelRef {
  provider: ProviderId
  model: string
}

export type ApiKeys = Partial<Record<ProviderId, string>>

// gpt-oss-120b, not Qwen: on the workspace key Qwen is capped at 1,000 output tokens a minute,
// which fails every format after the first.
export const DEFAULT_MODEL: ModelRef = { provider: 'groq', model: 'openai/gpt-oss-120b' }

export function providerInfo(id: ProviderId) {
  return PROVIDERS.find((p) => p.id === id)!
}

export function modelInfo(ref: ModelRef) {
  return providerInfo(ref.provider).models.find((m) => m.id === ref.model)
}

export const canWrite = (kind: ModelKind | undefined) => kind === 'chat' || kind === 'vision'

export const refKey = (ref: ModelRef) => `${ref.provider}:${ref.model}`

export function parseRefKey(key: string): ModelRef {
  const i = key.indexOf(':')
  return { provider: key.slice(0, i) as ProviderId, model: key.slice(i + 1) }
}

/** The key a request to `provider` will use: the user's own, or for Groq the workspace key. */
export function resolveKey(provider: ProviderId, keys: ApiKeys): string | null {
  const own = keys[provider]?.trim()
  if (own) return own
  return provider === 'groq' ? nextWorkspaceGroqKey() : null
}

/** Whether a request to `provider` has a key to use, without consuming a workspace key rotation. */
export function hasKey(provider: ProviderId, keys: ApiKeys, workspaceGroqKey: boolean): boolean {
  return !!keys[provider]?.trim() || (provider === 'groq' && workspaceGroqKey)
}

/* ─── Chat ──────────────────────────────────────────────────────────────── */

export interface ImageInput {
  mimeType: string
  /** Base64 without the data: prefix. */
  data: string
}

export interface ChatMessage {
  role: 'system' | 'user'
  content: string
  images?: ImageInput[]
}

export interface ChatResult {
  content: string
  /** The model id the provider reports having used. */
  model: string
  /** The model stopped at maxTokens, so the text is cut off. */
  truncated: boolean
}

interface ChatOptions {
  maxTokens?: number
  temperature?: number
}

/** A failed request that may succeed if sent again: rate limits, overloaded or unreachable servers. */
class RetryableError extends Error {
  constructor(message: string, readonly waitMs: number) {
    super(message)
  }
}

const MAX_ATTEMPTS = 6
const MAX_WAIT_MS = 65_000
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function chat(ref: ModelRef, messages: ChatMessage[], keys: ApiKeys, opts: ChatOptions = {}): Promise<ChatResult> {
  const info = providerInfo(ref.provider)
  if (!hasKey(ref.provider, keys, hasWorkspaceGroqKey)) {
    throw new Error(`Add your ${info.name} API key in the AI engine step to use ${ref.model}.`)
  }
  if (!canWrite(modelInfo(ref)?.kind)) {
    throw new Error(`${ref.model} is a ${modelInfo(ref)?.kind ?? 'non-text'} model and can't write drafts.`)
  }
  // Free-tier limits are per minute, so waiting out a 429 almost always gets the draft through.
  for (let attempt = 1; ; attempt++) {
    const key = resolveKey(ref.provider, keys)!
    try {
      const result = ref.provider === 'gemini'
        ? await geminiChat(ref.model, messages, key, opts)
        : await openAiStyleChat(info, ref.model, messages, key, opts)
      return { ...result, content: stripThinking(result.content) }
    } catch (err) {
      if (!(err instanceof RetryableError) || attempt >= MAX_ATTEMPTS) throw err
      await sleep(Math.min(err.waitMs, MAX_WAIT_MS) + Math.random() * 500)
    }
  }
}

/** Reasoning models may put their scratch work inline; only the answer belongs in a draft. */
function stripThinking(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

/** Groq and Mistral both speak the OpenAI chat-completions dialect. */
async function openAiStyleChat(info: ProviderInfo, model: string, messages: ChatMessage[], key: string, opts: ChatOptions): Promise<ChatResult> {
  const url = info.id === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.mistral.ai/v1/chat/completions'
  const body = {
    model,
    messages: messages.map((m) =>
      m.images?.length
        ? {
            role: m.role,
            content: [
              { type: 'text', text: m.content },
              // Mistral takes the data URL as a plain string (docs.mistral.ai, vision).
              ...m.images.map((img) => ({ type: 'image_url', image_url: `data:${img.mimeType};base64,${img.data}` })),
            ],
          }
        : { role: m.role, content: m.content },
    ),
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.7,
    // gpt-oss reasons before answering and the reasoning shares max_tokens; keep it short so the draft fits.
    ...(info.id === 'groq' && model.startsWith('openai/gpt-oss') && { reasoning_effort: 'low' }),
  }
  const res = await send(info, url, { Authorization: `Bearer ${key}` }, body)
  const data = await res.json()
  const choice = data.choices?.[0]
  const content: string | undefined = choice?.message?.content
  if (!content?.trim()) {
    if (choice?.finish_reason === 'length') throw new Error(`${model} ran out of room before writing the draft. Try again, or pick another model.`)
    throw new RetryableError(`${info.name} returned an empty response from ${model}.`, 2000)
  }
  return { content, model: data.model ?? model, truncated: choice?.finish_reason === 'length' }
}

async function geminiChat(model: string, messages: ChatMessage[], key: string, opts: ChatOptions): Promise<ChatResult> {
  const info = providerInfo('gemini')
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n')
  const body = {
    ...(system && { systemInstruction: { parts: [{ text: system }] } }),
    contents: messages
      .filter((m) => m.role === 'user')
      .map((m) => ({
        role: 'user',
        parts: [
          { text: m.content },
          ...(m.images ?? []).map((img) => ({ inline_data: { mime_type: img.mimeType, data: img.data } })),
        ],
      })),
    generationConfig: {
      // Gemini's thinking tokens count against this budget, so leave room beyond the draft itself.
      maxOutputTokens: Math.max(8192, opts.maxTokens ?? 0),
      temperature: opts.temperature ?? 0.7,
    },
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const res = await send(info, url, { 'x-goog-api-key': key }, body)
  const data = await res.json()
  const candidate = data.candidates?.[0]
  const content = (candidate?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('').trim()
  if (!content) {
    const reason = candidate?.finishReason ?? data.promptFeedback?.blockReason ?? 'no text'
    throw new Error(`Gemini returned no text from ${model} (${reason}).`)
  }
  return { content, model: data.modelVersion ?? model, truncated: candidate?.finishReason === 'MAX_TOKENS' }
}

const REQUEST_TIMEOUT_MS = 120_000

async function send(info: ProviderInfo, url: string, auth: Record<string, string>, body: unknown): Promise<Response> {
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'no answer after 2 minutes' : err instanceof Error ? err.message : String(err)
    throw new RetryableError(`Couldn't reach ${info.host}: ${reason}`, 3000)
  }
  if (res.ok) return res
  const text = (await res.text()).slice(0, 400)
  // Gemini reports a bad key as 400 "API key not valid".
  if (res.status === 401 || res.status === 403 || (res.status === 400 && /api key/i.test(text))) throw new Error(`${info.name} rejected the API key (${res.status}). Check the key in the AI engine step.`)
  if (res.status === 413 || /request too large|context.length|maximum context|too many tokens/i.test(text)) {
    throw new Error(`The source is too long for this model on ${info.name}. Pick a model with a larger limit (Gemini reads the most), or shorten the source.`)
  }
  if (res.status === 429) {
    // Daily quotas don't reset within a minute; retrying only burns time.
    if (/per day|daily|quota exceeded/i.test(text) && !/per minute/i.test(text)) {
      throw new Error(`${info.name} daily limit reached for this key. Use another model or your own key. ${text}`)
    }
    throw new RetryableError(`${info.name} rate limit reached. Wait a minute or use another model. ${text}`, retryDelayMs(res, text))
  }
  if (res.status === 408 || res.status >= 500) throw new RetryableError(`${info.name} API ${res.status}: ${text}`, 3000)
  if (res.status === 404) throw new Error(`${info.name} doesn't offer this model to your key (404). ${text}`)
  throw new Error(`${info.name} API ${res.status}: ${text}`)
}

/** How long the provider asks us to wait: the Retry-After header, or Groq's "try again in 6.3s" / "1m2.5s". */
function retryDelayMs(res: Response, text: string) {
  const header = Number(res.headers.get('retry-after'))
  if (header > 0) return header * 1000
  const m = /try again in (?:(\d+)m)?([\d.]+)(ms|s)/i.exec(text)
  if (m) return (Number(m[1] ?? 0) * 60 + Number(m[2]) / (m[3] === 'ms' ? 1000 : 1)) * 1000
  const gemini = /retry in ([\d.]+)s/i.exec(text)
  return gemini ? Number(gemini[1]) * 1000 : 10_000
}
