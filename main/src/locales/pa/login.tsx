import type { LOGIN_COPY } from '../../pages/LoginPage'
import type { ReactNode } from 'react'
import { PASSWORD_RULES, PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function hindiAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ਈਮੇਲ ਜਾਂ ਪਾਸਵਰਡ ਗ਼ਲਤ ਹੈ।',
    'This account has been disabled by the administrator.': 'ਐਡਮਿਨੇਸਟਰੇਟਰ ਨੇ ਇਹ ਅਕਾਊਂਟ ਬੰਦ ਕਰ ਦਿੱਤਾ ਹੈ।',
    'Too many attempts. Please wait a few minutes and try again.': 'ਬਹੁਤ ਜ਼ਿਆਦਾ ਕੋਸ਼ਿਸ਼ਾਂ ਹੋਈਆਂ। ਕੁਝ ਮਿੰਟ ਰੁਕ ਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    'An account with this email already exists. Sign in instead.': 'ਇਸ ਈਮੇਲ ਨਾਲ ਅਕਾਊਂਟ ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ। ਇਸ ਦੀ ਬਜਾਏ ਸਾਈਨ ਇਨ ਕਰੋ।',
    'Enter a valid email address, like name@example.com.': 'ਇੱਕ ਸਹੀ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ, ਜਿਵੇਂ name@example.com।',
    [PASSWORD_POLICY_MESSAGE]: 'ਘੱਟੋ-ਘੱਟ 8 ਅੱਖਰ ਰੱਖੋ, ਜਿਨ੍ਹਾਂ ਵਿੱਚ ਇੱਕ ਵੱਡਾ ਅੱਖਰ (A-Z), ਇੱਕ ਛੋਟਾ ਅੱਖਰ (a-z), ਇੱਕ ਅੰਕ ਅਤੇ ਇੱਕ ਵਿਸ਼ੇਸ਼ ਚਿੰਨ੍ਹ ਹੋਵੇ।',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'ਸਾਈਨ-ਅੱਪ ਦੀ ਸੈਟਿੰਗ ਗ਼ਲਤ ਹੈ: Supabase ਵਿੱਚ ਈਮੇਲ ਪੁਸ਼ਟੀ ਅਜੇ ਵੀ ਚਾਲੂ ਹੈ। ਸਾਈਟ ਐਡਮਿਨ ਨੂੰ “Confirm email” ਬੰਦ ਕਰਨ ਲਈ ਕਹੋ।'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `ਸਾਈਨ-ਇਨ ਸੇਵਾ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕੇ${network[1]}। ਆਪਣਾ ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਚੈੱਕ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” ਵਿੱਚ ਟਾਈਪਿੰਗ ਦੀ ਗ਼ਲਤੀ ਲੱਗਦੀ ਹੈ। ਕੀ ਤੁਹਾਡਾ ਮਤਲਬ ${typo[2]} ਸੀ?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” \'ਤੇ ਈਮੇਲ ਨਹੀਂ ਆ ਸਕਦਾ। ਪਤੇ ਵਿੱਚ ਟਾਈਪਿੰਗ ਦੀ ਗ਼ਲਤੀ ਚੈੱਕ ਕਰੋ।`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['Executive Summary', '5-Slide Deck', 'LinkedIn ਪੋਸਟ', 'Video Script', 'Advisory'],
  modes: {
    login: { tab: 'ਸਾਈਨ ਇਨ', title: 'ਜੀ ਆਇਆਂ ਨੂੰ।', lead: 'ਜਿੱਥੋਂ ਛੱਡਿਆ ਸੀ, ਉੱਥੋਂ ਹੀ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।', submit: 'ਸਾਈਨ ਇਨ', busy: 'ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ…' },
    signup: {
      tab: 'ਅਕਾਊਂਟ ਬਣਾਓ',
      title: 'ਇੱਕ ਦਸਤਾਵੇਜ਼ ਨਾਲ ਸ਼ੁਰੂ ਕਰੋ।',
      lead: 'ਇੱਕ ਅਕਾਊਂਟ ਬਣਾਓ ਅਤੇ ਸਿੱਧੇ ਵਰਕਸਪੇਸ ਵਿੱਚ ਜਾਓ। ਇਸ ਵਿੱਚ ਕੋਈ ਈਮੇਲ ਪੜਾਅ ਨਹੀਂ ਹੈ।',
      submit: 'ਅਕਾਊਂਟ ਬਣਾਓ',
      busy: 'ਅਕਾਊਂਟ ਬਣ ਰਿਹਾ ਹੈ…',
    },
  },
  home: 'Sankshep ਹੋਮ',
  headline: <>ਇੱਕ ਦਸਤਾਵੇਜ਼, <span className="font-serif">ਹਰ</span> ਫਾਰਮੈਟ।</>,
  accountLabel: 'ਅਕਾਊਂਟ',
  email: 'ਈਮੇਲ',
  password: 'ਪਾਸਵਰਡ',
  newPassword: 'ਇੱਕ ਪਾਸਵਰਡ ਬਣਾਓ',
  yourPassword: 'ਤੁਹਾਡਾ ਪਾਸਵਰਡ',
  showPassword: 'ਪਾਸਵਰਡ ਦਿਖਾਓ',
  hidePassword: 'ਪਾਸਵਰਡ ਛੁਪਾਓ',
  rules: PASSWORD_RULES.map((r) => r.label) as string[],
  met: '(ਪੂਰਾ)',
  notMet: '(ਅਧੂਰਾ)',
  or: 'ਜਾਂ ਪਹਿਲਾਂ ਆਲੇ-ਦੁਆਲੇ ਦੇਖੋ',
  demo: 'ਡੈਮੋ ਅਕਾਊਂਟ ਨਾਲ ਜਾਰੀ ਰੱਖੋ',
  enter: 'ਦਾਖਲ ਹੋਵੋ',
  demoMissing: 'ਡੈਮੋ ਅਕਾਊਂਟ ਅਜੇ ਡਾਟਾਬੇਸ ਵਿੱਚ ਸੈੱਟ ਨਹੀਂ ਕੀਤਾ ਗਿਆ ਹੈ। Supabase SQL Editor ਵਿੱਚ main/supabase/reset_accounts.sql ਚਲਾਓ।',
  error: hindiAuthError,
  disabledTitle: 'ਇਹ ਅਕਾਊਂਟ ਬੰਦ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ',
  disabledBody: (email: ReactNode) => (
    <>ਇੱਕ ਐਡਮਿਨੇਸਟਰੇਟਰ ਨੇ {email} ਨੂੰ ਬੰਦ ਕਰ ਦਿੱਤਾ ਹੈ, ਇਸ ਲਈ ਇਸ ਨਾਲ ਸਾਈਨ ਇਨ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ। ਤੁਹਾਡੇ ਡਰਾਫ਼ਟ ਅਤੇ ਹਿਸਟਰੀ ਸੁਰੱਖਿਅਤ ਹਨ। ਅਕਾਊਂਟ ਨੂੰ ਦੁਬਾਰਾ ਚਾਲੂ ਕਰਵਾਉਣ ਲਈ ਐਡਮਿਨੇਸਟਰੇਟਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।</>
  ),
  disabledNext: 'ਇਸਦੇ ਚਾਲੂ ਹੋਣ \'ਤੇ, ਹਮੇਸ਼ਾ ਵਾਂਗ ਸਾਈਨ ਇਨ ਕਰੋ।',
  contactAdmin: 'ਐਡਮਿਨ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
}

export default t
