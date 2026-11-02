# 13-language feature: implementation guide for Claude

This guide was written by the Claude session that built this feature in the **SFIC copy** of Sankshep.ai
(`C:\Users\Siddharth Devmurari\OneDrive\Documents\Main Project 2`, commit `6f5df3c` "13 language feature is added").
Your job is to add the same feature to the **SIH project**. Everything below has already been built, debugged and
tested once; follow it instead of re-researching. Verify file names in your project before editing, because the SIH
copy may differ a little from the SFIC copy.

**Do not modify anything in the SFIC folder.** You may read from it (and copy translation files out of it, see Step 9).

---

## 1. What the feature is

1. **Workspace translation into 13 languages.** The "Language Translation" output format offers English plus India's
   12 most-spoken scheduled languages (Census 2011 order): Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu,
   Kannada, Odia, Malayalam, Punjabi, Assamese. Before this it offered 6 (Hindi, Gujarati, Marathi, Bengali, Telugu, Tamil).
2. **The whole public website in 13 languages.** The EN / हिं switch in the top bar becomes a language menu with all 13.
   Every public page (landing, features, how it works, about, contact, login, privacy, terms, plus the site nav/footer,
   the install-app prompt and the landing demo captions) is translated. Urdu pages read right to left.
3. The **workspace UI itself stays in English** (it already did when Hindi was chosen). Only the public pages translate.

Language codes used everywhere: `en hi bn mr te ta gu ur kn or ml pa as`.

---

## 2. Decisions already made (do not revisit)

| Decision | Why |
|---|---|
| English and Hindi stay hand-written next to each page's code; the 11 new languages live in `src/locales/<code>/<page>.tsx` | Keeps existing code untouched; the new files are data |
| Each new language is **lazy-loaded** (one chunk per language via `import.meta.glob`) | Each language is ~100 KB (~25 KB gzipped). Bundling all 11 would add ~1.2 MB for everyone |
| Locale files are typed `const t: typeof X_COPY.en = {...}` | `tsc` then flags any missing or mistyped string |
| Language menu is a **native `<select>`** laid invisibly over a styled face | Keyboard, screen readers and phone pickers work with no extra code |
| Urdu gets `dir="rtl"` on the **page wrapper only**, never on `<html>` | The workspace and the landing demo mockup must stay LTR |
| **Do not** set `document.documentElement.lang` to the site language | It made the English workspace inherit Indian-script CSS rules (bug found and fixed) |
| Fonts: Google Noto faces per script (Bengali covers Assamese; Urdu uses **Noto Naskh Arabic**, not Nastaliq) | Nastaliq is too tall for the tight display headings and clips |
| Translations made with **Gemini `gemini-3.5-flash`** by a script, then checked | See the model notes in Section 6 |

---

## 3. Find the equivalents in your project first

Run these and note the results; the steps below name the SFIC file paths.

```bash
cd main   # the app folder
grep -rn "useCopy\|const hi: typeof en\|{ en, hi }" src --include=*.ts --include=*.tsx | grep -v i18n.tsx
grep -n "LANGUAGES\|'Hindi', 'Gujarati'" src/workspace/LeftPanel.tsx
grep -rn "Language Translation" src/lib/pipeline.ts | head
grep -n "font-family\|Noto" src/index.css | head
grep -rn -i "six indian\|Gujarati, Marathi\|English or Hindi\|छह भारतीय" src README.md ../README.md 2>/dev/null
```

In SFIC the copy blocks were (key: file, exported name):

| key | file | name |
|---|---|---|
| chrome | `src/components/site/SiteChrome.tsx` | `CHROME_COPY` |
| install | `src/components/InstallApp.tsx` | `INSTALL_COPY` |
| demo | `src/components/demo/copy.ts` | `DEMO_COPY` |
| landing | `src/pages/landingCopy.ts` | `LANDING_COPY` |
| features | `src/pages/featuresCopy.ts` | `FEATURES_COPY` |
| how | `src/pages/howItWorksCopy.tsx` | `HOW_COPY` |
| about | `src/pages/AboutPage.tsx` | `ABOUT_COPY` |
| contact | `src/pages/ContactPage.tsx` | `CONTACT_COPY` |
| login | `src/pages/LoginPage.tsx` | `LOGIN_COPY` |
| legal | `src/pages/legal/LegalLayout.tsx` | `LEGAL_COPY` |
| privacy | `src/pages/legal/PrivacyPolicyPage.tsx` | `PRIVACY_COPY` |
| terms | `src/pages/legal/TermsPage.tsx` | `TERMS_COPY` |

