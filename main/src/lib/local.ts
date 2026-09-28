/**
 * The on-device engine: Ollama running on the user's own machine at localhost:11434.
 *
 * Requests go straight from the browser to it. Nothing passes through Sankshep's server or any
 * provider, and the source reaches the model as extracted text only (images are read by
 * on-device OCR first, see lib/ingest.ts), which keeps each request small and fast.
 */

import { abortError, timeoutSignal } from './providers'

export const OLLAMA_URL = 'http://localhost:11434'
export const PREFERRED_LOCAL_MODEL = 'qwen2.5vl:7b'

/**
 * Tokens per request, prompt and draft together. A 7B model's KV cache at 4,096 tokens fits beside
 * its weights on an 8 GB GPU; Ollama's larger defaults on newer releases can run such cards out of memory.
 */
export const LOCAL_NUM_CTX = 4096
/** Low, so a 7B model stays close to the source. Lower values asked for by a caller (translation) still apply. */
export const LOCAL_TEMPERATURE = 0.3
/**
 * Characters of source per draft: leaves the prompt around 2,000 tokens, so a draft still gets
 * about 1,500 tokens of the window.
 */
export const LOCAL_SOURCE_CHARS = 6_000
/** A draft shorter than this isn't worth writing: the prompt left the window too little room. */
const MIN_PREDICT = 384

/* ─── Detection ─────────────────────────────────────────────────────────── */

export type LocalStatus =
  | { state: 'checking' }
  /** `models`: every installed Qwen 2.5 variant, the preferred one first. */
  | { state: 'ready'; models: string[] }
  | { state: 'missing-model'; installed: string[] }
  /** Ollama answers, but refuses this page's origin (OLLAMA_ORIGINS doesn't list it). */
  | { state: 'blocked' }
  | { state: 'offline' }

const DETECT_TIMEOUT_MS = 4_000

/** Qwen 2.5 variants, best first: the exact preferred tag, other Qwen 2.5 VL tags, then any Qwen 2.5. */
function qwenModels(names: string[]): string[] {
  const rank = (name: string) => (name === PREFERRED_LOCAL_MODEL ? 0 : /^qwen2\.5vl/i.test(name) ? 1 : 2)
  return names.filter((n) => /^qwen2\.5/i.test(n)).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

/**
 * Asks Ollama which models it has. A failed request is either Ollama not running or Ollama refusing
 * this origin; a second, no-cors request tells them apart, since it succeeds (with an unreadable
 * answer) whenever something is listening.
 */
export async function detectOllama(): Promise<LocalStatus> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: timeoutSignal(DETECT_TIMEOUT_MS) })
    if (!res.ok) return { state: 'offline' }
    const data = await res.json()
    const installed: string[] = (data?.models ?? []).map((m: { name?: string; model?: string }) => m.name ?? m.model ?? '').filter(Boolean)
    const models = qwenModels(installed)
    return models.length ? { state: 'ready', models } : { state: 'missing-model', installed }
  } catch {
    try {
      await fetch(`${OLLAMA_URL}/api/tags`, { mode: 'no-cors', signal: timeoutSignal(DETECT_TIMEOUT_MS) })
      return { state: 'blocked' }
    } catch {
      return { state: 'offline' }
    }
  }
}

/* ─── Generation ────────────────────────────────────────────────────────── */

export interface LocalRequest {
  system: string
  prompt: string
  maxTokens: number
  temperature: number
  signal?: AbortSignal
  /** Called with the whole text so far as it streams in, at most every STREAM_INTERVAL_MS. */
  onText?: (text: string) => void
}

/** The first token waits for the model to load from disk; after that a pause this long means Ollama is stuck. */
const FIRST_TOKEN_TIMEOUT_MS = 180_000
const STALL_TIMEOUT_MS = 60_000
/** Streamed text reaches the canvas at most this often, so a fast GPU doesn't re-render it on every token. */
const STREAM_INTERVAL_MS = 50

/**
 * A rough upper bound on tokens: English runs about four characters a token, while Indic scripts
 * can take a token for every character or two, so those count one each.
 */
function estimateTokens(text: string) {
  let ascii = 0
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) < 128) ascii++
  return Math.ceil(ascii / 3.5) + (text.length - ascii)
}

