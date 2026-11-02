import type { ReactNode } from 'react'
import type { LOGIN_COPY } from '../../pages/LoginPage'
import { PASSWORD_POLICY_MESSAGE } from '../../lib/password'

function marathiAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ईमेल किंवा पासवर्ड चुकीचा आहे.',
    'This account has been disabled by the administrator.': 'ॲडमिनिस्ट्रेटरने हे खाते बंद केले आहे.',
    'Too many attempts. Please wait a few minutes and try again.': 'खूप जास्त प्रयत्न झाले. कृपया काही मिनिटे थांबून पुन्हा प्रयत्न करा.',
    'An account with this email already exists. Sign in instead.': 'या ईमेलवर खाते आधीपासूनच अस्तित्त्वात आहे. त्याऐवजी साइन इन करा.',
    'Enter a valid email address, like name@example.com.': 'योग्य ईमेल पत्ता टाका, जसे name@example.com.',
    [PASSWORD_POLICY_MESSAGE]: 'कमीत कमी 8 अक्षरे असावीत, ज्यामध्ये एक मोठे अक्षर (A-Z), एक लहान अक्षर (a-z), एक अंक आणि एक विशेष चिन्ह असावे.',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'साइन-अप सेटिंग चुकीची आहे: Supabase मध्ये ईमेल पडताळणी अद्याप चालू आहे. साइट ॲडमिनला “Confirm email” बंद करण्यास सांगा.'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `साइन-इन सेवेपर्यंत पोहोचता आले नाही${network[1]}. तुमचे इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” मध्ये टायपिंगची चूक वाटते. तुम्हाला ${typo[2]} म्हणायचे होते का?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” वर ईमेल येऊ शकत नाही. पत्त्यात टायपिंगची चूक आहे का ते तपासा.`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['कार्यकारी सारांश', '5-स्लाइड डेक', 'LinkedIn पोस्ट', 'व्हिडिओ स्क्रिप्ट', 'ॲडव्हायझरी'],
  modes: {
    login: { tab: 'साइन इन', title: 'पुन्हा स्वागत आहे.', lead: 'तुमचे काम जिथे सोडले होते तिथून पुढे सुरू करण्यासाठी साइन इन करा.', submit: 'साइन इन करा', busy: 'साइन इन होत आहे…' },
    signup: {
      tab: 'खाते तयार करा',
      title: 'एका दस्तऐवजापासून सुरुवात करा.',
      lead: 'खाते तयार करा आणि थेट वर्कस्पेसमध्ये पोहोचा. ईमेल पडताळणीची कोणतीही पायरी नाही.',
      submit: 'खाते तयार करा',
      busy: 'खाते तयार होत आहे…',
    },
  },
  home: 'Sankshep होम',
  headline: <>एक दस्तऐवज, <span className="font-serif">प्रत्येक</span> फॉरमॅट.</>,
  accountLabel: 'खाते',
  email: 'ईमेल',
  password: 'पासवर्ड',
  newPassword: 'पासवर्ड तयार करा',
  yourPassword: 'तुमचा पासवर्ड',
  showPassword: 'पासवर्ड दाखवा',
  hidePassword: 'पासवर्ड लपवा',
  rules: ['8 किंवा अधिक अक्षरे', 'एक मोठे अक्षर (A-Z)', 'एक लहान अक्षर (a-z)', 'एक अंक', 'एक विशेष चिन्ह'],
  met: '(पूर्ण)',
  notMet: '(अपूर्ण)',
  or: 'किंवा आधी पाहणी करा',
  demo: 'डेमो खात्यासह पुढे जा',
  enter: 'प्रवेश करा',
  demoMissing: 'डेमो खाते अजून डेटाबेसमध्ये सेट केलेले नाही. Supabase SQL Editor मध्ये main/supabase/reset_accounts.sql चालवा.',
  error: marathiAuthError,
  disabledTitle: 'हे खाते बंद करण्यात आले आहे',
  disabledBody: (email: ReactNode) => (
    <>ॲडमिनिस्ट्रेटरने {email} हे खाते बंद केले आहे, त्यामुळे यातून साइन इन करता येणार नाही. तुमचे मसुदे आणि हिस्ट्री सुरक्षित आहेत. खाते पुन्हा सुरू करण्यासाठी ॲडमिनिस्ट्रेटरशी संपर्क साधा.</>
  ),
  disabledNext: 'खाते सुरू झाल्यावर नेहमीप्रमाणे साइन इन करा.',
  contactAdmin: 'ॲडमिनशी संपर्क साधा',
}

export default t
