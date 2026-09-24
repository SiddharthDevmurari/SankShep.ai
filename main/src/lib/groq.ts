/**
 * This deployment's own Groq keys, used when a user leaves the Groq key field
 * empty. Reads VITE_GROQ_KEY_1 … VITE_GROQ_KEY_5 (plus VITE_GROQ_API_KEY) and
 * rotates through them per request to spread rate-limit load. Requests
 * themselves go through lib/providers.ts.
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

export function nextWorkspaceGroqKey(): string | null {
  if (KEYS.length === 0) return null
  const key = KEYS[_reqCount % KEYS.length]
  _reqCount++
  return key
}

export const hasGroqKey = KEYS.length > 0
