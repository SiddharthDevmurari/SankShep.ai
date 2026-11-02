import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'ಸಂಪರ್ಕ',
  title: 'ಇದನ್ನು ನಿರ್ಮಿಸಿದವರೊಂದಿಗೆ ಮಾತನಾಡಿ.',
  lead: 'Sankshep.ai, ಇದರ ಕೋಡ್ ಅಥವಾ ನಮ್ಮ ಸ್ಮಾರ್ಟ್ ಇಂಡಿಯಾ ಹ್ಯಾಕಥಾನ್ ಪ್ರಾಜೆಕ್ಟ್ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಇದೆಯೇ? ನಮ್ಮಲ್ಲಿ ಯಾರಿಗಾದರೂ ನೇರವಾಗಿ ಬರೆಯಿರಿ, ಅಥವಾ GitHub ನಲ್ಲಿ ಒಂದು issue ತೆರೆಯಿರಿ.',
  contactsLabel: 'ತಂಡದ ಸಂಪರ್ಕಗಳು',
  bugTitle: 'ಯಾವುದಾದರೂ ದೋಷ (bug) ಕಂಡುಬಂದಿದೆಯೇ ಅಥವಾ ಸಲಹೆ ಇದೆಯೇ?',
  bugBody: 'ರೆಪೊಸಿಟರಿಯಲ್ಲಿನ issues ಮತ್ತು pull requests ಏಕಕಾಲದಲ್ಲಿ ಇಡೀ ತಂಡವನ್ನು ತಲುಪುತ್ತವೆ.',
  openIssue: 'Issue ತೆರೆಯಿರಿ',
  aboutProject: 'ಯೋಜನೆಯ ಬಗ್ಗೆ',
  onGithub: (name: string) => `GitHub ನಲ್ಲಿ ${name}`,
  onLinkedin: (name: string) => `LinkedIn ನಲ್ಲಿ ${name}`,
  viewProfile: 'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ',
  email: 'ಇಮೇಲ್',
  emailName: (name: string) => `${name} ಅವರಿಗೆ ಇಮೇಲ್ ಕಳುಹಿಸಿ`,
  copyLabel: (name: string) => `${name} ಅವರ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಕಲಿಸಿ`,
  copiedLabel: 'ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಕಲಿಸಲಾಗಿದೆ',
  copyTitle: 'ವಿಳಾಸ ನಕಲಿಸಿ',
  copiedTitle: 'ನಕಲಿಸಲಾಗಿದೆ',
  copiedStatus: (email: string) => `${email} ನಕಲಿಸಲಾಗಿದೆ`,
}

export default t
