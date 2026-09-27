/**
 * Provider catalogue and one chat client for Groq, Gemini and Mistral.
 *
 * Every call goes straight from the browser to the provider (all three allow
 * CORS) when the user pasted their own key into the workspace. Without one,
 * requests go through /api/chat, which adds one of this deployment's shared keys
 * server-side (api/chat.ts). A failing own key is never swapped for the shared
 * keys silently: chat() throws OwnKeyError and the workspace asks the user first.
 * User keys live only in memory and are never logged or sent to Supabase.
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
 * go through /api/chat, which holds the shared keys (api/chat.ts).
 */
export function hasKey(_provider: ProviderId, _keys: ApiKeys): boolean {
  return true
}

/** The same keys minus `provider`'s, so its requests go through the shared keys. Used once the user agrees to that. */
export function withoutKey(keys: ApiKeys, provider: ProviderId): ApiKeys {
  const rest = { ...keys }
  delete rest[provider]
  return rest
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
  /** Aborting it stops the request at once, including any wait between retries. */
  signal?: AbortSignal
}

/**
 * The user's own key failed: rejected, out of quota, no access to the model, or rate-limited
 * beyond a short wait. The message is the provider's own explanation. Nothing falls back to the
 * shared keys until the user agrees; the caller then retries with withoutKey(keys, provider).
 */
export class OwnKeyError extends Error {
  constructor(readonly provider: ProviderId, message: string) {
    super(message)
    this.name = 'OwnKeyError'
  }
}

/** What an aborted request rejects with, so every stop looks the same to callers. */
export function abortError() {
  return new DOMException('Generation stopped.', 'AbortError')
}

export function isAbortError(err: unknown): boolean {
  return (err as { name?: string } | null)?.name === 'AbortError'
}

/** Throws the abort error if `signal` has fired (AbortSignal.throwIfAborted is missing on older Safari). */
export function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw abortError()
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

/** Attempts before giving up; each one waits out the rate limit or outage the last one hit. */
const MAX_ROUNDS = 6
const MAX_WAIT_MS = 65_000
/**
 * A per-minute limit on the user's own key that clears this fast is waited out, at most this many
 * times, instead of interrupting them: parallel drafts trip these limits routinely. Anything longer
 * goes to the user as an OwnKeyError.
 */
const OWN_KEY_MAX_WAIT_MS = 15_000
const OWN_KEY_WAITS = 2

/** Resolves after `ms`, or rejects with the abort error as soon as `signal` fires. */
function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Sends one chat request: with the user's key when they gave one, otherwise through the shared keys.
 * Outages and short rate limits are retried. A failing own key throws OwnKeyError rather than
 * switching to the shared keys, so the user decides. Aborting `opts.signal` rejects with an AbortError.
 */
export async function chat(ref: ModelRef, messages: ChatMessage[], keys: ApiKeys, opts: ChatOptions = {}): Promise<ChatResult> {
  const info = providerInfo(ref.provider)
  if (!canWrite(modelInfo(ref)?.kind)) {
    throw new Error(`${ref.model} is a ${modelInfo(ref)?.kind ?? 'non-text'} model and can't write drafts.`)
  }
  const own = keys[ref.provider]?.trim()
  const route: Route = own ? { kind: 'own', key: own } : { kind: 'shared' }
  let ownWaits = 0

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    throwIfAborted(opts.signal)
    let wait: number
    try {
      const result = ref.provider === 'gemini'
        ? await geminiChat(ref.model, messages, route, opts)
        : await openAiStyleChat(info, ref.model, messages, route, opts)
      return { ...result, content: stripThinking(result.content) }
    } catch (err) {
      if (err instanceof KeyError && route.kind === 'own') {
        const brief = err.kind === 'rate-limited' && err.waitMs <= OWN_KEY_MAX_WAIT_MS && ownWaits < OWN_KEY_WAITS
        if (!brief) throw new OwnKeyError(ref.provider, err.message)
        ownWaits++
        wait = err.waitMs
      } else if (err instanceof KeyError || err instanceof RetryableError) {
        wait = err.waitMs // Shared keys rate-limited, or the provider overloaded or unreachable.
      } else if (err instanceof SharedKeysExhausted) {
        throw new Error(`System API keys are exhausted. Please enter your own valid ${info.name} API key in the AI engine step.`)
      } else {
        throw err // About the request itself (too long, unknown model), or a stop: retrying won't help.
      }
    }
    if (round < MAX_ROUNDS) await sleep(Math.min(wait, MAX_WAIT_MS) + Math.random() * 500, opts.signal)
  }

  throw new Error(`${info.name} is busy right now (overloaded or rate-limited). Wait a minute and generate again, or pick another model.`)
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
  const res = await send(info, model, route, url, route.kind === 'own' ? { Authorization: `Bearer ${route.key}` } : {}, body, opts.signal)
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
  const res = await send(info, model, route, url, route.kind === 'own' ? { 'x-goog-api-key': route.key } : {}, body, opts.signal)
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