If the SIH project has an extra page with `{ en, hi }` copy (for example a YouTube or SIH/NTRO section), give it its own
key and treat it exactly like the others.

---

## 4. Implementation steps

### Step 1: shared language list, `src/lib/languages.ts` (new)

```ts
// English plus India's 12 most-spoken scheduled languages (Census 2011 order).
// Shared by the site's language menu and the workspace's translation target.
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
] as const

export type Lang = (typeof LANGUAGES)[number]['code']

/** Urdu is written right to left. */
export const isRtl = (lang: Lang) => lang === 'ur'
```

### Step 2: replace `src/i18n.tsx` (full file)

```tsx
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
```

Add any extra SIH page key to `CopyKey`.

### Step 3: give every copy block a name

Everywhere a page has `const en = {...}` and `const hi: typeof en = {...}`:

- Files that exported `{ en, hi }` (e.g. `export const FEATURES_COPY = { en, hi }`) become
  `export const FEATURES_COPY = defineCopy('features', { en, hi })`.
- Files that called `useCopy({ en, hi })` inline get, right after the `hi` block,
  `export const ABOUT_COPY = defineCopy('about', { en, hi })`, and every `useCopy({ en, hi })` becomes `useCopy(ABOUT_COPY)`.
- Add `defineCopy` to the file's import from `i18n`.

Exporting a constant from a component file disables React Fast Refresh for that file (full reload in dev). That is fine.

### Step 4: the language menu (in `SiteChrome.tsx`, replacing the old EN/हिं `LangToggle`)

Imports: `ChevronDown, Globe` from `lucide-react`; `LANGUAGES, usePageLang, type Lang` from `../../i18n`.

```tsx
/**
 * The site language, as the browser's own dropdown: keyboard, screen readers and phone pickers work as is.
 * The select sits invisibly over a compact face (globe + the language's own name; just the code on phones),
 * so the capsule still fits a narrow screen. Each option is written in its own script.
 */
function LangMenu() {
  const { lang, setLang, loading } = useLang()
  const shown = LANGUAGES.find((l) => l.code === (loading ?? lang)) ?? LANGUAGES[0]
  return (
    <div
      className="relative flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-paper-deep pe-2.5 ps-3 text-ink transition-colors hover:bg-hair focus-within:ring-2 focus-within:ring-ink/30 sm:h-10"
      aria-busy={loading !== null}
    >
      <Globe aria-hidden className={`h-4 w-4 shrink-0 text-ink-soft ${loading ? 'animate-pulse' : ''}`} />
      <span aria-hidden className="text-[13.5px] font-semibold uppercase sm:hidden">{shown.code}</span>
      <span aria-hidden lang={shown.code} className="hidden text-[13.5px] font-semibold sm:inline">{shown.native}</span>
      <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink-mute" />
      <select
        value={shown.code}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label="Language / भाषा"
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.code === 'en' ? l.native : `${l.native} (${l.name})`}
          </option>
        ))}
      </select>
    </div>
  )
}
```

Render `<LangMenu />` where `<LangToggle />` was. Also in the same nav, the **"Open Workspace" button** overflowed phones in
Malayalam/Tamil. Final version:

```tsx
<Link
  to="/workspace"
  title={t.openWorkspace}
  className="ms-1 flex min-w-0 max-w-[10.5rem] items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3.5 py-2.5 text-[14px] font-medium text-paper sm:max-w-none sm:px-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
>
  {/* Some languages run long: on phones the arrow goes and the label ends in "…" rather than widen the page. */}
  <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 sm:block" />
  <span className="min-w-0 truncate">{t.openWorkspace}</span>
</Link>
```

Give the site's own `ArrowRight` SVG (in `SiteChrome.tsx` and the local copy in `LandingPage.tsx`) the class `sk-arrow`
(`className={\`sk-arrow ${className ?? ''}\`}`) so RTL can mirror it (Step 6).

### Step 5: page wrappers get `lang` and `dir`

- `SitePage` in `SiteChrome.tsx`: `const { lang, dir } = usePageLang()` and `<div lang={lang} dir={dir} className="min-h-screen bg-paper">`.
- `LandingPage` default export: same change on its wrapper div (import `usePageLang` instead of `useLang`).
- `LoginPage`: `const { lang, dir } = usePageLang()` and `<main lang={lang} dir={dir} ...>`.
- Landing demo stage in `components/demo/WorkspaceDemo.tsx`: next to `lang="en"` add `dir="ltr"` (the mockup must never mirror).

