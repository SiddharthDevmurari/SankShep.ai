import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'સંપર્ક',
  title: 'આ બનાવનારા લોકો સાથે વાત કરો.',
  lead: 'Sankshep.ai, તેના કોડ અથવા અમારા સ્માર્ટ ઇન્ડિયા હેકાથોન પ્રોજેક્ટ વિશે કોઈ પ્રશ્ન છે? અમારામાંથી કોઈને પણ સીધું લખો, અથવા GitHub પર issue ખોલો.',
  contactsLabel: 'ટીમના સંપર્કો',
  bugTitle: 'કોઈ બગ મળ્યો અથવા કોઈ વિચાર છે?',
  bugBody: 'રિપોઝિટરી પર issues અને pull requests એક સાથે આખી ટીમ સુધી પહોંચે છે.',
  openIssue: 'Issue ખોલો',
  aboutProject: 'પ્રોજેક્ટ વિશે',
  onGithub: (name: string) => `GitHub પર ${name}`,
  onLinkedin: (name: string) => `LinkedIn પર ${name}`,
  viewProfile: 'પ્રોફાઇલ જુઓ',
  email: 'ઈમેલ',
  emailName: (name: string) => `${name} ને ઈમેલ કરો`,
  copyLabel: (name: string) => `${name} નું ઈમેલ સરનામું કોપી કરો`,
  copiedLabel: 'ઈમેલ સરનામું કોપી થઈ ગયું',
  copyTitle: 'સરનામું કોપી કરો',
  copiedTitle: 'કોપી થઈ ગયું',
  copiedStatus: (email: string) => `${email} કોપી થઈ ગયું`,
}

export default t
