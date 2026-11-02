import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'
import type { ReactNode } from 'react'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'قانونی',
  updated: 'آخری اپ ڈیٹ',
  summaryLabel: 'خلاصہ',
  shortVersion: 'مختصر خلاصہ',
  contents: 'فہرستِ مندرجات',
  readWith: (link: ReactNode) => <>اسے ہماری {link} کے ساتھ پڑھیں۔</>,
  translationNote: 'یہ اردو ترجمہ آپ کی آسانی کے لیے ہے۔ انگریزی ورژن سے کوئی اختلاف ہونے کی صورت میں انگریزی ورژن ہی معتبر ہوگا۔',
}

export default t
