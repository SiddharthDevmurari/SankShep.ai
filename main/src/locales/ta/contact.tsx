import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'தொடர்புக்கு',
  title: 'இதை உருவாக்கியவர்களிடம் பேசுங்கள்.',
  lead: 'Sankshep.ai, இதன் கோட் அல்லது எங்களது ஸ்மார்ட் இந்தியா ஹேக்கத்தான் திட்டம் குறித்து கேள்விகள் உள்ளதா? எங்களில் யாருக்கேனும் நேரடியாக எழுதுங்கள், அல்லது GitHub-இல் ஒரு issue-வைத் திறக்கவும்.',
  contactsLabel: 'குழு தொடர்புகள்',
  bugTitle: 'ஏதேனும் bug உள்ளதா அல்லது யோசனை உள்ளதா?',
  bugBody: 'ரெபாசிட்டரியில் உள்ள issue மற்றும் pull request அனைத்தும் ஒரே நேரத்தில் முழு டீமையும் சென்றடையும்.',
  openIssue: 'Issue திறக்கவும்',
  aboutProject: 'ப்ராஜெக்ட் பற்றி',
  onGithub: (name: string) => `GitHub-இல் ${name}`,
  onLinkedin: (name: string) => `LinkedIn-இல் ${name}`,
  viewProfile: 'ப்ரோஃபைலைப் பார்க்கவும்',
  email: 'மின்னஞ்சல்',
  emailName: (name: string) => `${name}-க்கு மின்னஞ்சல் அனுப்பவும்`,
  copyLabel: (name: string) => `${name}-ன் மின்னஞ்சல் முகவரியை நகலெடுக்கவும்`,
  copiedLabel: 'மின்னஞ்சல் முகவரி நகலெடுக்கப்பட்டது',
  copyTitle: 'முகவரியை நகலெடுக்கவும்',
  copiedTitle: 'நகலெடுக்கப்பட்டது',
  copiedStatus: (email: string) => `${email} நகலெடுக்கப்பட்டது`,
}

export default t
