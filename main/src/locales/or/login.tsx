import type { ReactNode } from 'react'
import type { LOGIN_COPY } from '../../pages/LoginPage'

function hindiAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ଇମେଲ୍ ବା ପାସୱାର୍ଡ ଭୁଲ୍ ଅଛି।',
    'This account has been disabled by the administrator.': 'ଆଡମିନିଷ୍ଟ୍ରେଟର ଏହି ଆକାଉଣ୍ଟକୁ ବନ୍ଦ କରିଦେଇଛନ୍ତି।',
    'Too many attempts. Please wait a few minutes and try again.': 'ଅଧିକ ଚେଷ୍ଟା କରାଗଲା। କିଛି ମିନିଟ୍ ଅପେକ୍ଷା କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    'An account with this email already exists. Sign in instead.': 'ଏହି ଇମେଲ୍ ସହିତ ଏକ ଆକାଉଣ୍ଟ ପୂର୍ବରୁ ଅଛି। ଏହାର ବଦଳରେ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ।',
    'Enter a valid email address, like name@example.com.': 'ଏକ ବୈଧ ଇମେଲ୍ ଠିକଣା ଦିଅନ୍ତୁ, ଯେପରିକି name@example.com।',
    'କମ୍ ସେ କମ୍ 8 ଅକ୍ଷର ରଖନ୍ତୁ, ଯେଉଁଥିରେ ଗୋଟିଏ ବଡ଼ ଅକ୍ଷର (A-Z), ଗୋଟିଏ ଛୋଟ ଅକ୍ଷର (a-z), ଗୋଟିଏ ଅଙ୍କ ଏବଂ ଏକ ବିଶେଷ ଚିହ୍ନ ଥାଉ।': 'ସର୍ବନିମ୍ନ 8ଟି ଅକ୍ଷର ରଖନ୍ତୁ, ଯେଉଁଥିରେ ଗୋଟିଏ ବଡ଼ ଅକ୍ଷର (A-Z), ଗୋଟିଏ ସାନ ଅକ୍ଷର (a-z), ଗୋଟିଏ ଅଙ୍କ ଏବଂ ଗୋଟିଏ ବିଶେଷ ଚିହ୍ନ ଥିବ।',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'ସାଇନ୍-ଅପ୍ ସେଟିଂ ଭୁଲ୍ ଅଛି: Supabase ରେ ଇମେଲ୍ ଯାଞ୍ଚ ଏବେ ମଧ୍ୟ ଚାଲୁ ଅଛି। ସାଇଟ୍ ଆଡମିନ୍ ଙ୍କୁ “Confirm email” ବନ୍ଦ କରିବାକୁ କୁହନ୍ତୁ।'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `ସାଇନ୍-ଇନ୍ ସେବା ସହିତ ଯୋଗାଯୋଗ ହୋଇପାରିଲା ନାହିଁ${network[1]}। ଆପଣଙ୍କର ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” ରେ ଲେଖାରେ ଭୁଲ୍ ଥିଲା ଭଳି ଜଣାପଡୁଛି। ଆପଣଙ୍କର ଅଭିପ୍ରାୟ କ’ଣ ${typo[2]} ଥିଲା?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” କୁ ଇମେଲ୍ ଆସିପାରିବ ନାହିଁ। ଠିକଣାରେ ଲେଖାଭୁଲ୍ ଯାଞ୍ଚ କରନ୍ତୁ।`
  return message
}