/**
 * AbortSignal.timeout, with a fallback for Safari before 16 (older iPhones and Macs),
 * where calling it would throw and stop every request. The fallback aborts with a
 * TimeoutError too, so callers can tell a timeout from other failures.
 */
export function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms)
  const controller = new AbortController()
  setTimeout(() => controller.abort(new DOMException('The request timed out.', 'TimeoutError')), ms)
  return controller.signal
}

/** A request's signal: fires on `ms` elapsing (TimeoutError) or on `stop` (the user's stop), whichever comes first. */
export function requestSignal(ms: number, stop?: AbortSignal): AbortSignal {
  const timeout = timeoutSignal(ms)
  if (!stop) return timeout
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([timeout, stop])
  const controller = new AbortController()
  for (const s of [timeout, stop]) {
    if (s.aborted) {
      controller.abort(s.reason)
      break
    }
    s.addEventListener('abort', () => controller.abort(s.reason), { once: true })
  }
  return controller.signal
}

/** The provider's own explanation from an error body (Groq/Mistral/Gemini shapes), for showing to the user. */
function providerMessage(text: string): string {
  try {
    const data = JSON.parse(text)
    const message = data?.error?.message ?? data?.message ?? data?.detail
    if (typeof message === 'string' && message.trim()) return message.trim()
  } catch {
    // Not JSON (or cut off at 400 characters): fall through to the raw text.
  }
  return text.trim()
}

async function send(info: ProviderInfo, model: string, route: Route, url: string, auth: Record<string, string>, body: unknown, stop?: AbortSignal): Promise<Response> {
  const shared = route.kind === 'shared'
  const where = shared ? 'the shared-key service' : info.host
  let res: Response
  try {
    res = await fetch(shared ? SHARED_ENDPOINT : url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(shared ? { provider: info.id, model, body } : body),
      signal: requestSignal(REQUEST_TIMEOUT_MS, stop),
    })
  } catch (err) {
    if (stop?.aborted) throw abortError()
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
    // The provider's words go to the user as they are: they say best what is wrong with the key.
    const said = providerMessage(text)
    const detail = said ? `: ${said.replace(/\.?$/, '.')}` : '.'
    // Gemini reports a bad key as 400 "API key not valid".
    if (res.status === 401 || res.status === 403 || (res.status === 400 && /api.key/i.test(text))) throw new KeyError(`${info.name} rejected your API key (${res.status})${detail}`, 'rejected')
    if (res.status === 429) {
      // Daily quotas don't reset within a minute, so waiting won't help.
      if (/per day|daily|quota exceeded/i.test(text) && !/per minute/i.test(text)) throw new KeyError(`${info.name} daily limit reached for your API key (429)${detail}`, 'rejected')
      throw new KeyError(`${info.name} rate limit reached for your API key (429)${detail}`, 'rate-limited', retryDelayMs(res, text))
    }
    if (res.status === 404) throw new KeyError(`${info.name} doesn't offer ${model} to your API key (404)${detail}`, 'rejected')
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