### Step 6: fonts and script CSS in `src/index.css`

Extend the Google Fonts `@import` (keep the existing families; append):

```
&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Oriya:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Sans+Gurmukhi:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700&family=Noto+Serif+Telugu:wght@400;600;700&family=Noto+Serif+Tamil:wght@400;600;700&family=Noto+Serif+Gujarati:wght@400;600;700&family=Noto+Serif+Kannada:wght@400;600;700&family=Noto+Serif+Oriya:wght@400;600;700&family=Noto+Serif+Malayalam:wght@400;600;700&family=Noto+Serif+Gurmukhi:wght@400;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700
```

Font stacks (after the Latin font and Devanagari Noto):

```css
--font-display: 'Newsreader', 'Noto Serif Devanagari', 'Noto Serif Bengali', 'Noto Serif Telugu', 'Noto Serif Tamil', 'Noto Serif Gujarati', 'Noto Serif Kannada', 'Noto Serif Oriya', 'Noto Serif Malayalam', 'Noto Serif Gurmukhi', 'Noto Naskh Arabic', ui-serif, Georgia, serif;
--font-serif: 'Instrument Serif', 'Noto Serif Devanagari', 'Noto Serif Bengali', 'Noto Serif Telugu', 'Noto Serif Tamil', 'Noto Serif Gujarati', 'Noto Serif Kannada', 'Noto Serif Oriya', 'Noto Serif Malayalam', 'Noto Serif Gurmukhi', 'Noto Naskh Arabic', ui-serif, Georgia, serif;
--font-sans: 'Inter', 'Noto Sans Devanagari', 'Noto Sans Bengali', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Noto Sans Gujarati', 'Noto Sans Kannada', 'Noto Sans Oriya', 'Noto Sans Malayalam', 'Noto Sans Gurmukhi', 'Noto Naskh Arabic', ui-sans-serif, system-ui, sans-serif;
```

Replace the old `[lang='hi'] ...` rules with:

```css
/* Indian-language pages: vowel signs sit above and below the line, so the tight display leading clips them;
   letter-spacing pulls joined letters apart; and these scripts have no italic, so the serif accent stays upright. */
:is([lang='hi'], [lang='bn'], [lang='mr'], [lang='te'], [lang='ta'], [lang='gu'], [lang='ur'], [lang='kn'], [lang='or'], [lang='ml'], [lang='pa'], [lang='as']) :is(.font-display, .font-headline) {
  line-height: 1.22;
  letter-spacing: 0;
}
:is([lang='hi'], [lang='bn'], [lang='mr'], [lang='te'], [lang='ta'], [lang='gu'], [lang='ur'], [lang='kn'], [lang='or'], [lang='ml'], [lang='pa'], [lang='as']) .font-serif {
  font-style: normal;
  letter-spacing: 0;
}
:is([lang='hi'], [lang='bn'], [lang='mr'], [lang='te'], [lang='ta'], [lang='gu'], [lang='ur'], [lang='kn'], [lang='or'], [lang='ml'], [lang='pa'], [lang='as']) [class*='tracking-'] {
  letter-spacing: 0;
}
/* Words in these languages can run long (one Malayalam word can be wider than a phone): break inside a word
   only when it would not fit otherwise. Hindi and English keep the browser's normal wrapping. */
:is([lang='bn'], [lang='mr'], [lang='te'], [lang='ta'], [lang='gu'], [lang='ur'], [lang='kn'], [lang='or'], [lang='ml'], [lang='pa'], [lang='as']) {
  overflow-wrap: anywhere;
}
/* Right-to-left pages (Urdu): arrows point the way the reader moves. The workspace mockup stays left to right. */
[dir='rtl'] :is(.sk-arrow, .lucide-arrow-right, .lucide-arrow-up-right, .lucide-chevron-right, .lucide-arrow-left):not([dir='ltr'] *) {
  transform: scaleX(-1);
}
/* Urdu (Naskh) needs a little more room between lines than Latin text. */
[lang='ur'] :is(.font-display, .font-headline) {
  line-height: 1.4;
}
```

The demo's `demo.css` has `.demo-stage[lang='en'] ...` overrides with higher specificity; leave them, they still win.

### Step 7: workspace translation picker (`src/workspace/LeftPanel.tsx`)

