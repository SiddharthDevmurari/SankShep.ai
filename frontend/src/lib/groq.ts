/**
 * AI chat client with round-robin key rotation.
 * Reads keys from VITE_GROQ_KEY_1 … VITE_GROQ_KEY_5 (Groq gsk_ keys).
 * Cycles through keys on every request to distribute rate-limit load.
 */

const KEYS: string[] = (() => {
  const keys: string[] = []
  for (let i = 1; i <= 5; i++) {
    const k = (import.meta.env as Record<string, string>)[`VITE_GROQ_KEY_${i}`]
    if (k && k.trim()) keys.push(k.trim())
  }
  const fallback = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim()
  if (fallback && !keys.includes(fallback)) keys.push(fallback)
  return keys
})()

let _reqCount = 0

function nextKey(): string | null {
  if (KEYS.length === 0) return null
  const key = KEYS[_reqCount % KEYS.length]
  _reqCount++
  return key
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GroqResponse {
  content: string
  model: string
  usage: { prompt_tokens: number; completion_tokens: number }
}

// Groq endpoint — keys are gsk_... format
const API_BASE = 'https://api.groq.com/openai/v1/chat/completions'

// Model chain: tried in order; skips to next only on model-specific 404/400.
const MODEL_CHAIN = [
  'qwen/qwen3.8-27b',         // user-specified primary
  'openai/gpt-oss-20b',       // user-specified fallback 1
  'openai/gpt-oss-120b',      // user-specified fallback 2
  'llama-3.3-70b-versatile',  // Groq stable fallback
  'llama-3.1-8b-instant',     // Groq lightweight fallback
  'gemma2-9b-it',             // last resort
]

/** Only skip to next model for actual "model not found / deprecated" errors. */
function isModelUnavailable(status: number, body: string): boolean {
  if (status !== 400 && status !== 404) return false
  const b = body.toLowerCase()
  return (
    b.includes('model') &&
    (b.includes('not found') ||
      b.includes('does not exist') ||
      b.includes('deprecated') ||
      b.includes('invalid model') ||
      b.includes('no such model') ||
      status === 404)
  )
}

export async function groqChat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<GroqResponse> {
  const key = nextKey()
  if (!key) {
    throw new Error(
      'No API key found. Add VITE_GROQ_KEY_1=gsk_... to frontend/.env.local and restart the dev server.',
    )
  }

  let lastErr = ''
  for (const model of MODEL_CHAIN) {
    let res: Response
    try {
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: opts.maxTokens ?? 2048,
          temperature: opts.temperature ?? 0.7,
        }),
      })
    } catch (networkErr) {
      throw new Error(`Network error reaching Groq: ${networkErr}`)
    }

    const body = await res.text()

    if (res.ok) {
      const data = JSON.parse(body)
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
      }
    }

    // Auth errors (401/403) — wrong key, revoked, etc. Fail immediately.
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Groq auth error ${res.status}: ${body}\n\n` +
        `Check that VITE_GROQ_KEY_1 in frontend/.env.local is a valid gsk_... Groq key ` +
        `and that you restarted the dev server after editing .env.local.`,
      )
    }

    // Rate-limit — fail immediately with helpful message
    if (res.status === 429) {
      throw new Error(`Groq rate limit hit: ${body}`)
    }

    // Model unavailable — try next in chain
    if (isModelUnavailable(res.status, body)) {
      lastErr = `"${model}" → ${res.status}: ${body.slice(0, 120)}`
      continue
    }

    // Anything else is an unexpected error
    throw new Error(`Groq API ${res.status}: ${body}`)
  }

  throw new Error(`All models in chain failed.\n\nLast: ${lastErr}`)
}

export const hasGroqKey = KEYS.length > 0
