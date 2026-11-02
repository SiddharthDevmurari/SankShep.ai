import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'சட்டம்',
  updated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
  summaryLabel: 'சுருக்கம்',
  shortVersion: 'சுருக்கமான வடிவம்',
  contents: 'பொருளடக்கம்',
  readWith: (link: ReactNode) => <>இதை எங்கள் {link} உடன் சேர்த்துப் படிக்கவும்.</>,
  translationNote:
    'இந்தத் தமிழ் மொழிபெயர்ப்பு உங்கள் வசதிக்காக வழங்கப்பட்டுள்ளது. ஆங்கிலப் பதிப்பிற்கும் இதற்கும் ஏதேனும் வேறுபாடு இருந்தால், ஆங்கிலப் பதிப்பே செல்லுபடியாகும்.',
}

export default t