- Delete the local `const LANGUAGES = ['Hindi', 'Gujarati', ...]`; `import { LANGUAGES } from '../lib/languages'`.
- In `ALL_FORMATS`, the translation entry's `desc` becomes `'13 languages'` (also in `components/demo/content.ts` `FORMATS`).
- The "Translate into" grid (state stays the English name, e.g. `'Odia'`, which goes into the prompt):

```tsx
{/* The native name sits under each language, so readers of that script spot it at once. */}
<div className="grid grid-cols-3 gap-1.5">
  {LANGUAGES.map((l) => {
    const on = targetLanguage === l.name
    return (
      <button
        key={l.code}
        type="button"
        aria-pressed={on}
        onClick={() => setTargetLanguage(l.name)}
        className={`min-h-11 rounded-lg px-1 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
          on ? 'bg-ink text-paper' : 'bg-paper-deep text-ink-soft hover:text-ink'
        }`}
      >
        <span className="block truncate text-[13px] font-medium leading-tight">{l.name}</span>
        {l.code !== 'en' && (
          <span lang={l.code} className={`mt-0.5 block truncate text-[11.5px] leading-tight ${on ? 'text-paper/75' : 'text-ink-mute'}`}>{l.native}</span>
        )}
      </button>
    )
  })}
</div>
```

### Step 8: translation prompt (`src/lib/pipeline.ts`, the `'Language Translation'` entry of `buildPrompt`)

Add these two requirement lines (the rest of the prompt stays):

```ts
- Keep every number, date, amount and phone number in the same digits as the source (0-9), so helplines and deadlines stay easy to read
...
${targetLanguage === 'English' ? '' : `- Write in the ${targetLanguage ?? 'Hindi'} script, never in Latin letters (Urdu in Nastaliq/Arabic script, Punjabi in Gurmukhi, Odia in Odia script)\n`}- Output only the translation
```

Notes from testing (Groq `openai/gpt-oss-120b`):
- **Do not** add "If a passage is already in <language>, keep it as it is". With that line the model once returned the
  English source untranslated. It was removed.
- Without the digits rule, Odia and Assamese convert 30 to ୩୦ / ৩০, which makes helplines hard to read.

Also in `src/workspace/RichText.tsx`, add `dir="auto"` to the rendered `<p>`, list (`<Tag>`), `<h2>` and `<h3>` so Urdu
drafts read right to left on the canvas.

### Step 9: generate the translations (the expensive part, read all of it)

**First, reuse SFIC's files wherever the English is identical.** The SFIC project already has all 132 files
(12 pages x 11 languages) in `C:\Users\Siddharth Devmurari\OneDrive\Documents\Main Project 2\main\src\locales\`, all
type-checked and cleaned. For each page key, compare the SIH `en` block (plus `SECTIONS_EN` for privacy/terms) with the
SFIC one; if they are byte-identical, copy that page's 11 files (`<code>/<key>.tsx`) instead of translating. If they differ
only in a few strings, copy and hand-edit those strings in each language rather than regenerating. Only translate from
scratch the pages whose English really differs. This saves most of the Gemini quota.

Before copying, check the SFIC import paths still match your project (they are relative to `src/locales/<code>/`).

**Translating the rest: the script.** Save it **outside the repo** (scratchpad) and run from the app folder:
`MODEL=gemini-3.5-flash CONC=4 MAX_REQUESTS=60 node translate.mjs . all <keys,comma>`. It reads `GEMINI_API_KEYS` from
`.env.local`, only translates the copy (not the page's components), skips files that exist unless `--force`, and writes
each language's `index.ts`.

```js
// Translates each page's English copy into the site's other languages with Gemini.
// Usage: node translate.mjs <appRoot> [langs,comma|all] [keys,comma|all] [--force]
import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2]
const onlyLangs = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3].split(',') : null
const onlyKeys = process.argv[4] && process.argv[4] !== 'all' ? process.argv[4].split(',') : null
const force = process.argv.includes('--force')
const MODEL = process.env.MODEL || 'gemini-3.5-flash'
const CONCURRENCY = Number(process.env.CONC || 4)
// Hard cap: the same Gemini keys serve the live site, so never spend the whole daily quota.
let budget = Number(process.env.MAX_REQUESTS || 60)
const PROJECT = process.env.PROJECT || "Sankshep.ai, a student project for India's Smart India Hackathon (SIH)"

const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8')
const keys = (env.match(/^GEMINI_API_KEYS=(.*)$/m)?.[1] ?? '').split(',').map((k) => k.trim()).filter(Boolean)
if (!keys.length) throw new Error('No GEMINI_API_KEYS in .env.local')

