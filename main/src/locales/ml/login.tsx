import type { LOGIN_COPY } from '../../pages/LoginPage'
import type { ReactNode } from 'react'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function malayalamAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ഇമെയിലും പാസ്‌വേഡും തെറ്റാണ്.',
    'This account has been disabled by the administrator.': 'ഈ അക്കൗണ്ട് അഡ്മിനിസ്ട്രേറ്റർ നിർജീവമാക്കിയിരിക്കുന്നു.',
    'Too many attempts. Please wait a few minutes and try again.': 'അധികം ശ്രമങ്ങൾ നടന്നു. കുറച്ച് മിനിറ്റ് കാത്തുനിന്ന് വീണ്ടും ശ്രമിക്കുക.',
    'An account with this email already exists. Sign in instead.': 'ഈ ഇമെയിലിൽ അക്കൗണ്ട് നിലവിലുണ്ട്. പകരം സൈൻ ഇൻ ചെയ്യുക.',
    'Enter a valid email address, like name@example.com.': 'ശരിയായ ഇമെയിൽ വിലാസം നൽകുക, ഉദാഹരണത്തിന് name@example.com.',
    [PASSWORD_POLICY_MESSAGE]: 'കുറഞ്ഞത് 8 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം, അതിൽ ഒരു വലിയ അക്ഷരം (A-Z), ചെറിയ അക്ഷരം (a-z), ഒരു അക്കം, ഒരു പ്രത്യേക ചിഹ്നം എന്നിവ ഉൾപ്പെടണം.',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'സൈൻ-അപ്പ് ക്രമീകരണം തെറ്റാണ്: Supabase-ൽ ഇമെയിൽ സ്ഥിരീകരണ സംവിധാനം ഇപ്പോഴും സജീവമാണ്. സൈറ്റ് അഡ്മിനോട് “Confirm email” ഓഫ് ചെയ്യാൻ ആവശ്യപ്പെടുക.'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `സൈൻ-ഇൻ സേവനവുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല${network[1]}. നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” എന്നതിൽ അക്ഷരത്തെറ്റ് ഉള്ളതായി തോന്നുന്നു. ${typo[2]} എന്നാണോ ഉദ്ദേശിച്ചത്?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” വിലാസത്തിലേക്ക് ഇമെയിൽ സ്വീകരിക്കാൻ കഴിയില്ല. വിലാസത്തിൽ അക്ഷരത്തെറ്റുകൾ ഉണ്ടോയെന്ന് പരിശോധിക്കുക.`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['എക്സിക്യൂട്ടീവ് സംഗ്രഹം', '5 സ്ലൈഡ് ഡെക്ക്', 'LinkedIn പോസ്റ്റ്', 'വീഡിയോ സ്ക്രിപ്റ്റ്', 'ഉപദേശക കുറിപ്പ്'],
  modes: {
    login: { tab: 'സൈൻ ഇൻ', title: 'വീണ്ടും സ്വാഗതം.', lead: 'നിങ്ങൾ നിർത്തിയിടത്തുനിന്ന് തുടരാൻ സൈൻ ഇൻ ചെയ്യുക.', submit: 'സൈൻ ഇൻ', busy: 'സൈൻ ഇൻ ചെയ്യുന്നു…' },
    signup: {
      tab: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക',
      title: 'ഒരു പ്രമാണത്തിൽ നിന്ന് തുടങ്ങൂ.',
      lead: 'ഒരു അക്കൗണ്ട് സൃഷ്ടിച്ച് നേരെ വർക്ക്സ്പേസിലേക്ക് പ്രവേശിക്കുക. ഇമെയിൽ പരിശോധനയുടെ പടികൾ ഇല്ല.',
      submit: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക',
      busy: 'അക്കൗണ്ട് സൃഷ്ടിക്കുന്നു…',
    },
  },
  home: 'Sankshep ഹോം',
  headline: <>ഒരു പ്രമാണം, <span className="font-serif">എല്ലാ</span> ഫോർമാറ്റിലും.</>,
  accountLabel: 'അക്കൗണ്ട്',
  email: 'ഇമെയിൽ',
  password: 'പാസ്‌വേഡ്',
  newPassword: 'ഒരു പാസ്‌വേഡ് സൃഷ്ടിക്കുക',
  yourPassword: 'നിങ്ങളുടെ പാസ്‌വേഡ്',
  showPassword: 'പാസ്‌വേഡ് കാണിക്കുക',
  hidePassword: 'പാസ്‌വേഡ് മറയ്ക്കുക',
  rules: ['8 അല്ലെങ്കിൽ കൂടുതൽ അക്ഷരങ്ങൾ', 'ഒരു വലിയ അക്ഷരം (A-Z)', 'ഒരു ചെറിയ അക്ഷരം (a-z)', 'ഒരു അക്കം', 'ഒരു പ്രത്യേക ചിഹ്നം'],
  met: '(പൂർത്തിയായി)',
  notMet: '(പൂർത്തിയായില്ല)',
  or: 'അല്ലെങ്കിൽ ആദ്യം ചുറ്റിക്കാണുക',
  demo: 'ഡെമോ അക്കൗണ്ട് ഉപയോഗിച്ച് തുടരുക',
  enter: 'പ്രവേശിക്കുക',
  demoMissing: 'ഡെമോ അക്കൗണ്ട് ഡാറ്റാബേസിൽ സജ്ജീകരിച്ചിട്ടില്ല. Supabase SQL എഡിറ്ററിൽ main/supabase/reset_accounts.sql പ്രവർത്തിപ്പിക്കുക.',
  error: malayalamAuthError,
  disabledTitle: 'ഈ അക്കൗണ്ട് നിർജീവമാക്കിയിരിക്കുന്നു',
  disabledBody: (email: ReactNode) => (
    <>ഒരു അഡ്മിനിസ്ട്രേറ്റർ {email} നിർജീവമാക്കിയിരിക്കുന്നു, അതിനാൽ ഇതിലൂടെ സൈൻ ഇൻ ചെയ്യാനാവില്ല. നിങ്ങളുടെ ഡ്രാഫ്റ്റുകളും ഹിസ്റ്ററിയും സൂക്ഷിച്ചിട്ടുണ്ട്. അക്കൗണ്ട് വീണ്ടും സജീവമാക്കാൻ അഡ്മിനിസ്ട്രേറ്ററെ ബന്ധപ്പെടുക.</>
  ),
  disabledNext: 'സജീവമാക്കിയ ശേഷം, പതിവുപോലെ സൈൻ ഇൻ ചെയ്യുക.',
  contactAdmin: 'അഡ്മിനെ ബന്ധപ്പെടുക',
}

export default t
