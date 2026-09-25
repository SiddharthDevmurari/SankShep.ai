/**
 * Server side of the shared-key fallback. The browser sends a provider request
 * body here when the user has no key of their own (or theirs failed); this
 * forwards it with one of the deployment's keys, moving to the next key when
 * one is rejected or rate-limited. Keys come from environment variables and
 * never reach the browser.
 *
 * Vercel serves this file as POST /api/chat; vite.config.ts mounts proxyChat on the
 * same path for `npm run dev`. Self-contained on purpose: no relative imports to resolve
 * differently between Vercel's ESM runtime and Vite.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'

export type ProviderId = 'groq' | 'gemini' | 'mistral'

export interface ProxyRequest {
  provider: ProviderId
  model: string
  body: unknown
}

export interface ProxyResponse {
  status: number
  headers: Record<string, string>
  body: string
}

type Env = Record<string, string | undefined>

/** Comma- or newline-separated keys: GROQ_API_KEYS, GEMINI_API_KEYS, MISTRAL_API_KEYS. */
function listKeys(value: string | undefined) {
  return (value ?? '').split(/[\s,]+/).map((k) => k.trim()).filter(Boolean)
}

export function systemKeys(provider: ProviderId, env: Env): string[] {
  const keys = listKeys(env[`${provider.toUpperCase()}_API_KEYS`])
  if (provider === 'groq') {
    // Keys the app used to read in the browser; still honoured, now server-side only.
    for (const name of ['VITE_GROQ_KEY_1', 'VITE_GROQ_KEY_2', 'VITE_GROQ_KEY_3', 'VITE_GROQ_KEY_4', 'VITE_GROQ_KEY_5', 'VITE_GROQ_API_KEY']) {
      keys.push(...listKeys(env[name]))
    }
  }
  return [...new Set(keys)]
}

/** Keys a provider rejected (invalid, or out of daily quota); skipped while this server instance lives. */
const deadKeys = new Set<string>()

const MODEL_ID = /^[\w.\-/:]{1,100}$/
const PROVIDERS: ProviderId[] = ['groq', 'gemini', 'mistral']
const NAMES: Record<ProviderId, string> = { groq: 'Groq', gemini: 'Gemini', mistral: 'Mistral' }

function json(status: number, payload: unknown, headers: Record<string, string> = {}): ProxyResponse {
  return { status, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(payload) }
}

function upstream(provider: ProviderId, model: string, key: string): { url: string; headers: Record<string, string> } {
  if (provider === 'gemini') {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      headers: { 'x-goog-api-key': key },
    }
  }
  return {
    url: provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.mistral.ai/v1/chat/completions',
    headers: { Authorization: `Bearer ${key}` },
  }
}

/** How long a 429 asks us to wait: Retry-After, or Groq's "try again in 6.3s" / Gemini's "retry in 12s". */
function retryAfterMs(res: Response, text: string) {
  const header = Number(res.headers.get('retry-after'))
  if (header > 0) return header * 1000
  const groq = /try again in (?:(\d+)m)?([\d.]+)(ms|s)/i.exec(text)
  if (groq) return (Number(groq[1] ?? 0) * 60 + Number(groq[2]) / (groq[3] === 'ms' ? 1000 : 1)) * 1000
  const gemini = /retry in ([\d.]+)s/i.exec(text)
  return gemini ? Number(gemini[1]) * 1000 : 10_000
}

/** proxyChat that never throws: an unexpected error becomes a 500 instead of crashing the server. */
export async function safeProxyChat(req: ProxyRequest, env: Env): Promise<ProxyResponse> {
  try {
    return await proxyChat(req, env)
  } catch (err) {
    console.error('[api/chat]', err)
    return json(500, { error: { message: 'The shared-key service hit an unexpected error.' } })
  }
}

async function proxyChat(req: ProxyRequest, env: Env): Promise<ProxyResponse> {
  if (!req || !PROVIDERS.includes(req.provider) || typeof req.model !== 'string' || !MODEL_ID.test(req.model) || typeof req.body !== 'object' || !req.body) {
    return json(400, { error: { message: 'Bad request.' } })
  }
  const name = NAMES[req.provider]
  const keys = systemKeys(req.provider, env).filter((k) => !deadKeys.has(k))
  if (keys.length === 0) {
    return json(503, { code: 'keys_exhausted', error: { message: `No shared ${name} keys are available.` } })
  }

  let shortestWait = Infinity
  let lastStatus = 0
  let lastDetail = ''
  let modelMissing = false
  for (const key of keys) {
    const { url, headers } = upstream(req.provider, req.model, key)
    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(55_000),
      })
    } catch {
      continue // Unreachable or timed out with this key; the next may get through.
    }
    const text = await res.text()
    if (res.ok) return { status: res.status, headers: { 'Content-Type': 'application/json' }, body: text }

    lastStatus = res.status
    // Provider error bodies describe the failure, not the key, so they are safe to pass on for diagnosis.
    lastDetail = text.slice(0, 300)
    // A 403 can also mean "this model isn't on your plan" (Mistral); that says nothing about the key.
    const modelBlocked = (res.status === 403 || res.status === 400) && /model[^"]*not (available|found|supported)|not available/i.test(text)
    const invalid = !modelBlocked && (res.status === 401 || res.status === 403 || (res.status === 400 && /api.key/i.test(text)))
    const daily = res.status === 429 && /per day|daily|quota exceeded/i.test(text) && !/per minute/i.test(text)
    if (invalid || daily) {
      deadKeys.add(key)
      continue
    }
    if (res.status === 429) {
      shortestWait = Math.min(shortestWait, retryAfterMs(res, text))
      continue
    }
    if (res.status === 404 || modelBlocked) {
      modelMissing = true
      continue // This key's account may not offer the model; another might.
    }
    // Anything else is about the request itself (too long, malformed); another key won't change it.
    return { status: res.status, headers: { 'Content-Type': 'application/json' }, body: text }
  }

  if (shortestWait !== Infinity) {
    const seconds = Math.ceil(shortestWait / 1000)
    return json(429, { error: { message: `${name} shared keys are rate-limited. Please try again in ${seconds}s.`, detail: lastDetail } }, { 'Retry-After': String(seconds) })
  }
  if (lastStatus === 0) return json(502, { error: { message: `Couldn't reach ${name}.` } })
  // No key could use the model (retired, or not on the plan): the model is the problem, not the keys.
  if (modelMissing) return json(404, { error: { message: `${name} doesn't offer ${req.model} to the shared keys.`, detail: lastDetail } })
  return json(503, { code: 'keys_exhausted', error: { message: `The shared ${name} keys were rejected (${lastStatus}).`, detail: lastDetail } })
}

/** Vercel Node function: POST /api/chat. Vercel parses the JSON body into req.body. */
export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  const reply = req.method === 'POST'
    ? await safeProxyChat(req.body as ProxyRequest, process.env)
    : json(405, { error: { message: 'Use POST.' } })
  res.statusCode = reply.status
  for (const [name, value] of Object.entries(reply.headers)) res.setHeader(name, value)
  res.end(reply.body)
}