const LANGS = {
  bn: ['Bengali', 'বাংলা', 'Bengali script'],
  mr: ['Marathi', 'मराठी', 'Devanagari script'],
  te: ['Telugu', 'తెలుగు', 'Telugu script'],
  ta: ['Tamil', 'தமிழ்', 'Tamil script'],
  gu: ['Gujarati', 'ગુજરાતી', 'Gujarati script'],
  ur: ['Urdu', 'اردو', 'Urdu (Perso-Arabic) script'],
  kn: ['Kannada', 'ಕನ್ನಡ', 'Kannada script'],
  or: ['Odia', 'ଓଡ଼ିଆ', 'Odia script'],
  ml: ['Malayalam', 'മലയാളം', 'Malayalam script'],
  pa: ['Punjabi', 'ਪੰਜਾਬੀ', 'Gurmukhi script'],
  as: ['Assamese', 'অসমীয়া', 'Assamese script (with ৰ and ৱ, not Bengali spellings)'],
}

// key: [file, exported copy name]. Adjust to your project (Section 3).
const SOURCES = {
  chrome: ['src/components/site/SiteChrome.tsx', 'CHROME_COPY'],
  install: ['src/components/InstallApp.tsx', 'INSTALL_COPY'],
  demo: ['src/components/demo/copy.ts', 'DEMO_COPY'],
  landing: ['src/pages/landingCopy.ts', 'LANDING_COPY'],
  features: ['src/pages/featuresCopy.ts', 'FEATURES_COPY'],
  how: ['src/pages/howItWorksCopy.tsx', 'HOW_COPY'],
  about: ['src/pages/AboutPage.tsx', 'ABOUT_COPY'],
  contact: ['src/pages/ContactPage.tsx', 'CONTACT_COPY'],
  login: ['src/pages/LoginPage.tsx', 'LOGIN_COPY'],
  legal: ['src/pages/legal/LegalLayout.tsx', 'LEGAL_COPY'],
  privacy: ['src/pages/legal/PrivacyPolicyPage.tsx', 'PRIVACY_COPY'],
  terms: ['src/pages/legal/TermsPage.tsx', 'TERMS_COPY'],
}

function prompt(code, key) {
  const [file, name] = SOURCES[key]
  const [lang, native, script] = LANGS[code]
  const full = fs.readFileSync(path.join(root, file), 'utf8')
  // Only the copy: everything up to the defineCopy line, so the page's components don't tempt the model to rewrite them.
  const cut = full.indexOf(`export const ${name} = defineCopy(`)
  const src = cut === -1 ? full : full.slice(0, cut) + `export const ${name} = defineCopy('${key}', { en, hi })\n`
  const importPath = path.posix.relative(`src/locales/${code}`, file.replace(/\.tsx?$/, ''))
  return `You are localising a public-service website (${PROJECT}) for ${lang} readers.

Below is the source file \`${file}\`. It has an English copy object \`const en = {...}\` and a Hindi version \`const hi\`, exported together as \`${name}\`. Use the Hindi version as a guide to tone and to which words stay in English.

Write a new TypeScript module, \`src/locales/${code}/${key}.tsx\`, holding the ${lang} (${native}) translation of \`en\`.

Rules for the module:
1. Start with the imports it needs. It must contain exactly: \`import type { ${name} } from '${importPath}'\`. Other imports use paths relative to src/locales/${code}/ (so src/x/y.ts is '../../x/y').
2. Then \`const t: typeof ${name}.en = { ... }\` and finally \`export default t\`.
3. Same structure as \`en\`: the same keys, the same array lengths and order, the same function parameters and return shapes, the same JSX elements and attributes. Translate only the human-readable text: strings, JSX text and the text parts of template literals. Never drop a key.
4. Never change keys, ids, URLs, routes, className values, numbers, \${...} expressions, code identifiers or emails.
5. If \`en\` (or anything it uses, such as SECTIONS_EN) refers to a constant, helper or component from the source file, import it when the source file exports it; otherwise copy its definition into the module, translating any text in it. Do not copy constants that \`en\` does not use (team lists, icons).
6. Keep in Latin letters, as the Hindi version does: Sankshep, Sankshep.ai, product feature names the Hindi keeps in English (Private mode, History, Workspace buttons and the like), brand names (Groq, Gemini, OpenRouter, Ollama, Jina, Supabase, Vercel, GitHub, LinkedIn, PowerPoint, Markdown, PDF, DOCX, API, AI), team codes, people's names and file names.
7. Write natural, plain ${lang} that an ordinary citizen understands, entirely in the ${script}: no words from Hindi, Bengali or any other language or script mixed in. Use digits as written in the English. Never use the em dash character.
8. Output only the module's code. No Markdown fences, no explanation.

SOURCE FILE ${file}:
${src}`
}

