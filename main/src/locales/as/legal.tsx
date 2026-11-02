import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'আইনী',
  updated: 'সৰ্বশেষ আপডেট',
  summaryLabel: 'সাৰাংশ',
  shortVersion: 'সংক্ষেপে',
  contents: 'সূচীপত্ৰ',
  readWith: (link: ReactNode) => <>ইয়াক আমাৰ {link}ৰ সৈতে পঢ়ক।</>,
  translationNote: 'এই অসমীয়া অনুবাদ আপোনাৰ সুবিধাৰ বাবে দিয়া হৈছে। ইংৰাজী সংস্কৰণৰ সৈতে কিবা অমিল থাকিলে ইংৰাজী সংস্কৰণহে মান্য হ’ব।',
}

export default t
