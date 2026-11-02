// Site language for the public pages (landing, features, how it works, about, contact, legal, login).
// The workspace stays in English, so its feature names ("Private mode", "History") are kept in Latin in the translations.
//
// English and Hindi live next to each page's code. The other eleven languages are in locales/<code>/, one file per
// page, and each language is downloaded only when someone picks it.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { LANGUAGES, isRtl, type Lang } from './lib/languages'

export { LANGUAGES, isRtl, type Lang }

/** One name per block of page copy; a locale file fills the same name. */
export type CopyKey =
  | 'chrome' | 'install' | 'demo' | 'landing' | 'features' | 'how'
  | 'about' | 'contact' | 'login' | 'legal' | 'privacy' | 'terms'

export interface Copy<T> {
  key: CopyKey
  en: T
  hi: T
}

/**
 * A page's copy. Declare `const hi: typeof en = {...}` so TypeScript flags any string the Hindi copy
 * is missing; the locale files are typed the same way against `en`.
 */
export const defineCopy = <T,>(key: CopyKey, copy: { en: T; hi: T }): Copy<T> => ({ key, ...copy })

type Pack = Partial<Record<CopyKey, unknown>>

// One chunk per language, fetched on demand.
const PACKS = import.meta.glob<{ default: Pack }>('./locales/*/index.ts')
const packLoader = (lang: Lang) => PACKS[`./locales/${lang}/index.ts`]
const needsPack = (lang: Lang) => lang !== 'en' && lang !== 'hi'

const STORAGE_KEY = 'sankshep.lang'
const CODES: readonly string[] = LANGUAGES.map((l) => l.code)

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && CODES.includes(stored) ? (stored as Lang) : 'en'
  } catch {
    return 'en'
  }
}

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
  /** The language being fetched, while its file downloads. */
  loading: Lang | null
  pack: Pack | null
}

const LangContext = createContext<LangState>({ lang: 'en', setLang: () => {}, loading: null, pack: null })

export function LangProvider({ children }: { children: ReactNode }) {
  const [wanted] = useState(readStoredLang)
  // Until a language's file has arrived the site stays in the current language, so nothing flashes half-translated.
  const [lang, setLangState] = useState<Lang>(needsPack(wanted) ? 'en' : wanted)
  const [packs, setPacks] = useState<Partial<Record<Lang, Pack>>>({})
  const [loading, setLoading] = useState<Lang | null>(null)
  // The language asked for last, so a slow download can't override a newer choice.
  const latest = useRef<Lang>(lang)

  const setLang = (next: Lang) => {
    latest.current = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private windows can block storage; the switch still works for this visit.
    }
    const load = packLoader(next)
    if (!needsPack(next) || packs[next] || !load) {
      setLoading(null)
      setLangState(next)
      return
    }
    setLoading(next)
    load()
      .then((m) => {
        setPacks((p) => ({ ...p, [next]: m.default }))
        if (latest.current !== next) return
        setLangState(next)
        setLoading(null)
      })
      .catch(() => {
        // Offline or a failed download: stay in the current language.
        if (latest.current === next) setLoading(null)
      })
  }

  // A language saved from an earlier visit is fetched once on load.
  useEffect(() => {
    if (needsPack(wanted)) setLang(wanted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LangContext.Provider value={{ lang, setLang, loading, pack: packs[lang] ?? null }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)

/** This page's copy in the current language, falling back to English for anything not translated. */
export function useCopy<T>(copy: Copy<T>): T {
  const { lang, pack } = useContext(LangContext)
  if (lang === 'hi') return copy.hi
  if (lang === 'en' || !pack) return copy.en
  return (pack[copy.key] as T | undefined) ?? copy.en
}

/** `lang` and `dir` for a page wrapper: Urdu pages read right to left. */
export function usePageLang() {
  const { lang } = useLang()
  return { lang, dir: isRtl(lang) ? ('rtl' as const) : ('ltr' as const) }
}
