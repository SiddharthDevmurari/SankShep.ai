import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'যোগাযোগ',
  title: 'যাঁরা এটি তৈরি করেছেন তাঁদের সাথে কথা বলুন।',
  lead: 'Sankshep.ai, এর কোড বা আমাদের স্মার্ট ইন্ডিয়া হ্যাকাথন প্রজেক্ট সম্পর্কে কোনো প্রশ্ন আছে? আমাদের যে কাউকেই সরাসরি লিখুন, অথবা GitHub-এ একটি issue খুলুন।',
  contactsLabel: 'টিমের যোগাযোগ',
  bugTitle: 'কোনো বাগ পেয়েছেন বা কোনো পরামর্শ আছে?',
  bugBody: 'রেপোজিটরিতে issue এবং pull request একসাথেই পুরো টিমের কাছে পৌঁছে যায়।',
  openIssue: 'Issue খুলুন',
  aboutProject: 'প্রজেক্ট সম্পর্কে',
  onGithub: (name: string) => `GitHub-এ ${name}`,
  onLinkedin: (name: string) => `LinkedIn-এ ${name}`,
  viewProfile: 'প্রোফাইল দেখুন',
  email: 'ইমেল',
  emailName: (name: string) => `${name}-কে ইমেল করুন`,
  copyLabel: (name: string) => `${name}-এর ইমেল ঠিকানা কপি করুন`,
  copiedLabel: 'ইমেল ঠিকানা কপি করা হয়েছে',
  copyTitle: 'ঠিকানা কপি করুন',
  copiedTitle: 'কপি করা হয়েছে',
  copiedStatus: (email: string) => `${email} কপি করা হয়েছে`,
}

export default t
