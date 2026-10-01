// Site language for the public pages (landing, features, how it works, about, contact, legal, login).
// The workspace stays in English, so its feature names ("Private mode", "History") are kept in Latin in the Hindi copy.
import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'hi'

const STORAGE_KEY = 'sankshep.lang'

function readStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)
  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private windows can block storage; the switch still works for this visit.
    }
  }
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

/**
 * This page's copy in the current language. Declare `const hi: typeof en = {...}`
 * so TypeScript flags any string the Hindi copy is missing.
 */
export function useCopy<T>(copy: { en: T; hi: T }): T {
  return copy[useLang().lang]
}
