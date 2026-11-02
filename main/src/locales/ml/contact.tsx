import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'ബന്ധപ്പെടുക',
  title: 'ഇത് നിർമ്മിച്ചവരോട് സംസാരിക്കൂ.',
  lead: 'Sankshep.ai, കോഡ് അല്ലെങ്കിൽ ഞങ്ങളുടെ സ്മാർട്ട് ഇന്ത്യ ഹാക്കത്തോൺ പ്രോജക്റ്റ് എന്നിവയെക്കുറിച്ച് എന്തെങ്കിലും ചോദ്യങ്ങളുണ്ടോ? ഞങ്ങളിൽ ആർക്കെങ്കിലും നേരിട്ട് എഴുതുക അല്ലെങ്കിൽ GitHub-ൽ ഒരു issue തുറക്കുക.',
  contactsLabel: 'ടീം കോൺടാക്റ്റുകൾ',
  bugTitle: 'ഒരു ബഗ് കണ്ടെത്തിയോ അതോ എന്തെങ്കിലും ആശയമുണ്ടോ?',
  bugBody: 'റിപ്പോസിറ്ററിയിലെ issue-കളും pull request-കളും ഒരുമിച്ച് മുഴുവൻ ടീമിലും എത്തും.',
  openIssue: 'Issue തുറക്കുക',
  aboutProject: 'പ്രോജക്റ്റിനെക്കുറിച്ച്',
  onGithub: (name: string) => `GitHub-ൽ ${name}`,
  onLinkedin: (name: string) => `LinkedIn-ൽ ${name}`,
  viewProfile: 'പ്രൊഫൈൽ കാണുക',
  email: 'ഇമെയിൽ',
  emailName: (name: string) => `${name}-ന് ഇമെയിൽ അയക്കുക`,
  copyLabel: (name: string) => `${name}-ന്റെ ഇമെയിൽ വിലാസം പകർത്തുക`,
  copiedLabel: 'ഇമെയിൽ വിലാസം പകർത്തി',
  copyTitle: 'വിലാസം പകർത്തുക',
  copiedTitle: 'പകർത്തി',
  copiedStatus: (email: string) => `${email} പകർത്തി`,
}

export default t
