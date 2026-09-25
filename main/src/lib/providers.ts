/**
 * Provider catalogue and one chat client for Groq, Gemini and Mistral.
 *
 * Every call goes straight from the browser to the provider (all three allow
 * CORS) when the user pasted their own key into the workspace. Without one, or
 * when it fails, requests go through /api/chat, which adds one of this
 * deployment's shared keys server-side (api/chat.ts). User keys live only in
 * memory and are never logged or sent to Supabase.
 */

export type ProviderId = 'groq' | 'gemini' | 'mistral'

/**
 * What a model reads: text only, or text and images. Only models that can write
 * drafts are listed; speech, text-to-speech and safety-classifier models are left out.
 */
export type ModelKind = 'chat' | 'vision'

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
      { id: 'openai/gpt-oss-120b', kind: 'chat' },
      { id: 'openai/gpt-oss-20b', kind: 'chat' },
      { id: 'openai/gpt-oss-safeguard-20b', kind: 'chat' },
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

/**
 * Every provider can be used without a key of the user's own: requests without one
 * (or whose key fails) go through /api/chat, which holds the shared keys (api/chat.ts).
 */
export function hasKey(_provider: ProviderId, _keys: ApiKeys): boolean {
  return true
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

/** Where a request goes: straight to the provider with the user's key, or through the shared-key service. */
type Route = { kind: 'own'; key: string } | { kind: 'shared' }

/** A failed request that may succeed if sent again the same way: overloaded or unreachable servers. */
class RetryableError extends Error {
  constructor(message: string, readonly waitMs: number) {
    super(message)
  }
}

/** The key is the problem, not the request: rejected (invalid, out of quota) or rate-limited for `waitMs`. */
class KeyError extends Error {
  constructor(message: string, readonly kind: 'rejected' | 'rate-limited', readonly waitMs = 0) {
    super(message)
  }
}

/** Every shared key for the provider has been rejected, or the shared-key service isn't there. */
class SharedKeysExhausted extends Error {}

/** Rounds of (own key, then shared keys) before giving up; each round waits out the shortest rate limit. */
const MAX_ROUNDS = 6
const MAX_WAIT_MS = 65_000
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Sends one chat request. The user's key goes first; if they gave none, or it is rejected or
 * rate-limited, the shared keys take over. Per-minute limits are waited out, so a draft
 * only fails when every key is unusable.
 */
export async function chat(ref: ModelRef, messages: ChatMessage[], keys: ApiKeys, opts: ChatOptions = {}): Promise<ChatResult> {
  const info = providerInfo(ref.provider)
  if (!canWrite(modelInfo(ref)?.kind)) {
    throw new Error(`${ref.model} is a ${modelInfo(ref)?.kind ?? 'non-text'} model and can't write drafts.`)
  }
  const own = keys[ref.provider]?.trim()
  let ownProblem: string | null = null
  let sharedOut = false

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const routes: Route[] = [
      ...(own && !ownProblem?.startsWith('rejected') ? [{ kind: 'own', key: own } as const] : []),
      ...(sharedOut ? [] : [{ kind: 'shared' } as const]),
    ]
    if (routes.length === 0) break
    let shortestWait = Infinity

    for (const route of routes) {
      try {
        const result = ref.provider === 'gemini'
          ? await geminiChat(ref.model, messages, route, opts)
          : await openAiStyleChat(info, ref.model, messages, route, opts)
        return { ...result, content: stripThinking(result.content) }
      } catch (err) {
        if (err instanceof SharedKeysExhausted) {
          sharedOut = true
        } else if (err instanceof KeyError) {
          if (route.kind === 'own') ownProblem = `${err.kind}: ${err.message}`
          if (err.kind === 'rate-limited') shortestWait = Math.min(shortestWait, err.waitMs)
        } else if (err instanceof RetryableError) {
          shortestWait = Math.min(shortestWait, err.waitMs)
        } else {
          throw err // About the request itself (too long, unknown model): another key won't help.
        }
      }
    }

    if (shortestWait === Infinity) break // Nothing left that waiting would fix.
    if (round < MAX_ROUNDS) await sleep(Math.min(shortestWait, MAX_WAIT_MS) + Math.random() * 500)
  }

  if (ownProblem?.startsWith('rejected') && sharedOut) {
    throw new Error(`Your ${info.name} API key was rejected, and the system API keys are exhausted. Check your key in the AI engine step.`)
  }
  if (sharedOut) throw new Error(`System API keys are exhausted. Please enter your own valid ${info.name} API key in the AI engine step.`)
  throw new Error(`${info.name} is busy: every available key is rate-limited. Wait a minute and generate again, or pick another model.`)
}