let keyIndex = 0
async function gemini(text) {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (budget-- <= 0) throw new Error('MAX_REQUESTS budget used up')
    const key = keys[keyIndex++ % keys.length]
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 65536 },
      }),
      signal: AbortSignal.timeout(240_000),
    }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }))
    if (res.ok) {
      const data = await res.json()
      const c = data.candidates?.[0]
      const out = (c?.content?.parts ?? []).map((p) => p.text ?? '').join('')
      if (c?.finishReason === 'MAX_TOKENS') throw new Error('MAX_TOKENS')
      if (out.trim()) return out
      throw new Error(`empty (${c?.finishReason ?? data.promptFeedback?.blockReason})`)
    }
    // 429 that keeps coming back means the daily quota is gone: stop instead of burning retries.
    if (res.status === 429 && attempt >= 2) throw new Error('429 quota exhausted')
    if ([0, 429, 500, 502, 503, 504].includes(res.status)) {
      await new Promise((r) => setTimeout(r, Math.min(60_000, 4000 * 2 ** attempt)))
      continue
    }
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  throw new Error('gave up after retries')
}

const clean = (code) => code.replace(/^\s*```[a-z]*\s*\n/i, '').replace(/\n```\s*$/, '').trim() + '\n'

const jobs = []
for (const code of Object.keys(LANGS)) {
  if (onlyLangs && !onlyLangs.includes(code)) continue
  for (const key of Object.keys(SOURCES)) {
    if (onlyKeys && !onlyKeys.includes(key)) continue
    const out = path.join(root, 'src/locales', code, `${key}.tsx`)
    if (!force && fs.existsSync(out)) continue
    jobs.push({ code, key, out })
  }
}
console.log(`${jobs.length} jobs with ${MODEL}, ${CONCURRENCY} at a time, budget ${budget} requests`)

