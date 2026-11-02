import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'
import type { ReactNode } from 'react'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'നിയമപരമായ വിവരങ്ങൾ',
  updated: 'അവസാനം പുതുക്കിയത്',
  summaryLabel: 'സംഗ്രഹം',
  shortVersion: 'ചുരുക്കത്തിൽ',
  contents: 'ഉള്ളടക്കം',
  readWith: (link: ReactNode) => <>ഇത് ഞങ്ങളുടെ {link} കൂടി വായിക്കുക.</>,
  translationNote: 'ഈ മലയാളം വിവർത്തനം നിങ്ങളുടെ സൗകര്യത്തിനായി നൽകിയിട്ടുള്ളതാണ്. ഇംഗ്ലീഷ് പതിപ്പുമായി എന്തെങ്കിലും വ്യത്യാസമുണ്ടായാൽ ഇംഗ്ലീഷ് പതിപ്പ് തന്നെയായിരിക്കും പ്രാബല്യത്തിൽ ഉള്ളത്.',
}

export default t
