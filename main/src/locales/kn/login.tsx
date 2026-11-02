import type { LOGIN_COPY } from '../../pages/LoginPage'
import type { ReactNode } from 'react'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function hindiAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ತಪ್ಪು ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.',
    'This account has been disabled by the administrator.': 'ಈ ಖಾತೆಯನ್ನು ನಿರ್ವಾಹಕರು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿದ್ದಾರೆ.',
    'Too many attempts. Please wait a few minutes and try again.': 'ತುಂಬಾ ಪ್ರಯತ್ನಗಳು ನಡೆದಿವೆ. ದಯವಿಟ್ಟು ಕೆಲವು ನಿಮಿಷ ಕಾಯ್ದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'An account with this email already exists. Sign in instead.': 'ಈ ಇಮೇಲ್‌ನೊಂದಿಗೆ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ. ಬದಲಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
    'Enter a valid email address, like name@example.com.': 'ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ, ಉದಾಹರಣೆಗೆ name@example.com.',
    [PASSWORD_POLICY_MESSAGE]: 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಲಿ, ಅದರಲ್ಲಿ ಒಂದು ದೊಡ್ಡ ಅಕ್ಷರ (A-Z), ಒಂದು ಸಣ್ಣ ಅಕ್ಷರ (a-z), ಒಂದು ಸಂಖ್ಯೆ ಮತ್ತು ಒಂದು ವಿಶೇಷ ಚಿಹ್ನೆ ಇರಬೇಕು.',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'ಸೈನ್-ಅಪ್ ಸೆಟ್ಟಿಂಗ್ ತಪ್ಪಾಗಿದೆ: Supabase ನಲ್ಲಿ ಇಮೇಲ್ ದೃಢೀಕರಣ ಇನ್ನೂ ಚಾಲೆಯಲ್ಲಿದೆ. ಸೈಟ್ ನಿರ್ವಾಹಕರಿಗೆ “Confirm email” ಆಫ್ ಮಾಡಲು ಹೇಳಿ.'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `ಸೈನ್-ಇನ್ ಸೇವೆಯನ್ನು ತಲುಪಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ${network[1]}. ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” ನಲ್ಲಿ ಟೈಪಿಂಗ್ ದೋಷವಿರುವಂತೆ ತೋರುತ್ತಿದೆ. ನಿಮ್ಮ ಉದ್ದೇಶ ${typo[2]} ಎಂದಿತ್ತೇ?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” ಗೆ ಇಮೇಲ್ ಸ್ವೀಕರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ವಿಳಾಸದಲ್ಲಿ ಟೈಪಿಂಗ್ ದೋಷವಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಾರಾಂಶ', '5 ಸ್ಲೈಡ್‌ಗಳ ಡೆಕ್', 'LinkedIn ಪೋಸ್ಟ್', 'ವೀಡಿಯೊ ಸ್ಕ್ರಿಪ್ಟ್', 'ಸಲಹಾ ಟಿಪ್ಪಣಿ'],
  modes: {
    login: { tab: 'ಸೈನ್ ಇನ್', title: 'ಮತ್ತೆ ಸ್ವಾಗತ.', lead: 'ನೀವು ಎಲ್ಲಿ ನಿಲ್ಲಿಸಿದ್ದೀರೋ ಅಲ್ಲಿಂದ ಮುಂದುವರಿಯಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.', submit: 'ಸೈನ್ ಇನ್', busy: 'ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ…' },
    signup: {
      tab: 'ಖಾತೆ ರಚಿಸಿ',
      title: 'ಒಂದೇ ದಾಖಲೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ.',
      lead: 'ಖಾತೆಯನ್ನು ರಚಿಸಿ ಮತ್ತು ನೇರವಾಗಿ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗೆ ಹೋಗಿ. ಯಾವುದೇ ಇಮೇಲ್ ಹಂತವಿಲ್ಲ.',
      submit: 'ಖಾತೆ ರಚಿಸಿ',
      busy: 'ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ…',
    },
  },
  home: 'Sankshep ಮುಖಪುಟ',
  headline: <>ಒಂದು ದಾಖಲೆ, <span className="font-serif">ಪ್ರತಿ</span> ಫಾರ್ಮ್ಯಾಟ್.</>,
  accountLabel: 'ಖಾತೆ',
  email: 'ಇಮೇಲ್',
  password: 'ಪಾಸ್‌ವರ್ಡ್',
  newPassword: 'ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ',
  yourPassword: 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್',
  showPassword: 'ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ',
  hidePassword: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ',
  rules: ['8 ಅಥವಾ ಹೆಚ್ಚಿನ ಅಕ್ಷರಗಳು', 'ಒಂದು ದೊಡ್ಡ ಅಕ್ಷರ (A-Z)', 'ಒಂದು ಸಣ್ಣ ಅಕ್ಷರ (a-z)', 'ಒಂದು ಸಂಖ್ಯೆ', 'ಒಂದು ವಿಶೇಷ ಚಿಹ್ನೆ'],
  met: '(ಪೂರೈಸಿದೆ)',
  notMet: '(ಪೂರೈಸಿಲ್ಲ)',
  or: 'ಅಥವಾ ಮೊದಲು ಸುತ್ತಿ ನೋಡಿ',
  demo: 'ಡೆಮೋ ಖಾತೆಯೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ',
  enter: 'ಪ್ರವೇಶಿಸಿ',
  demoMissing: 'ಡೆಮೋ ಖಾತೆಯನ್ನು ಇನ್ನೂ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸೆಟಪ್ ಮಾಡಲಾಗಿಲ್ಲ. Supabase SQL Editor ನಲ್ಲಿ main/supabase/reset_accounts.sql ಅನ್ನು ರನ್ ಮಾಡಿ.',
  error: hindiAuthError,
  disabledTitle: 'ಈ ಖಾತೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
  disabledBody: (email: ReactNode) => (
    <>ಒಬ್ಬ ನಿರ್ವಾಹಕರು {email} ಅನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿದ್ದಾರೆ, ಆದ್ದರಿಂದ ಇದರಿಂದ ಸೈನ್ ಇನ್ ಮಾಡಲು ಆಗುವುದಿಲ್ಲ. ನಿಮ್ಮ ಡ್ರಾಫ್ಟ್‌ಗಳು ಮತ್ತು ಹಿಸ್ಟರಿ ಸುರಕ್ಷಿತವಾಗಿವೆ. ಖಾತೆಯನ್ನು ಮತ್ತೆ ಸಕ್ರಿಯಗೊಳಿಸಲು ನಿರ್ವಾಹಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.</>
  ),
  disabledNext: 'ಸಕ್ರಿಯಗೊಂಡ ನಂತರ, ಎಂದಿನಂತೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
  contactAdmin: 'ನಿರ್ವಾಹಕರನ್ನು ಸಂಪರ್ಕಿಸಿ',
}

export default t
