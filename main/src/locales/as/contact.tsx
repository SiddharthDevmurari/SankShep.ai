import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'যোগাযোগ',
  title: 'ইয়াক নিৰ্মাণ কৰাসকলৰ সৈতে কথা পাতিবলৈক।',
  lead: 'Sankshep.ai, ইয়াৰ ক’ড বা আমাৰ স্মাৰ্ট ইণ্ডিয়া হেকাথন প্ৰজেক্টৰ বিষয়ে কোনো প্ৰশ্ন আছে নেকি? আমাৰ যিকোনো এজনক পোনপটীয়াকৈ লিখক, অথবা GitHub ত এটা issue খোলক।',
  contactsLabel: 'দলৰ যোগাযোগ',
  bugTitle: 'কোনো বাগ পালে নেকি বা কোনো পৰামৰ্শ আছে নেকি?',
  bugBody: 'ৰিপ’জিটেৰীটোত থকা issue আৰু pull request একেলগে সমগ্ৰ দলটোলৈ যায়।',
  openIssue: 'Issue খোলক',
  aboutProject: 'প্ৰজেক্টটোৰ বিষয়ে',
  onGithub: (name: string) => `GitHub ত ${name}`,
  onLinkedin: (name: string) => `LinkedIn ত ${name}`,
  viewProfile: 'প্র’ফাইল চাওক',
  email: 'ইমেইল',
  emailName: (name: string) => `${name} লৈ ইমেইল পঠিয়াওক`,
  copyLabel: (name: string) => `${name} ৰ ইমেইল ঠিকনা কপি কৰক`,
  copiedLabel: 'ইমেইল ঠিকনা কপি কৰা হ’ল',
  copyTitle: 'ঠিকনা কপি কৰক',
  copiedTitle: 'কপি কৰা হ’ল',
  copiedStatus: (email: string) => `${email} কপি কৰা হ’ল`,
}

export default t