const t: typeof LOGIN_COPY.en = {
  formats: ['କାର୍ଯ୍ୟନିର୍ବାହୀ ସାରାଂଶ', '5-ସ୍ଲାଇଡ୍ ଡେକ୍', 'LinkedIn ପୋଷ୍ଟ', 'ଭିଡିଓ ସ୍କ୍ରିପ୍ଟ', 'ଆଡଭାଇଜରୀ'],
  modes: {
    login: { tab: 'ସାଇନ୍ ଇନ୍', title: 'ପୁନର୍ବାର ସ୍ୱାଗତ।', lead: 'ଯେଉଁଠାରୁ ଛାଡିଥିଲେ ସେହିଠାରୁ ଆରମ୍ଭ କରିବାକୁ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ।', submit: 'ସାଇନ୍ ଇନ୍', busy: 'ସାଇନ୍ ଇନ୍ ହେଉଛି…' },
    signup: {
      tab: 'ଆକାଉଣ୍ଟ ତିଆରି କରନ୍ତୁ',
      title: 'ଗୋଟିଏ ଡକ୍ୟୁମେଣ୍ଟରୁ ଆରମ୍ଭ କରନ୍ତୁ।',
      lead: 'ଏକ ଆକାଉଣ୍ଟ ତିଆରି କରନ୍ତୁ ଏବଂ ସିଧାସଳଖ ୱାର୍କସ୍ପେସ୍ ଭିତରକୁ ଯାଆନ୍ତୁ। ଏଥିରେ କୌଣସି ଇମେଲ୍ ପର୍ଯ୍ୟାୟ ନାହିଁ।',
      submit: 'ଆକାଉଣ୍ଟ ତିଆରି କରନ୍ତୁ',
      busy: 'ଆକାଉଣ୍ଟ ତିଆରି ହେଉଛି…',
    },
  },
  home: 'Sankshep ହୋମ୍',
  headline: <>ଗୋଟିଏ ଡକ୍ୟୁମେଣ୍ଟ, <span className="font-serif">ପ୍ରତିଟି</span> ଫର୍ମାଟ୍।</>,
  accountLabel: 'ଆକାଉଣ୍ଟ',
  email: 'ଇମେଲ୍',
  password: 'ପାସୱାର୍ଡ',
  newPassword: 'ପାସୱାର୍ଡ ତିଆରି କରନ୍ତୁ',
  yourPassword: 'ଆପଣଙ୍କର ପାସୱାର୍ଡ',
  showPassword: 'ପାସୱାର୍ଡ ଦେଖାନ୍ତୁ',
  hidePassword: 'ପାସୱାର୍ଡ ଲୁଚାନ୍ତୁ',
  rules: ['8 ବା ଅଧିକ ଅକ୍ଷର', 'ଗୋଟିଏ ବଡ଼ ଅକ୍ଷର (A-Z)', 'ଗୋଟିଏ ସାନ ଅକ୍ଷର (a-z)', 'ଗୋଟିଏ ଅଙ୍କ', 'ଗୋଟିଏ ବିଶେଷ ଚିହ୍ନ'],
  met: '(ପୂରଣ ହୋଇଛି)',
  notMet: '(ପୂରଣ ହୋଇନାହିଁ)',
  or: 'ଅଥବା ପ୍ରଥମେ ବୁଲି ଦେଖନ୍ତୁ',
  demo: 'ଡେମୋ ଆକାଉଣ୍ଟ ସହିତ ଜାରି ରଖନ୍ତୁ',
  enter: 'ପ୍ରବେଶ କରନ୍ତୁ',
  demoMissing: 'ଡେମୋ ଆକାଉଣ୍ଟ ଏଯାଏଁ ଡାଟାବେସରେ ସେଟ୍ ହୋଇନାହିଁ। Supabase SQL Editor ରେ main/supabase/reset_accounts.sql ଚଲାନ୍ତୁ।',
  error: (message: string) => hindiAuthError(message),
  disabledTitle: 'ଏହି ଆକାଉଣ୍ଟକୁ ନିଷ୍କ୍ରିୟ କରାଯାଇଛି',
  disabledBody: (email: React.ReactNode) => (
    <>ଜଣେ ପ୍ରଶାସକ {email} କୁ ନିଷ୍କ୍ରିୟ କରିଛନ୍ତି, ତେଣୁ ଏହା ଦ୍ୱାରା ସାଇନ୍ ଇନ୍ ହୋଇପାରିବ ନାହିଁ। ଆପଣଙ୍କର ଡ୍ରାଫ୍ଟ ଏବଂ ଇତିହାସ ସୁରକ୍ଷିତ ଅଛି। ଆକାଉଣ୍ଟକୁ ପୁନର୍ବାର ସକ୍ରିୟ କରିବା ପାଇଁ ପ୍ରଶାସକଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।</>
  ),
  disabledNext: 'ଥରେ ଏହା ସକ୍ରିୟ ହୋଇଗଲେ, ସାଧାରଣ ଭାବରେ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ।',
  contactAdmin: 'ଆଡମିନ୍ ଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ',
}

export default t
