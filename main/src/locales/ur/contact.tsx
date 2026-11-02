import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'رابطہ',
  title: 'اسے بنانے والوں سے بات کریں۔',
  lead: 'Sankshep.ai، اس کے کوڈ یا ہمارے اسمارٹ انڈیا ہیکاتھون پروجیکٹ کے بارے میں کوئی سوال ہے؟ ہم میں سے کسی کو بھی براہ راست لکھیں، یا GitHub پر ایک issue کھولیں۔',
  contactsLabel: 'ٹیم کے رابطہ',
  bugTitle: 'کوئی بگ ملا یا کوئی تجویز ہے؟',
  bugBody: 'ریپوزیٹری پر issue اور pull request ایک ساتھ پوری ٹیم تک پہنچتے ہیں۔',
  openIssue: 'Issue کھولیں',
  aboutProject: 'پروجیکٹ کے بارے میں',
  onGithub: (name: string) => `GitHub پر ${name}`,
  onLinkedin: (name: string) => `LinkedIn پر ${name}`,
  viewProfile: 'پروفائل دیکھیں',
  email: 'ایمیل',
  emailName: (name: string) => `${name} کو ایمیل کریں`,
  copyLabel: (name: string) => `${name} کا ایمیل پتہ کاپی کریں`,
  copiedLabel: 'ایمیل پتہ کاپی ہو گیا',
  copyTitle: 'پتہ کاپی کریں',
  copiedTitle: 'کاپی ہو گیا',
  copiedStatus: (email: string) => `${email} کاپی ہو گیا`,
}

export default t
