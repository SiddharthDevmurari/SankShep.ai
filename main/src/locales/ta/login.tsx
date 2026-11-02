import type { ReactNode } from 'react'
import type { LOGIN_COPY } from '../../pages/LoginPage'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function tamilAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.',
    'This account has been disabled by the administrator.': 'நிர்வாகியால் இந்தக் கணக்கு முடக்கப்பட்டிருக்கிறது.',
    'Too many attempts. Please wait a few minutes and try again.': 'பல முறை முயற்சிக்கப்பட்டது. சில நிமிடங்கள் காத்திருந்து மீண்டும் முயற்சிக்கவும்.',
    'An account with this email already exists. Sign in instead.': 'இந்த மின்னஞ்சலில் ஏற்கனவே ஒரு கணக்கு உள்ளது. பதிலாக உள்நுழையவும்.',
    'Enter a valid email address, like name@example.com.': 'name@example.com போன்ற செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
    [PASSWORD_POLICY_MESSAGE]: 'குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்; அதில் ஒரு பெரிய எழுத்து (A-Z), ஒரு சிறிய எழுத்து (a-z), ஒரு எண் மற்றும் ஒரு சிறப்பு குறியீடு இருக்க வேண்டும்.',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'கணக்கு உருவாக்க அமைப்பில் பிழை உள்ளது: Supabase-இல் மின்னஞ்சல் உறுதிப்படுத்தல் இன்னும் இயக்கப்பட்டிருக்கிறது. தள நிர்வாகியிடம் “Confirm email” அமைப்பை முடக்குமாறு கூறவும்.'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `உள்நுழைவு சேவையை அணுக முடியவில்லை${network[1]}. உங்கள் இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” என்பது தட்டச்சுப் பிழையாக இருக்கலாம். நீங்கள் ${typo[2]} என்பதைக் குறிப்பிட்டீர்களா?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” முகவரிக்கு மின்னஞ்சல் பெற முடியாது. முகவரியில் உள்ள தட்டச்சுப் பிழைகளைச் சரிபார்க்கவும்.`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['நிர்வாகச் சுருக்கம்', '5-ஸ்லைடு டெக்', 'LinkedIn பதிவு', 'வீடியோ ஸ்கிரிப்ட்', 'அறிவுறுத்தல்'],
  modes: {
    login: { tab: 'உள்நுழை', title: 'மீண்டும் வருக.', lead: 'நீங்கள் விட்ட இடத்திலிருந்து தொடர உள்நுழையவும்.', submit: 'உள்நுழை', busy: 'உள்நுழைகிறது…' },
    signup: {
      tab: 'கணக்கை உருவாக்கு',
      title: 'ஒரு ஆவணத்துடன் தொடங்குங்கள்.',
      lead: 'கணக்கை உருவாக்கி நேரடியாக வொர்க்ஸ்பேஸுக்குச் செல்லவும். மின்னஞ்சல் உறுதிப்படுத்தல் படி எதுவுமில்லை.',
      submit: 'கணக்கை உருவாக்கு',
      busy: 'கணக்கு உருவாக்கப்படுகிறது…',
    },
  },
  home: 'Sankshep முகப்பு',
  headline: <>ஒரு ஆவணம், <span className="font-serif">ஒவ்வொரு</span> வடிவம்.</>,
  accountLabel: 'கணக்கு',
  email: 'மின்னஞ்சல்',
  password: 'கடவுச்சொல்',
  newPassword: 'கடவுச்சொல்லை உருவாக்குங்கள்',
  yourPassword: 'உங்கள் கடவுச்சொல்',
  showPassword: 'கடவுச்சொல்லைக் காட்டு',
  hidePassword: 'கடவுச்சொல்லை மறை',
  rules: ['8 அல்லது அதற்கு மேற்பட்ட எழுத்துகள்', 'ஒரு பெரிய எழுத்து (A-Z)', 'ஒரு சிறிய எழுத்து (a-z)', 'ஒரு எண்', 'ஒரு சிறப்பு குறியீடு'],
  met: '(நிறைவேறியது)',
  notMet: '(நிறைவேறவில்லை)',
  or: 'அல்லது முதலில் சுற்றிப் பாருங்கள்',
  demo: 'டெமோ கணக்குடன் தொடரவும்',
  enter: 'நுழை',
  demoMissing: 'டெமோ கணக்கு இன்னும் தரவுத்தளத்தில் அமைக்கப்படவில்லை. Supabase SQL Editor-இல் main/supabase/reset_accounts.sql-ஐ இயக்கவும்.',
  error: tamilAuthError,
  disabledTitle: 'இந்தக் கணக்கு முடக்கப்பட்டிருக்கிறது',
  disabledBody: (email: ReactNode) => (
    <>{email} கணக்கை நிர்வாகி முடக்கியுள்ளார், எனவே உள்நுழைய முடியாது. உங்கள் வரைவுகளும் History-யும் பாதுகாப்பாக உள்ளன. கணக்கை மீண்டும் இயக்க நிர்வாகியைத் தொடர்புகொள்ளவும்.</>
  ),
  disabledNext: 'இயக்கப்பட்டதும், வழக்கம்போல் உள்நுழையவும்.',
  contactAdmin: 'நிர்வாகியைத் தொடர்புகொள்ளவும்',
}

export default t
