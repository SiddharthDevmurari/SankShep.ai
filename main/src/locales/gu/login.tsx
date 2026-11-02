import type { ReactNode } from 'react'
import type { LOGIN_COPY } from '../../pages/LoginPage'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function gujaratiAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ઇમેઇલ અથવા પાસવર્ડ ખોટો છે.',
    'This account has been disabled by the administrator.': 'એડમિનિસ્ટ્રેટરે આ એકાઉન્ટ બંધ કરી દીધું છે.',
    'Too many attempts. Please wait a few minutes and try again.': 'ઘણા બધા પ્રયાસો થયા. થોડી મિનિટો રાહ જુઓ અને ફરી પ્રયાસ કરો.',
    'An account with this email already exists. Sign in instead.': 'આ ઇમેઇલથી એકાઉન્ટ પહેલેથી જ અસ્તિત્વમાં છે. તેના બદલે સાઇન ઇન કરો.',
    'Enter a valid email address, like name@example.com.': 'યોગ્ય ઇમેઇલ સરનામું દાખલ કરો, જેમ કે name@example.com.',
    [PASSWORD_POLICY_MESSAGE]: 'ઓછામાં ઓછા 8 અક્ષરો રાખો, જેમાં એક મોટો અક્ષર (A-Z), એક નાનો અક્ષર (a-z), એક અંક અને એક વિશિષ્ટ ચિહ્ન હોય.',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'સાઇન-અપનું સેટિંગ ખોટું છે: Supabase માં ઇમેઇલ ચકાસણી હજી પણ ચાલુ છે. સાઇટ એડમિનને “Confirm email” બંધ કરવા કહો.'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `સાઇન-ઇન સેવા સુધી પહોંચી શકાયું નહીં${network[1]}. તમારું ઇન્ટરનેટ કનેક્શન ચકાસો અને ફરી પ્રયાસ કરો.`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” માં ટાઇપિંગની ભૂલ લાગે છે. શું તમારો મતલબ ${typo[2]} હતો?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” પર ઇમેઇલ આવી શકતો નથી. સરનામામાં ટાઇપિંગની ભૂલ ચકાસો.`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['કાર્યકારી સારાંશ', '5 સ્લાઇડનું ડેક', 'LinkedIn પોસ્ટ', 'વિડિઓ સ્ક્રિપ્ટ', 'એડવાઇઝરી'],
  modes: {
    login: { tab: 'સાઇન ઇન', title: 'ફરી સ્વાગત છે.', lead: 'સાઇન ઇન કરો અને તમે જ્યાંથી અટક્યા હતા ત્યાંથી શરૂ કરો.', submit: 'સાઇન ઇન કરો', busy: 'સાઇન ઇન થઈ રહ્યું છે…' },
    signup: {
      tab: 'નવું એકાઉન્ટ',
      title: 'એક દસ્તાવેજથી શરૂઆત કરો.',
      lead: 'એકાઉન્ટ બનાવો અને સીધા વર્કસ્પેસમાં જાઓ. ઇમેઇલ ચકાસણીનું કોઈ પગલું નથી.',
      submit: 'એકાઉન્ટ બનાવો',
      busy: 'એકાઉન્ટ બની રહ્યું છે…',
    },
  },
  home: 'Sankshep હોમ',
  headline: <>એક દસ્તાવેજ, <span className="font-serif">દરેક</span> ફોર્મેટ.</>,
  accountLabel: 'એકાઉન્ટ',
  email: 'ઇમેઇલ',
  password: 'પાસવર્ડ',
  newPassword: 'પાસવર્ડ બનાવો',
  yourPassword: 'તમારો પાસવર્ડ',
  showPassword: 'પાસવર્ડ બતાવો',
  hidePassword: 'પાસવર્ડ છુપાવો',
  rules: ['8 કે તેથી વધુ અક્ષરો', 'એક મોટો અક્ષર (A-Z)', 'એક નાનો અક્ષર (a-z)', 'એક અંક', 'એક વિશિષ્ટ ચિહ્ન'],
  met: '(પૂર્ણ)',
  notMet: '(અપૂર્ણ)',
  or: 'અથવા પહેલાં ફરીને જુઓ',
  demo: 'ડેમો એકાઉન્ટ સાથે આગળ વધો',
  enter: 'પ્રવેશ કરો',
  demoMissing: 'ડેમો એકાઉન્ટ હજી ડેટાબેઝમાં સેટ નથી. Supabase SQL Editor માં main/supabase/reset_accounts.sql ચલાવો.',
  error: gujaratiAuthError,
  disabledTitle: 'આ એકાઉન્ટ બંધ કરવામાં આવ્યું છે',
  disabledBody: (email: ReactNode) => (
    <>એડમિનિસ્ટ્રેટરે {email} ને બંધ કરી દીધું છે, તેથી તેનાથી સાઇન ઇન થઈ શકતું નથી. તમારા ડ્રાફ્ટ્સ અને હિસ્ટ્રી સુરક્ષિત છે. એકાઉન્ટ ફરી ચાલુ કરવા માટે એડમિનિસ્ટ્રેટરનો સંપર્ક કરો.</>
  ),
  disabledNext: 'ચાલુ થયા પછી, હંમેશાની જેમ સાઇન ઇન કરો.',
  contactAdmin: 'એડમિનનો સંપર્ક કરો',
}

export default t
