import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'ਸੰਪਰਕ',
  title: 'ਇਸ ਨੂੰ ਬਣਾਉਣ ਵਾਲਿਆਂ ਨਾਲ ਗੱਲ ਕਰੋ।',
  lead: 'Sankshep.ai, ਇਸ ਦੇ ਕੋਡ ਜਾਂ ਸਾਡੇ ਸਮਾਰਟ ਇੰਡੀਆ ਹੈਕਾਥਨ ਪ੍ਰੋਜੈਕਟ ਬਾਰੇ ਕੋਈ ਸਵਾਲ ਹੈ? ਸਾਡੇ ਵਿੱਚੋਂ ਕਿਸੇ ਨੂੰ ਵੀ ਸਿੱਧਾ ਲਿਖੋ, ਜਾਂ GitHub ਉੱਤੇ ਇੱਕ issue ਖੋਲ੍ਹੋ।',
  contactsLabel: 'ਟੀਮ ਦੇ ਸੰਪਰਕ',
  bugTitle: 'ਕੋਈ ਬੱਗ ਮਿਲਿਆ ਜਾਂ ਕੋਈ ਸੁਝਾਅ ਹੈ?',
  bugBody: 'ਰਿਪੋਜ਼ਿਟਰੀ ਉੱਤੇ issue ਅਤੇ pull request ਇੱਕੋ ਸਮੇਂ ਪੂਰੀ ਟੀਮ ਤੱਕ ਪਹੁੰਚਦੇ ਹਨ।',
  openIssue: 'Issue ਖੋਲ੍ਹੋ',
  aboutProject: 'ਪ੍ਰੋਜੈਕਟ ਬਾਰੇ',
  onGithub: (name: string) => `GitHub ਉੱਤੇ ${name}`,
  onLinkedin: (name: string) => `LinkedIn ਉੱਤੇ ${name}`,
  viewProfile: 'ਪ੍ਰੋਫ਼ਾਈਲ ਦੇਖੋ',
  email: 'ਈਮੇਲ',
  emailName: (name: string) => `${name} ਨੂੰ ਈਮੇਲ ਭੇਜੋ`,
  copyLabel: (name: string) => `${name} ਦਾ ਈਮੇਲ ਪਤਾ ਕਾਪੀ ਕਰੋ`,
  copiedLabel: 'ਈਮੇਲ ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ',
  copyTitle: 'ਪਤਾ ਕਾਪੀ ਕਰੋ',
  copiedTitle: 'ਕਾਪੀ ਹੋ ਗਿਆ',
  copiedStatus: (email: string) => `${email} ਕਾਪੀ ਹੋ ਗਿਆ`,
}

export default t
