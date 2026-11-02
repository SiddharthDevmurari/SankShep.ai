import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'చట్టపరమైనవి',
  updated: 'చివరిగా నవీకరించబడింది',
  summaryLabel: 'సారాంశం',
  shortVersion: 'సంక్షిప్తంగా',
  contents: 'విషయ సూచిక',
  readWith: (link: ReactNode) => <>దీనిని మా {link}తో కలిపి చదవండి.</>,
  translationNote:
    'ఈ తెలుగు అనువాదం మీ సౌలభ్యం కోసం మాత్రమే అందించబడింది. ఆంగ్ల పాఠంతో ఏవైనా తేడాలు ఉంటే, ఆంగ్ల పాఠమే ప్రామాణికంగా పరిగణించబడుతుంది.',
}

export default t
