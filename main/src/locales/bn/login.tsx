import type { ReactNode } from 'react'
import type { LOGIN_COPY } from '../../pages/LoginPage'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function bengaliAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ইমেল বা পাসওয়ার্ড ভুল।',
    'This account has been disabled by the administrator.': 'অ্যাডমিনিস্ট্রেটর এই অ্যাকাউন্টটি নিষ্ক্রিয় করেছেন।',
    'Too many attempts. Please wait a few minutes and try again.': 'অনেকবার চেষ্টা করা হয়েছে। কয়েক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।',
    'An account with this email already exists. Sign in instead.': 'এই ইমেল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। তার বদলে সাইন ইন করুন।',
    'Enter a valid email address, like name@example.com.': 'একটি সঠিক ইমেল ঠিকানা লিখুন, যেমন name@example.com।',
    [PASSWORD_POLICY_MESSAGE]: 'কমপক্ষে 8টি অক্ষর রাখুন, যার মধ্যে একটি বড় হাতের অক্ষর (A-Z), একটি ছোট হাতের অক্ষর (a-z), একটি সংখ্যা এবং একটি বিশেষ চিহ্ন থাকে।',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'সাইন-আপের সেটিংস ভুল: Supabase-এ ইমেল নিশ্চিতকরণ এখনও চালু রয়েছে। সাইট অ্যাডমিনকে "Confirm email" বন্ধ করতে বলুন।'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `সাইন-ইন পরিষেবায় পৌঁছানো যায়নি${network[1]}। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `"${typo[1]}" টাইপিংয়ের ভুল মনে হচ্ছে। আপনি কি ${typo[2]} বোঝাতে চেয়েছেন?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `"${noMail[1]}"-এ ইমেল আসতে পারে না। ঠিকানায় টাইপিংয়ের ভুল পরীক্ষা করুন।`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['কার্যনির্বাহী সারাংশ', '5-স্লাইডের ডেক', 'LinkedIn পোস্ট', 'ভিডিও স্ক্রিপ্ট', 'অ্যাডভাইজরি'],
  modes: {
    login: { tab: 'সাইন ইন', title: 'আবারও স্বাগতম।', lead: 'সাইন ইন করুন এবং যেখান থেকে ছেড়েছিলেন সেখান থেকেই শুরু করুন।', submit: 'সাইন ইন করুন', busy: 'সাইন ইন করা হচ্ছে…' },
    signup: {
      tab: 'অ্যাকাউন্ট তৈরি করুন',
      title: 'একটি ডকুমেন্ট দিয়ে শুরু করুন।',
      lead: 'একটি অ্যাকাউন্ট তৈরি করুন এবং সরাসরি ওয়ার্কস্পেসে প্রবেশ করুন। কোনো ইমেল নিশ্চিতকরণের ধাপ নেই।',
      submit: 'অ্যাকাউন্ট তৈরি করুন',
      busy: 'অ্যাকাউন্ট তৈরি করা হচ্ছে…',
    },
  },
  home: 'Sankshep হোম',
  headline: <>একটি ডকুমেন্ট, <span className="font-serif">প্রতিটি</span> ফরম্যাট।</>,
  accountLabel: 'অ্যাকাউন্ট',
  email: 'ইমেল',
  password: 'পাসওয়ার্ড',
  newPassword: 'পাসওয়ার্ড তৈরি করুন',
  yourPassword: 'আপনার পাসওয়ার্ড',
  showPassword: 'পাসওয়ার্ড দেখান',
  hidePassword: 'পাসওয়ার্ড লুকান',
  rules: ['8 বা তার বেশি অক্ষর', 'একটি বড় হাতের অক্ষর (A-Z)', 'একটি ছোট হাতের অক্ষর (a-z)', 'একটি সংখ্যা', 'একটি বিশেষ চিহ্ন'],
  met: '(সম্পন্ন)',
  notMet: '(অসম্পূর্ণ)',
  or: 'অথবা আগে ঘুরে দেখুন',
  demo: 'ডেমো অ্যাকাউন্ট দিয়ে এগিয়ে যান',
  enter: 'প্রবেশ করুন',
  demoMissing: 'ডেটাবেসে এখনও ডেমো অ্যাকাউন্ট সেট আপ করা হয়নি। Supabase SQL Editor-এ main/supabase/reset_accounts.sql চালান।',
  error: bengaliAuthError,
  disabledTitle: 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে',
  disabledBody: (email: ReactNode) => (
    <>একজন অ্যাডমিনিস্ট্রেটর {email} নিষ্ক্রিয় করেছেন, তাই সাইন ইন করা যাবে না। আপনার ড্রাফট এবং History সুরক্ষিত রয়েছে। অ্যাকাউন্টটি আবার চালু করার জন্য অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।</>
  ),
  disabledNext: 'চালু হওয়ার পর, আগের মতোই সাইন ইন করুন।',
  contactAdmin: 'অ্যাডমিনের সাথে যোগাযোগ করুন',
}

export default t
