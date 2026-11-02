import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'संपर्क',
  title: 'हे बनवणाऱ्यांशी बोला.',
  lead: 'Sankshep.ai, त्याचा कोड किंवा आमच्या स्मार्ट इंडिया हॅकेथॉन प्रोजेक्टबद्दल काही प्रश्न आहेत? आमच्यापैकी कोणालाही थेट लिहा, किंवा GitHub वर issue उघडा.',
  contactsLabel: 'टीमचे संपर्क',
  bugTitle: 'काही बग सापडला किंवा कल्पना आहे?',
  bugBody: 'रिपॉझिटरीवरील issue आणि pull request एकाच वेळी संपूर्ण टीमपर्यंत पोहोचतात.',
  openIssue: 'Issue उघडा',
  aboutProject: 'प्रोजेक्टबद्दल',
  onGithub: (name: string) => `GitHub वर ${name}`,
  onLinkedin: (name: string) => `LinkedIn वर ${name}`,
  viewProfile: 'प्रोफाइल पहा',
  email: 'ईमेल',
  emailName: (name: string) => `${name} यांना ईमेल करा`,
  copyLabel: (name: string) => `${name} यांचा ईमेल पत्ता कॉपी करा`,
  copiedLabel: 'ईमेल पत्ता कॉपी झाला',
  copyTitle: 'पत्ता कॉपी करा',
  copiedTitle: 'कॉपी झाला',
  copiedStatus: (email: string) => `${email} कॉपी झाला`,
}

export default t