/**
 * Streams one completion from Ollama's /api/generate. The draft's length is capped so prompt and
 * draft together never pass LOCAL_NUM_CTX: past it Ollama would silently drop the start of the prompt.
 * Aborting `signal` stops the stream at once (Ollama stops generating when the connection closes)
 * and rejects with the abort error.
 */
export async function localGenerate(model: string, req: LocalRequest): Promise<{ content: string; model: string; truncated: boolean }> {
  const room = LOCAL_NUM_CTX - estimateTokens(req.system) - estimateTokens(req.prompt) - 48
  if (room < MIN_PREDICT) {
    throw new Error('This request is too long for the on-device engine’s 4,096-token window. Shorten the source or the draft being refined.')
  }
  const numPredict = Math.min(req.maxTokens, room)

  // Our own controller: the user's stop and the stall watchdog both end the request through it.
  const controller = new AbortController()
  const onStop = () => controller.abort()
  if (req.signal?.aborted) throw abortError()
  req.signal?.addEventListener('abort', onStop, { once: true })
  let stalled = false
  let watchdog: ReturnType<typeof setTimeout> | undefined
  const arm = (ms: number) => {
    clearTimeout(watchdog)
    watchdog = setTimeout(() => { stalled = true; controller.abort() }, ms)
  }

  const fail = (err: unknown): never => {
    if (req.signal?.aborted) throw abortError()
    if (stalled) throw new Error(`${model} stopped responding. Check that Ollama is still running, then generate again.`)
    throw err
  }

  try {
    arm(FIRST_TOKEN_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          system: req.system,
          prompt: req.prompt,
          stream: true,
          options: {
            num_ctx: LOCAL_NUM_CTX,
            num_predict: numPredict,
            temperature: Math.min(req.temperature, LOCAL_TEMPERATURE),
          },
        }),
        signal: controller.signal,
      })
    } catch (err) {
      return fail(err instanceof TypeError ? new Error(`Couldn’t reach Ollama at ${OLLAMA_URL.replace('http://', '')}. Check that it’s still running, then generate again.`) : err)
    }
    if (!res.ok || !res.body) throw new Error(ollamaError(res.status, await res.text().catch(() => ''), model))

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let text = ''
    let doneReason: string | undefined
    let lastEmit = 0

    const take = (line: string) => {
      if (!line.trim()) return
      let data: { response?: string; done?: boolean; done_reason?: string; error?: string }
      try {
        data = JSON.parse(line)
      } catch {
        return // Not a whole JSON line; Ollama always ends each with a newline, so this is noise.
      }
      if (data.error) throw new Error(ollamaError(500, JSON.stringify(data), model))
      text += data.response ?? ''
      if (data.done) doneReason = data.done_reason
    }

    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        arm(STALL_TIMEOUT_MS)
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        lines.forEach(take)
        const now = Date.now()
        if (req.onText && text && now - lastEmit >= STREAM_INTERVAL_MS) {
          lastEmit = now
          req.onText(text)
        }
      }
      take(buffer + decoder.decode())
    } catch (err) {
      return fail(err)
    }

    if (!text.trim()) throw new Error(`${model} returned an empty draft. Generate again.`)
    return { content: text, model, truncated: doneReason === 'length' }
  } finally {
    clearTimeout(watchdog)
    req.signal?.removeEventListener('abort', onStop)
  }
}

/** Ollama's error, in words a user can act on. */
function ollamaError(status: number, body: string, model: string): string {
  let said = body.trim()
  try {
    said = JSON.parse(body)?.error ?? said
  } catch {
    // Plain text: use it as it is.
  }
  if (status === 404 || /not found|pull/i.test(said)) return `${model} isn’t installed in Ollama. Run “ollama pull ${model}” in a terminal, then generate again.`
  if (/memory|cuda|cudaMalloc|metal|allocate/i.test(said)) {
    return `Your machine ran out of memory loading ${model}. Close other apps that use the GPU (games, video editors, other models) and generate again.`
  }
  return `Ollama returned an error (${status})${said ? `: ${said.slice(0, 300)}` : '.'}`
}
