import { Link } from 'react-router-dom'
import { GITHUB_URL } from '../../components/site/SiteChrome'
import { useCopy } from '../../i18n'
import { LegalLayout, type LegalSection } from './LegalLayout'

const ISSUES_URL = GITHUB_URL.replace(/\.git$/, '') + '/issues'

// The Hindi sections mirror the English ones one for one (same ids, so links to #sections work in both).
const SECTIONS_EN: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreeing to these terms',
    body: (
      <>
        <p>
          These terms apply to the Sankshep.ai website and workspace (“Sankshep.ai”, “the service”), built by the team Neural Ninjas VGEC
          (“we”, “us”). By creating an account or using the workspace, you agree to them. If you do not agree, please do not use the service.
        </p>
        <p>They were written by the team for this student project and have not been reviewed by a lawyer.</p>
      </>
    ),
  },
  {
    id: 'the-service',
    title: 'The service',
    body: (
      <p>
        Sankshep.ai is a Smart India Hackathon prototype that turns source material into drafts in formats such as executive summaries,
        social posts, slide outlines and translations. It is provided free of charge, for evaluation and learning. Features may change,
        break or be removed at any time, and the service may be paused or shut down without notice.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: (
      <>
        <ul>
          <li>Use an email address you control and keep your password to yourself. You are responsible for what happens under your account.</li>
          <li>The shared demo account is open to everyone. Treat anything you put into it as public.</li>
          <li>We may suspend or delete accounts that break these terms or put the service or other users at risk.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>submit content that is unlawful, or that you do not have the right to use;</li>
          <li>use the service to create content meant to harass, defraud, impersonate or mislead people;</li>
          <li>try to access other people’s accounts or data, or get around the service’s access controls;</li>
          <li>overload the service with automated or high-volume requests, or interfere with its operation;</li>
          <li>break the usage policies of the AI provider whose model you use.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'Your content',
    body: (
      <p>
        You keep whatever rights you have in the material you submit and in the drafts generated from it. You give us permission to process
        and store that material only as needed to run the service, as described in the{' '}
        <Link to="/privacy-policy">Privacy Policy</Link>, including sending it to the AI provider you select.
      </p>
    ),
  },
  {
    id: 'ai-output',
    title: 'AI-generated drafts',
    body: (
      <>
        <p>
          Drafts are written by AI models. They can be wrong, incomplete or out of date, and they can include statements or numbers that are
          not in your source. <strong>Check every draft before you use or publish it.</strong> You are responsible for what you do with them.
        </p>
        <p>Nothing Sankshep.ai produces is legal, financial, medical or other professional advice.</p>
      </>
    ),
  },
  {
    id: 'providers-and-keys',
    title: 'AI providers and your API keys',
    body: (
      <p>
        Generation is performed by third-party providers (Groq, Google’s Gemini API and Mistral AI), and their own terms apply to that use.
        If you add your own API key, any usage and charges on that key are between you and the provider. We are not responsible for a
        provider’s outages, changes, pricing or handling of your requests.
      </p>
    ),
  },
  {
    id: 'our-rights',
    title: 'Our intellectual property',
    body: (
      <p>
        The Sankshep.ai name, design and software belong to the team. The source code is published on{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>; publishing it does not by itself grant a licence to reuse
        it, unless the repository states one.
      </p>
    ),
  },
  {
    id: 'disclaimer',
    title: 'No warranty',
    body: (
      <p>
        The service is provided “as is” and “as available”, without warranties of any kind, including that it will be accurate, uninterrupted,
        secure or fit for a particular purpose.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        To the fullest extent the law allows, we are not liable for any indirect, incidental or consequential loss, or for loss of data,
        profits or reputation, arising from your use of the service or of any draft it produces. The service is free, and our total liability
        to you is limited accordingly.
      </p>
    ),
  },
  {
    id: 'ending',
    title: 'Ending your use',
    body: (
      <p>
        You can stop using Sankshep.ai at any time and delete your account from the account menu in the workspace, which permanently removes
        your data. We may end or suspend access as described under Your account.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: <p>These terms are governed by the laws of India. Any dispute is subject to the courts of Ahmedabad, Gujarat.</p>,
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: <p>We may update these terms. When we do, we change the date at the top; continuing to use the service means you accept the update.</p>,
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these terms go to the team through the project’s{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>.
      </p>
    ),
  },
]

const SECTIONS_HI: LegalSection[] = [
  {
    id: 'agreement',
    title: 'इन शर्तों से सहमति',
    body: (
      <>
        <p>
          ये शर्तें Sankshep.ai वेबसाइट और वर्कस्पेस (“Sankshep.ai”, “सेवा”) पर लागू होती हैं, जिसे टीम Neural Ninjas VGEC (“हम”) ने
          बनाया है। अकाउंट बनाकर या वर्कस्पेस का इस्तेमाल करके आप इन शर्तों से सहमत होते हैं। अगर आप सहमत नहीं हैं, तो कृपया सेवा का
          इस्तेमाल न करें।
        </p>
        <p>ये शर्तें टीम ने इस छात्र प्रोजेक्ट के लिए लिखी हैं और किसी वकील ने इनकी समीक्षा नहीं की है।</p>
      </>
    ),
  },
  {
    id: 'the-service',
    title: 'सेवा',
    body: (
      <p>
        Sankshep.ai स्मार्ट इंडिया हैकाथॉन का एक प्रोटोटाइप है, जो स्रोत सामग्री से कार्यकारी सारांश, सोशल पोस्ट, स्लाइड आउटलाइन और
        अनुवाद जैसे फ़ॉर्मेट में ड्राफ़्ट बनाता है। यह मूल्यांकन और सीखने के लिए मुफ़्त दिया जाता है। फ़ीचर कभी भी बदल सकते हैं, काम करना
        बंद कर सकते हैं या हटाए जा सकते हैं, और सेवा बिना सूचना के रोकी या बंद की जा सकती है।
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'आपका अकाउंट',
    body: (
      <>
        <ul>
          <li>ऐसा ईमेल पता इस्तेमाल करें जो आपके नियंत्रण में हो, और अपना पासवर्ड किसी को न बताएँ। आपके अकाउंट से जो कुछ भी होता है, उसकी ज़िम्मेदारी आपकी है।</li>
          <li>साझा डेमो अकाउंट सबके लिए खुला है। उसमें डाली गई हर चीज़ को सार्वजनिक मानें।</li>
          <li>जो अकाउंट इन शर्तों को तोड़ते हैं या सेवा या दूसरे उपयोगकर्ताओं को जोखिम में डालते हैं, उन्हें हम निलंबित कर सकते हैं या हटा सकते हैं।</li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'स्वीकार्य उपयोग',
    body: (
      <>
        <p>आप सहमत हैं कि आप:</p>
        <ul>
          <li>ऐसा कंटेंट जमा नहीं करेंगे जो ग़ैरक़ानूनी हो, या जिसे इस्तेमाल करने का आपको अधिकार न हो;</li>
          <li>सेवा से ऐसा कंटेंट नहीं बनाएँगे जिसका मक़सद लोगों को परेशान करना, धोखा देना, किसी और का रूप धरना या गुमराह करना हो;</li>
          <li>दूसरे लोगों के अकाउंट या डेटा तक पहुँचने, या सेवा के एक्सेस नियंत्रणों को दरकिनार करने की कोशिश नहीं करेंगे;</li>
          <li>स्वचालित या बहुत ज़्यादा अनुरोधों से सेवा पर बोझ नहीं डालेंगे, या उसके संचालन में बाधा नहीं डालेंगे;</li>
          <li>जिस AI प्रोवाइडर का मॉडल आप इस्तेमाल करते हैं, उसकी उपयोग नीतियाँ नहीं तोड़ेंगे।</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'आपका कंटेंट',
    body: (
      <p>
        आप जो सामग्री जमा करते हैं और उससे बने ड्राफ़्ट पर आपके जो भी अधिकार हैं, वे आपके ही रहते हैं। आप हमें उस सामग्री को सिर्फ़ उतना
        प्रोसेस और स्टोर करने की अनुमति देते हैं जितना सेवा चलाने के लिए ज़रूरी है, जैसा कि <Link to="/privacy-policy">गोपनीयता नीति</Link>{' '}
        में बताया गया है, जिसमें उसे आपके चुने हुए AI प्रोवाइडर को भेजना भी शामिल है।
      </p>
    ),
  },
  {
    id: 'ai-output',
    title: 'AI से बने ड्राफ़्ट',
    body: (
      <>
        <p>
          ड्राफ़्ट AI मॉडल लिखते हैं। वे ग़लत, अधूरे या पुराने हो सकते हैं, और उनमें ऐसे कथन या आँकड़े हो सकते हैं जो आपके स्रोत में नहीं
          हैं। <strong>किसी भी ड्राफ़्ट को इस्तेमाल या प्रकाशित करने से पहले जाँच लें।</strong> उनके साथ आप जो करते हैं, उसकी ज़िम्मेदारी
          आपकी है।
        </p>
        <p>Sankshep.ai जो कुछ भी बनाता है, वह क़ानूनी, वित्तीय, चिकित्सा या कोई अन्य पेशेवर सलाह नहीं है।</p>
      </>
    ),
  },
  {
    id: 'providers-and-keys',
    title: 'AI प्रोवाइडर और आपकी API कुंजियाँ',
    body: (
      <p>
        ड्राफ़्ट तीसरे पक्ष के प्रोवाइडर (Groq, Google का Gemini API और Mistral AI) बनाते हैं, और उस उपयोग पर उनकी अपनी शर्तें लागू होती
        हैं। अगर आप अपनी API कुंजी जोड़ते हैं, तो उस कुंजी पर होने वाला उपयोग और शुल्क आपके और प्रोवाइडर के बीच का मामला है। किसी
        प्रोवाइडर की रुकावटों, बदलावों, क़ीमतों या आपके अनुरोधों को संभालने के तरीक़े के लिए हम ज़िम्मेदार नहीं हैं।
      </p>
    ),
  },
  {
    id: 'our-rights',
    title: 'हमारी बौद्धिक संपदा',
    body: (
      <p>
        Sankshep.ai का नाम, डिज़ाइन और सॉफ़्टवेयर टीम का है। सोर्स कोड{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a> पर प्रकाशित है; उसे प्रकाशित करने भर से उसे दोबारा
        इस्तेमाल करने का लाइसेंस नहीं मिल जाता, जब तक कि रिपॉज़िटरी में कोई लाइसेंस न दिया गया हो।
      </p>
    ),
  },
  {
    id: 'disclaimer',
    title: 'कोई वारंटी नहीं',
    body: (
      <p>
        सेवा “जैसी है” और “जब उपलब्ध हो” के आधार पर दी जाती है, बिना किसी भी तरह की वारंटी के, जिसमें यह वारंटी भी शामिल है कि वह सटीक,
        निर्बाध, सुरक्षित या किसी ख़ास उद्देश्य के लिए उपयुक्त होगी।
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'दायित्व की सीमा',
    body: (
      <p>
        क़ानून जहाँ तक अनुमति देता है, सेवा या उससे बने किसी भी ड्राफ़्ट के इस्तेमाल से होने वाले किसी भी अप्रत्यक्ष, आकस्मिक या परिणामी
        नुक़सान, या डेटा, मुनाफ़े या प्रतिष्ठा के नुक़सान के लिए हम उत्तरदायी नहीं हैं। सेवा मुफ़्त है, और आपके प्रति हमारा कुल दायित्व उसी
        के अनुसार सीमित है।
      </p>
    ),
  },
  {
    id: 'ending',
    title: 'इस्तेमाल बंद करना',
    body: (
      <p>
        आप कभी भी Sankshep.ai का इस्तेमाल बंद कर सकते हैं और वर्कस्पेस के अकाउंट मेन्यू से अपना अकाउंट हटा सकते हैं, जिससे आपका डेटा
        स्थायी रूप से मिट जाता है। हम “आपका अकाउंट” में बताए अनुसार एक्सेस बंद या निलंबित कर सकते हैं।
      </p>
    ),
  },
  {
    id: 'law',
    title: 'लागू क़ानून',
    body: <p>ये शर्तें भारत के क़ानूनों के अधीन हैं। कोई भी विवाद अहमदाबाद, गुजरात की अदालतों के अधिकार क्षेत्र में होगा।</p>,
  },
  {
    id: 'changes',
    title: 'इन शर्तों में बदलाव',
    body: <p>हम इन शर्तों को अपडेट कर सकते हैं। ऐसा करने पर हम ऊपर दी गई तारीख़ बदल देते हैं; सेवा का इस्तेमाल जारी रखने का अर्थ है कि आप अपडेट स्वीकार करते हैं।</p>,
  },
  {
    id: 'contact',
    title: 'संपर्क',
    body: (
      <p>
        इन शर्तों से जुड़े सवाल प्रोजेक्ट के{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">GitHub issues पेज</a> के ज़रिए टीम तक भेजें।
      </p>
    ),
  },
]

const en = {
  title: 'Terms and Conditions',
  updated: 'September 25, 2026',
  sections: SECTIONS_EN,
  sibling: { label: 'Privacy Policy', to: '/privacy-policy' },
  summary: (
    <>
      <p>Sankshep.ai is a <strong>free student prototype</strong>, offered as is. It can change or stop.</p>
      <p>AI drafts can be wrong. <strong>Check them before you use them.</strong> Your content stays yours.</p>
      <p>Don’t misuse it, and remember the <strong>demo account is shared</strong> with everyone.</p>
    </>
  ),
}

const hi: typeof en = {
  title: 'नियम और शर्तें',
  updated: '25 सितंबर 2026',
  sections: SECTIONS_HI,
  sibling: { label: 'गोपनीयता नीति', to: '/privacy-policy' },
  summary: (
    <>
      <p>Sankshep.ai एक <strong>मुफ़्त छात्र प्रोटोटाइप</strong> है, जैसा है वैसा ही दिया गया है। यह बदल या बंद हो सकता है।</p>
      <p>AI ड्राफ़्ट ग़लत हो सकते हैं। <strong>इस्तेमाल से पहले उन्हें जाँच लें।</strong> आपका कंटेंट आपका ही रहता है।</p>
      <p>इसका दुरुपयोग न करें, और याद रखें कि <strong>डेमो अकाउंट सबके साथ साझा</strong> है।</p>
    </>
  ),
}

export default function TermsPage() {
  const t = useCopy({ en, hi })
  return <LegalLayout title={t.title} updated={t.updated} sections={t.sections} sibling={t.sibling} summary={t.summary} />
}