/** Reasoning models may put their scratch work inline; only the answer belongs in a draft. */
function stripThinking(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

/** Groq and Mistral both speak the OpenAI chat-completions dialect. */
async function openAiStyleChat(info: ProviderInfo, model: string, messages: ChatMessage[], route: Route, opts: ChatOptions): Promise<ChatResult> {
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
  const res = await send(info, model, route, url, route.kind === 'own' ? { Authorization: `Bearer ${route.key}` } : {}, body)
  const data = await res.json()
  const choice = data.choices?.[0]
  const content: string | undefined = choice?.message?.content
  if (!content?.trim()) {
    if (choice?.finish_reason === 'length') throw new Error(`${model} ran out of room before writing the draft. Try again, or pick another model.`)
    throw new RetryableError(`${info.name} returned an empty response from ${model}.`, 2000)
  }
  return { content, model: data.model ?? model, truncated: choice?.finish_reason === 'length' }
}

async function geminiChat(model: string, messages: ChatMessage[], route: Route, opts: ChatOptions): Promise<ChatResult> {
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
  const res = await send(info, model, route, url, route.kind === 'own' ? { 'x-goog-api-key': route.key } : {}, body)
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
const SHARED_ENDPOINT = '/api/chat'

async function send(info: ProviderInfo, model: string, route: Route, url: string, auth: Record<string, string>, body: unknown): Promise<Response> {
  const shared = route.kind === 'shared'
  const where = shared ? 'the shared-key service' : info.host
  let res: Response
  try {
    res = await fetch(shared ? SHARED_ENDPOINT : url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(shared ? { provider: info.id, model, body } : body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'no answer after 2 minutes' : err instanceof Error ? err.message : String(err)
    throw new RetryableError(`Couldn't reach ${where}: ${reason}`, 3000)
  }
  if (res.ok) return res
  const text = (await res.text()).slice(0, 400)

  if (shared) {
    // Not JSON: the page is hosted without the /api function (e.g. a static preview).
    if (!/^\s*\{/.test(text)) throw new SharedKeysExhausted('Shared-key service unavailable.')
    if (res.status === 404) throw new Error(`${model} isn't available on the shared ${info.name} keys. Pick another model, or add your own ${info.name} key.`)
    if (res.status === 503 && /keys_exhausted/.test(text)) throw new SharedKeysExhausted(text)
    if (res.status === 429) throw new KeyError(`${info.name} shared keys are rate-limited.`, 'rate-limited', retryDelayMs(res, text))
  } else {
    // Gemini reports a bad key as 400 "API key not valid".
    if (res.status === 401 || res.status === 403 || (res.status === 400 && /api.key/i.test(text))) throw new KeyError(`${info.name} rejected the API key (${res.status}).`, 'rejected')
    if (res.status === 429) {
      // Daily quotas don't reset within a minute; hand over to the shared keys instead of waiting.
      if (/per day|daily|quota exceeded/i.test(text) && !/per minute/i.test(text)) throw new KeyError(`${info.name} daily limit reached for your key.`, 'rejected')
      throw new KeyError(`${info.name} rate limit reached.`, 'rate-limited', retryDelayMs(res, text))
    }
    if (res.status === 404) throw new KeyError(`${info.name} doesn't offer ${model} to your key (404).`, 'rejected')
  }
  if (res.status === 413 || /request too large|context.length|maximum context|too many tokens/i.test(text)) {
    throw new Error(`The source is too long for this model on ${info.name}. Pick a model with a larger limit (Gemini reads the most), or shorten the source.`)
  }
  if (res.status === 408 || res.status >= 500) throw new RetryableError(`${info.name} API ${res.status}: ${text}`, 3000)
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