let done = 0
const failed = []
async function worker() {
  while (jobs.length) {
    const job = jobs.shift()
    try {
      const code = clean(await gemini(prompt(job.code, job.key)))
      if (!/export default [A-Za-z_]+/.test(code)) throw new Error('no default export in output')
      if (code.includes('\u2014')) throw new Error('em dash in output')
      fs.mkdirSync(path.dirname(job.out), { recursive: true })
      fs.writeFileSync(job.out, code)
      console.log(`ok ${job.code}/${job.key} ${++done}`)
    } catch (e) {
      failed.push(`${job.code}/${job.key}`)
      console.log(`FAIL ${job.code}/${job.key}: ${e.message}`)
      if (/budget|quota/.test(e.message)) jobs.length = 0
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

for (const code of Object.keys(LANGS)) {
  const dir = path.join(root, 'src/locales', code)
  if (!fs.existsSync(dir)) continue
  const present = Object.keys(SOURCES).filter((k) => fs.existsSync(path.join(dir, `${k}.tsx`)))
  fs.writeFileSync(path.join(dir, 'index.ts'), [
    `// ${LANGS[code][0]} copy for the public pages, generated from the English and checked by the type checker.`,
    ...present.map((k) => `import ${k} from './${k}'`),
    '',
    `export default { ${present.join(', ')} }`,
    '',
  ].join('\n'))
}
console.log(`done: ${done} ok, ${failed.length} failed${failed.length ? ': ' + failed.join(' ') : ''}`)
```

**Model notes (learned the hard way):**

| Model | Result |
|---|---|
| `gemini-3.5-flash` | **Use this.** ~10-60 s per file, clean output |
| `gemini-3.5-flash-lite` | 2 s per file but mixes in stray words from other scripts (Korean, Hebrew, Greek, Hindi inside Kannada...), sometimes rewrites the whole page component, sometimes drops keys. Only for tiny repairs |
| `gemini-3.8-flash`, `gemini-3.7-flash` | Hung for 25+ minutes with no output. Avoid |

List what the key can use first:
`curl -s -H "x-goog-api-key: $KEY" "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200"`.

**Quota warning:** the SFIC run used up the whole free daily quota of `gemini-3.5-flash` and `gemini-3.6-flash` on all
three keys after about 60 big files, and those keys also serve the live site's Gemini models. Keep `MAX_REQUESTS` low,
reuse SFIC files (above), and tell the user before running a big batch. Quota resets daily (around 13:30 IST).

### Step 10: fix and check the generated files (always needed)

Run after every batch. All four must be clean before you go on.

1. **Mechanical import fixes** (the model often gets relative paths wrong). For every `src/locales/*/*.tsx`:
   - `from './LegalLayout'` becomes `from '../../pages/legal/LegalLayout'`
   - any `from '../X'` (one level, not `../../`) becomes `from '../../X'`
   - uses `ReactNode` without importing it: prepend `import type { ReactNode } from 'react'`
   - uses `PASSWORD_POLICY_MESSAGE` without importing: prepend `import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'`
   - uses `PRIVACY_COPY` / `TERMS_COPY` without importing: prepend the `import type` from the page file
   - a file with `const or: typeof en` or `export const X_COPY = defineCopy(...)` inside: retype to `typeof X_COPY.en` and delete the defineCopy line
2. **Type-check:** `npx tsc --noEmit -p .` must report 0 errors. Syntax errors hide type errors, so re-run until it is clean.
   Unterminated strings (a `'` closing a backtick string) and dropped keys are the usual errors; fix by hand or delete the
   file and regenerate it.
3. **Stray-script check** (Python, run with `python -I`, print with `ascii()` on Windows or the console crashes): for each
   file, flag any character that is not ASCII, not the language's own Unicode block, and not common punctuation
   (`\u0964\u0965\u2018\u2019\u201C\u201D\u2026\u00A0\u200C\u200D\u00B7\u2022\u20B9\u00D7\u2192\u2190\u00B0\u203A`).
   Blocks: bn/as `\u0980-\u09FF`, mr `\u0900-\u097F`, te `\u0C00-\u0C7F`, ta `\u0B80-\u0BFF`, gu `\u0A80-\u0AFF`,
   ur `\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF`, kn `\u0C80-\u0CFF`, or `\u0B00-\u0B7F`, ml `\u0D00-\u0D7F`,
   pa `\u0A00-\u0A7F`. Fix what it finds by hand (usually one word), or regenerate the file.
4. **Links check:** every `to=`/`href=` route or URL in the English block must appear unchanged in each translation.
5. **English-left check:** in each file, letters of the language's script should be well over 60% of letters inside strings
   (the Contact page is lower because names and emails are Latin; that is fine).
6. `grep -rl "—" src/locales` must print nothing.

Safe repair technique used in SFIC for stray words inside long JSX paragraphs: send only the bad source lines to the model,
ask for the same lines with only the wrong-script words rewritten, and accept a fixed line only if
`line.replace(/[^\x00-\x7F]/g, '')` is identical before and after (so code, tags and Latin words cannot change).

### Step 11: layout fixes that translated text needed

- **Features page `Accent`** (highlighted words in headlines): `whitespace-nowrap` only for English.
  `const nowrap = useLang().lang === 'en' ? 'whitespace-nowrap' : ''` and use it in the className; import `useLang`.
- **Features "note" span** (e.g. "already chosen for you"): `className="ms-auto min-w-0 text-end text-[13px] text-ink-soft"`.
- **How It Works hero outputs list:** add `min-w-0` to the `<ul className="grid ...">`, to each `motion.li`, and to the label span.
- **How It Works "Deliver" visual tabs:** container `flex min-w-0 gap-1.5`; each tab span gets `min-w-0 truncate`.
- **How It Works stage column:** the wrapper `<div>` around `copy.stages.map(... <StageCopy/>)` gets `className="min-w-0"`;
  the `StageCopy` root div gets `min-w-0`. (Otherwise Tamil overflows a 390 px phone by ~25 px.)
- **Landing demo bug** (`components/demo/useDirector.ts`, inside the `tween` tick): stop when the demo has left the page,
  or navigating away mid-animation throws `Cannot read properties of null (reading 'getBoundingClientRect')`:
  `if (tokenRef.current !== token || !stageRef.current) return resolve(false)`.

### Step 12: text that mentions languages

- Update every English and Hindi mention of "six Indian languages" / "Hindi, Gujarati, Marathi, Bengali, Telugu and Tamil"
  (features copy, landing demo drafts, README, problem statement text) to "English and 12 Indian languages" or the full list
  `English, Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu, Kannada, Odia, Malayalam, Punjabi or Assamese`.
  Do this **before** generating translations so they start from the right English.
- Privacy Policy, cookies/storage section: "Your choice of English or Hindi for these pages is kept there too" becomes
  "Your choice of language for these pages is kept there too" (and the Hindi equivalent drops "(अंग्रेज़ी या हिंदी)").
  Check the 11 translations too; each one copied "English or <own language>".
- Remove em dashes from English copy (the model copies them into every language). SFIC's `landingCopy.ts` had 8.
- `LegalLayout`'s `translationNote` (Hindi has one, English is `null`): the model writes one per language; keep them.

### Step 13: README

Add or update:
- the opening line and "What we deliver" to mention translation into English and 12 Indian languages;
- a features-table row **"Website in 13 languages"** (public pages, menu in the top bar, Urdu right to left, English and
  Hindi team-written, the other 11 machine-translated with Gemini and loaded only when chosen, workspace stays English);
- the "Full-length translation" row: the 13 target languages, own script, digits kept;
- Project structure: `lib/languages.ts`, `i18n.tsx`, `locales/<code>/`;
- Known limitations: the 11 machine translations need native-speaker review (English pages, especially Terms and Privacy,
  are the reference); Private mode (local 7B model) translates less well into Odia, Assamese and Punjabi;
- a short "Changing the website's text" note: English/Hindi live next to each page; others in `src/locales/<code>/<page>.tsx`;
  `npx tsc --noEmit` flags missing keys but not out-of-date wording.

---

## 5. Verification (do all of it before saying "done")

1. `npx tsc --noEmit -p .` gives 0 errors; `npm run build` succeeds (the chunk-size and Vite config warnings are pre-existing).
   The build should show one chunk per language of about 100 KB.
2. Start a server on a **spare port**, not the user's 8443 (`npx vite --port 5180 --strictPort`, or `npx vite preview --port 4180`
   for the production build). On Windows, stopping the shell leaves `node vite.js` running and the user's next
   `npm run dev` fails with "Port 8443 is already in use". When done, kill the node processes whose command line contains
   your port (`Get-CimInstance Win32_Process -Filter "Name='node.exe'"`) and confirm with `netstat -ano`.
3. In the browser, for all 13 languages x 8 public pages (switch by setting the `<select aria-label^="Language">` value
   and dispatching `change`; navigate with `history.pushState` + `popstate`): heading present, the page wrapper's `lang`
   equals the code, no console errors, and at **390 px width** `document.documentElement.scrollWidth <= innerWidth`
   while scrolling the whole page (some overflow only appears after scroll animations). Urdu: wrapper `dir="rtl"`,
   arrows mirrored, demo mockup still LTR.
4. `document.documentElement.lang` stays `en` (or the html default) on `/workspace` even after picking another site language.
5. Workspace: pick Translation, check the 13-button grid, generate a short paste into Urdu and Odia with the default
   (Groq) model: Urdu text renders right to left, digits stay 0-9. Open `/workspace/history` and `/workspace/analytics`.
6. Secrets: `.env*` is git-ignored; grep the changed files for `gsk_`, `sk-or-v1-`, `AIza`, `AQ.` before any commit.

---

## 6. Summary of pitfalls hit in SFIC (so you skip them)

| Pitfall | Fix |
|---|---|
| `gemini-3.8-flash` hung for 25 min | Use `gemini-3.5-flash` |
| Flash-lite mixed Korean/Hebrew/Hindi words into translations | Use 3.5-flash; run the stray-script check |
| Model rewrote whole page modules for big files | Send only the copy (cut at the `defineCopy` line) |
| Model named the export `or`/`ml` instead of `t` | Accept any `export default <name>`; let tsc judge |
| Wrong relative import paths in ~35 files | Mechanical import fixer (Step 10.1) |
| Free Gemini quota gone after ~60 files, live site affected | `MAX_REQUESTS` cap; reuse SFIC files; stop on repeated 429 |
| `html lang` set to site language broke workspace styling | Only page wrappers get `lang`/`dir` |
| Malayalam/Tamil overflowed phones | Step 11 fixes + `overflow-wrap: anywhere` |
| Translation once returned untranslated English | Removed the "keep passages already in X" prompt line |
| Leftover Vite process held port 8443 | Use a spare port; kill by command line and confirm |
| `python` printing Indic text crashed on Windows (cp1252) | Use `ascii()` or `sys.stdout.reconfigure(encoding='utf-8')` |
| Pushing internal notes (mentor's phone) to the public repo | Never commit `SFIC_Details.*`, `Team_Roles.txt` or similar team notes |
