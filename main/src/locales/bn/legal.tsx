import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'আইনি',
  updated: 'সর্বশেষ আপডেট',
  summaryLabel: 'সারসংক্ষেপ',
  shortVersion: 'সংক্ষেপে',
  contents: 'সূচিপত্র',
  readWith: (link: ReactNode) => <>এটি আমাদের {link}-এর সাথে পড়ুন।</>,
  translationNote:
    'এই বাংলা অনুবাদটি আপনার সুবিধার জন্য। ইংরেজি সংস্করণের সাথে কোনো অমিল থাকলে ইংরেজি সংস্করণটিই চূড়ান্ত বলে গণ্য হবে।',
}

export default t
