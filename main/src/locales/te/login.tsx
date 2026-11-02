import type { ReactNode } from 'react'
import type { LOGIN_COPY } from '../../pages/LoginPage'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function teluguAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ఇమెయిల్ లేదా పాస్‌వర్డ్ తప్పు.',
    'This account has been disabled by the administrator.': 'అడ్మినిస్ట్రేటర్ ఈ ఖాతాను నిలిపివేశారు.',
    'Too many attempts. Please wait a few minutes and try again.': 'చాలా ప్రయత్నాలు జరిగాయి. కొన్ని నిమిషాలు వేచి ఉండి మళ్లీ ప్రయత్నించండి.',
    'An account with this email already exists. Sign in instead.': 'ఈ ఇమెయిల్‌తో ఇప్పటికే ఒక ఖాతా ఉంది. బదులుగా సైన్ ఇన్ చేయండి.',
    'Enter a valid email address, like name@example.com.': 'name@example.com వంటి చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామాను నమోదు చేయండి.',
    [PASSWORD_POLICY_MESSAGE]: 'కనీసం 8 అక్షరాలు ఉండాలి, అందులో ఒక పెద్ద అక్షరం (A-Z), ఒక చిన్న అక్షరం (a-z), ఒక అంకె మరియు ఒక ప్రత్యేక చిహ్నం ఉండాలి.',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'సైన్-అప్ సెట్టింగ్ తప్పుగా ఉంది: Supabase లో ఇమెయిల్ నిర్ధారణ ఇంకా ఆన్‌లో ఉంది. సైట్ అడ్మిన్‌ను “Confirm email” నిలిపివేయమని అడగండి.'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `సైన్-ఇన్ సేవను సంప్రదించలేకపోయాము${network[1]}. మీ ఇంటర్నెట్ కనెక్షన్‌ని తనిఖీ చేసి, మళ్లీ ప్రయత్నించండి.`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” లో టైపింగ్ పొరపాటు ఉన్నట్లుంది. మీరు ${typo[2]} అని చెప్పాలనుకున్నారా?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” కు ఇమెయిల్ రాదు. చిరునామాలో టైపింగ్ పొరపాటు ఉందేమో తనిఖీ చేయండి.`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['కార్యనిర్వాహక సారాంశం', '5 స్లైడ్ల డెక్', 'LinkedIn పోస్ట్', 'వీడియో స్క్రిప్ట్', 'అడ్వైజరీ'],
  modes: {
    login: { tab: 'సైన్ ఇన్', title: 'మళ్లీ స్వాగతం.', lead: 'సైన్ ఇన్ చేసి, మీరు ఎక్కడ ఆపారో అక్కడి నుండి కొనసాగించండి.', submit: 'సైన్ ఇన్', busy: 'సైన్ ఇన్ అవుతోంది…' },
    signup: {
      tab: 'కొత్త ఖాతా',
      title: 'ఒక పత్రంతో ప్రారంభించండి.',
      lead: 'ఖాతాను సృష్టించి నేరుగా వర్క్‌స్పేస్‌లోకి వెళ్లండి. ఇమెయిల్ నిర్ధారణ దశ లేదు.',
      submit: 'ఖాతాను సృష్టించండి',
      busy: 'ఖాతా సృష్టిస్తోంది…',
    },
  },
  home: 'Sankshep హోమ్',
  headline: <>ఒక పత్రం, <span className="font-serif">ప్రతి</span> ఫార్మాట్.</>,
  accountLabel: 'ఖాతా',
  email: 'ఇమెయిల్',
  password: 'పాస్‌వర్డ్',
  newPassword: 'పాస్‌వర్డ్‌ను సృష్టించండి',
  yourPassword: 'మీ పాస్‌వర్డ్',
  showPassword: 'పాస్‌వర్డ్‌ను చూపించు',
  hidePassword: 'పాస్‌వర్డ్‌ను దాచు',
  rules: ['8 లేదా అంతకంటే ఎక్కువ అక్షరాలు', 'ఒక పెద్ద అక్షరం (A-Z)', 'ఒక చిన్న అక్షరం (a-z)', 'ఒక అంకె', 'ఒక ప్రత్యేక చిహ్నం'],
  met: '(పూర్తయింది)',
  notMet: '(పూర్తి కాలేదు)',
  or: 'లేదా ముందుగా చూసి రండి',
  demo: 'డెమో ఖాతాతో కొనసాగండి',
  enter: 'ప్రవేశించండి',
  demoMissing: 'డెమో ఖాతా ఇంకా డేటాబేస్‌లో సెట్ చేయబడలేదు. Supabase SQL Editor లో main/supabase/reset_accounts.sql నడపండి.',
  error: teluguAuthError,
  disabledTitle: 'ఈ ఖాతా నిలిపివేయబడింది',
  disabledBody: (email: ReactNode) => (
    <>అడ్మినిస్ట్రేటర్ {email} ను నిలిపివేశారు, కాబట్టి దీనితో సైన్ ఇన్ చేయలేరు. మీ డ్రాఫ్ట్‌లు మరియు హిస్టరీ సురక్షితంగా ఉంటాయి. ఖాతాను మళ్లీ ప్రారంభించడానికి అడ్మినిస్ట్రేటర్‌ను సంప్రదించండి.</>
  ),
  disabledNext: 'ప్రారంభించబడిన తర్వాత, సాధారణంలాగే సైన్ ఇన్ చేయండి.',
  contactAdmin: 'అడ్మిన్‌ను సంప్రదించండి',
}

export default t
