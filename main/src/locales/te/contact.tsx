import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'సంప్రదించండి',
  title: 'దీన్ని రూపొందించిన వారితో మాట్లాడండి.',
  lead: 'Sankshep.ai, దీని కోడ్ లేదా మా స్మార్ట్ ఇండియా హ్యాకథాన్ ప్రాజెక్ట్ గురించి సందేహాలు ఉన్నాయా? మాలో ఎవరికైనా నేరుగా రాయండి, లేదా GitHub లో ఒక issue తెరవండి.',
  contactsLabel: 'టీమ్ సంప్రదింపులు',
  bugTitle: 'ఏదైనా bug కనిపిస్తుందా లేదా ఒక ఆలోచన ఉందా?',
  bugBody: 'రిపాజిటరీలో issue మరియు pull request ఒకేసారి మొత్తం టీమ్‌కు చేరుతాయి.',
  openIssue: 'Issue తెరవండి',
  aboutProject: 'ప్రాజెక్ట్ గురించి',
  onGithub: (name: string) => `GitHub లో ${name}`,
  onLinkedin: (name: string) => `LinkedIn లో ${name}`,
  viewProfile: 'ప్రొఫైల్ చూడండి',
  email: 'ఈమెయిల్',
  emailName: (name: string) => `${name}కి ఈమెయిల్ చేయండి`,
  copyLabel: (name: string) => `${name} ఈమెయిల్ అడ్రస్‌ను కాపీ చేయండి`,
  copiedLabel: 'ఈమెయిల్ అడ్రస్ కాపీ అయింది',
  copyTitle: 'అడ్రస్ కాపీ చేయండి',
  copiedTitle: 'కాపీ అయింది',
  copiedStatus: (email: string) => `${email} కాపీ అయింది`,
}

export default t
