import type { LOGIN_COPY } from '../../pages/LoginPage'
import type { ReactNode } from 'react'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function urduAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ای میل یا پاس ورڈ غلط ہے۔',
    'This account has been disabled by the administrator.': 'ایڈمنسٹریٹر نے اس اکاؤنٹ کو بند کر دیا ہے۔',
    'Too many attempts. Please wait a few minutes and try again.': 'بہت زیادہ کوششیں ہو گئیں۔ کچھ منٹ انتظار کر کے دوبارہ کوشش کریں۔',
    'An account with this email already exists. Sign in instead.': 'اس ای میل سے اکاؤنٹ پہلے سے موجود ہے۔ اس کے بجائے سائن ان کریں۔',
    'Enter a valid email address, like name@example.com.': 'ایک درست ای میل پتہ درج کریں، جیسے name@example.com۔',
    [PASSWORD_POLICY_MESSAGE]: 'کم از کم 8 حروف رکھیں، جن میں ایک بڑا حرف (A-Z)، ایک چھوٹا حرف (a-z)، ایک ہندسہ اور ایک خاص علامت ہو۔',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'سائن اپ کی ترتیب درست نہیں ہے: Supabase میں ای میل کی تصدیق ابھی بھی فعال ہے۔ سائٹ کے ایڈمن سے “Confirm email” بند کرنے کو کہیں۔'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `سائن ان سروس تک نہیں پہنچ سکے${network[1]}۔ اپنا انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” میں ٹائپنگ کی غلطی معلوم ہوتی ہے۔ کیا آپ کا مطلب ${typo[2]} تھا؟`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” پر ای میل موصول نہیں ہو سکتا۔ پتے میں ٹائپنگ کی غلطی چیک کریں۔`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['ایگزیکٹو سمری', '5 سلائیڈ ڈیک', 'LinkedIn پوسٹ', 'ویڈیو سکرپٹ', 'ایڈوائزری'],
  modes: {
    login: { tab: 'سائن ان', title: 'خوش آمدید۔', lead: 'وہیں سے شروع کرنے کے لیے سائن ان کریں جہاں آپ نے چھوڑا تھا۔', submit: 'سائن ان', busy: 'سائن ان ہو رہا ہے…' },
    signup: {
      tab: 'اکاؤنٹ بنائیں',
      title: 'ایک دستاویز سے شروعات کریں۔',
      lead: 'اکاؤنٹ بنائیں اور براہ راست ورک اسپیس میں جائیں۔ ای میل کا کوئی مرحلہ نہیں ہے۔',
      submit: 'اکاؤنٹ بنائیں',
      busy: 'اکاؤنٹ بنایا جا رہا ہے…',
    },
  },
  home: 'Sankshep ہوم',
  headline: <>ایک دستاویز، <span className="font-serif">ہر</span> فارمیٹ۔</>,
  accountLabel: 'اکاؤنٹ',
  email: 'ای میل',
  password: 'پاس ورڈ',
  newPassword: 'نیا پاس ورڈ بنائیں',
  yourPassword: 'آپ کا پاس ورڈ',
  showPassword: 'پاس ورڈ دکھائیں',
  hidePassword: 'پاس ورڈ چھپائیں',
  rules: ['8 یا زیادہ حروف', 'ایک بڑا حرف (A-Z)', 'ایک چھوٹا حرف (a-z)', 'ایک ہندسہ', 'ایک خاص علامت'],
  met: '(پورا ہو گیا)',
  notMet: '(پورا نہیں ہوا)',
  or: 'یا پہلے ادھر ادھر دیکھ لیں',
  demo: 'ڈیمو اکاؤنٹ کے ساتھ آگے بڑھیں',
  enter: 'داخل ہوں',
  demoMissing: 'ڈیمو اکاؤنٹ ابھی ڈیٹا بیس میں سیٹ نہیں ہے۔ Supabase SQL Editor میں main/supabase/reset_accounts.sql چلائیں۔',
  error: urduAuthError,
  disabledTitle: 'یہ اکاؤنٹ معطل کر دیا گیا ہے',
  disabledBody: (email: ReactNode) => (
    <>ایک ایڈمنسٹریٹر نے {email} کو معطل کر دیا ہے، اس لیے اس سے سائن ان نہیں کیا جا سکتا۔ آپ کے ڈرافٹس اور ہسٹری محفوظ ہیں۔ اکاؤنٹ کو دوبارہ فعال کرنے کے لیے ایڈمنسٹریٹر سے رابطہ کریں۔</>
  ),
  disabledNext: 'ایک بار فعال ہونے کے بعد، معمول کے مطابق سائن ان کریں۔',
  contactAdmin: 'ایڈمن سے رابطہ کریں',
}

export default t
