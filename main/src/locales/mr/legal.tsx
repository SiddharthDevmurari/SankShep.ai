import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'कायदेशीर',
  updated: 'शेवटचे अपडेट',
  summaryLabel: 'सारांश',
  shortVersion: 'थोडक्यात',
  contents: 'विषयसूची',
  readWith: (link: ReactNode) => <>हे आमच्या {link} सोबत वाचा.</>,
  translationNote: 'हे मराठी भाषांतर तुमच्या सोयीसाठी आहे. इंग्रजी आवृत्ती आणि यात काही फरक असल्यास इंग्रजी आवृत्तीच अंतिम मानली जाईल.',
}

export default t
