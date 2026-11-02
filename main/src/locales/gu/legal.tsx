import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'કાનૂની',
  updated: 'છેલ્લું અપડેટ',
  summaryLabel: 'સારાંશ',
  shortVersion: 'ટૂંકમાં',
  contents: 'વિષય-સૂચિ',
  readWith: (link: ReactNode) => <>આને અમારી {link} સાથે વાંચો.</>,
  translationNote: 'આ ગુજરાતી અનુવાદ તમારી સુવિધા માટે છે. અંગ્રેજી સંસ્કરણ સાથે કોઈ તફાવત હોય તો અંગ્રેજી સંસ્કરણ જ આખરી ગણાશે.',
}

export default t
