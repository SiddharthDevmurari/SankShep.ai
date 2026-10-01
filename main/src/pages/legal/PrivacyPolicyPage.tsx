import { Link } from 'react-router-dom'
import { GITHUB_URL } from '../../components/site/SiteChrome'
import { useCopy } from '../../i18n'
import { LegalLayout, type LegalSection } from './LegalLayout'

const ISSUES_URL = GITHUB_URL.replace(/\.git$/, '') + '/issues'

// Every statement here describes what the code does today (lib/activity.ts,
// lib/providers.ts, lib/ingest.ts, i18n.tsx, supabase/schema.sql). Update it when they change.
// The Hindi sections mirror the English ones one for one (same ids, so links to #sections work in both).
const SECTIONS_EN: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          Sankshep.ai is a student project built by the team <strong>Neural Ninjas VGEC</strong> for the Smart India Hackathon.
          It is a prototype, not a commercial service, and it is offered free of charge.
        </p>
        <p>
          This policy explains what information the Sankshep.ai website and workspace collect, why, where it goes, and how you can
          remove it. It was written by the team for this project and has not been reviewed by a lawyer.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <p><strong>Your account.</strong> Your email address, your password (stored by our authentication provider as a salted hash that we cannot read), and the dates you signed up and last signed in.</p>
        <p><strong>Your activity.</strong> Each sign-in, sign-out, generation and refinement is recorded. For a generation we store:</p>
        <ul>
          <li>how you supplied the source (upload, link or pasted text) and the file name or link;</li>
          <li>the first 300 characters of the source, and its length in characters and words;</li>
          <li>the formats, tone, target language, custom instructions and refinement instructions you chose;</li>
          <li>the drafts that were generated, which provider and model wrote each one, whether it succeeded, any error message, and how long it took.</li>
        </ul>
        <p><strong>What we do not collect.</strong> We do not store your full source document or uploaded files beyond the 300-character preview, we do not store uploaded images, we never store your AI provider API keys, and we do not use analytics, advertising or tracking scripts.</p>
      </>
    ),
  },
  {
    id: 'ai-providers',
    title: 'How your content is processed',
    body: (
      <>
        <p>
          To write drafts, the text of your source and your instructions are sent from your browser to the AI provider you select in the
          workspace: <strong>Groq</strong>, <strong>Google (Gemini API)</strong> or <strong>Mistral AI</strong>. Each provider handles that
          content under its own terms and privacy policy, which may allow it to keep requests for a period. We do not control their retention.
        </p>
        <p>
          If you upload an image, it is either sent to a provider’s image-reading model (when you have chosen one and added its key) or read
          by an OCR engine that runs inside your browser. The OCR engine is downloaded from a public content delivery network (jsDelivr);
          the image itself does not leave your device in that case.
        </p>
      </>
    ),
  },
  {
    id: 'api-keys',
    title: 'Your API keys',
    body: (
      <>
        <p>
          When you paste your own Groq, Gemini or Mistral key, it is kept only in the memory of that browser tab and is sent only to that
          provider, with each request. It is never written to our database, our logs or your browser storage, and it is gone as soon as you
          reload or close the tab.
        </p>
        <p>If you leave the Groq key empty, requests use a Groq key that belongs to this project.</p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your information',
    body: (
      <>
        <ul>
          <li>to sign you in and keep your workspace private to you;</li>
          <li>to show you your own History and Analytics pages;</li>
          <li>to let the project administrator see how the prototype is used, remove accounts, and investigate failures.</li>
        </ul>
        <p>We do not sell your information, we do not use it for advertising, and we do not use it to train AI models.</p>
      </>
    ),
  },
  {
    id: 'who-can-see',
    title: 'Who can see it',
    body: (
      <>
        <ul>
          <li><strong>You</strong>, in your History and Analytics pages.</li>
          <li><strong>The project administrator</strong>, whose Admin panel lists every account and its activity, including stored drafts.</li>
          <li><strong>Supabase</strong>, which hosts our authentication and database.</li>
          <li><strong>Our website host</strong>, which keeps standard request logs such as IP address, browser type and the pages requested.</li>
        </ul>
        <p>
          <strong>The shared demo account is public.</strong> Its email and password are shown on the sign-in page, so anything you generate
          while signed in as the demo account can be seen by anyone else who uses it. Do not put private material into the demo account.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How we protect it',
    body: (
      <>
        <p>
          Data travels over encrypted HTTPS connections. In the database, row-level security rules only let a signed-in account read its own
          records (the administrator excepted) and only add records as itself; account and admin actions are checked on the server, not just
          in the browser.
        </p>
        <p>No system is perfectly secure. If you find a weakness, please report it privately using the contact route below before sharing it.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Keeping and deleting your data',
    body: (
      <>
        <p>
          We keep your account and activity until the account is deleted. You can delete it at any time from the account menu in the
          workspace (<strong>Delete account</strong>). This immediately and permanently removes your account and your entire activity history.
        </p>
        <p>The shared demo account and the administrator account cannot be deleted this way. The administrator can also remove any other account.</p>
      </>
    ),
  },
  {
    id: 'storage',
    title: 'Cookies and browser storage',
    body: (
      <p>
        We do not set tracking or advertising cookies. When you sign in, your session token is kept in your browser’s local storage so you
        stay signed in; logging out removes it. Your choice of English or Hindi for these pages is kept there too, so the site opens in the
        same language next time; it never leaves your browser.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          You can see your stored activity on your <Link to="/workspace/history">History</Link> page and delete everything with Delete account.
          Where India’s Digital Personal Data Protection Act, 2023 applies to you, you may also ask us to correct or erase your personal data,
          or ask questions about how it is processed, using the contact route below.
        </p>
        <p>Sankshep.ai is not intended for anyone under 18.</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: <p>When what we collect or how we use it changes, we update this page and the date at the top.</p>,
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions or requests go to the team through the project’s{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>. For a security issue, open an issue asking
        for a private channel rather than posting the details publicly.
      </p>
    ),
  },
]

const SECTIONS_HI: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'हम कौन हैं',
    body: (
      <>
        <p>
          Sankshep.ai एक छात्र प्रोजेक्ट है, जिसे टीम <strong>Neural Ninjas VGEC</strong> ने स्मार्ट इंडिया हैकाथॉन के लिए बनाया है। यह
          एक प्रोटोटाइप है, कोई व्यावसायिक सेवा नहीं, और यह मुफ़्त दिया जाता है।
        </p>
        <p>
          यह नीति बताती है कि Sankshep.ai वेबसाइट और वर्कस्पेस कौन-सी जानकारी इकट्ठा करते हैं, क्यों, वह कहाँ जाती है, और आप उसे कैसे हटा
          सकते हैं। इसे टीम ने इस प्रोजेक्ट के लिए लिखा है और किसी वकील ने इसकी समीक्षा नहीं की है।
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'हम क्या इकट्ठा करते हैं',
    body: (
      <>
        <p><strong>आपका अकाउंट।</strong> आपका ईमेल पता, आपका पासवर्ड (जिसे हमारा ऑथेंटिकेशन प्रोवाइडर salted hash के रूप में रखता है, जिसे हम पढ़ नहीं सकते), और आपके साइन अप करने और आख़िरी बार साइन इन करने की तारीख़ें।</p>
        <p><strong>आपकी गतिविधि।</strong> हर साइन इन, साइन आउट, जनरेशन और सुधार दर्ज किया जाता है। किसी जनरेशन के लिए हम ये सहेजते हैं:</p>
        <ul>
          <li>आपने स्रोत कैसे दिया (अपलोड, लिंक या पेस्ट किया गया टेक्स्ट) और फ़ाइल का नाम या लिंक;</li>
          <li>स्रोत के पहले 300 अक्षर, और अक्षरों व शब्दों में उसकी लंबाई;</li>
          <li>आपके चुने हुए फ़ॉर्मेट, टोन, लक्ष्य भाषा, कस्टम निर्देश और सुधार के निर्देश;</li>
          <li>बने हुए ड्राफ़्ट, हर ड्राफ़्ट किस प्रोवाइडर और मॉडल ने लिखा, वह सफल हुआ या नहीं, कोई त्रुटि संदेश, और उसमें कितना समय लगा।</li>
        </ul>
        <p><strong>हम क्या इकट्ठा नहीं करते।</strong> हम 300 अक्षरों के प्रीव्यू के अलावा आपका पूरा स्रोत दस्तावेज़ या अपलोड की गई फ़ाइलें नहीं सहेजते, अपलोड की गई इमेज नहीं सहेजते, आपकी AI प्रोवाइडर API कुंजियाँ कभी नहीं सहेजते, और कोई एनालिटिक्स, विज्ञापन या ट्रैकिंग स्क्रिप्ट इस्तेमाल नहीं करते।</p>
      </>
    ),
  },
  {
    id: 'ai-providers',
    title: 'आपका कंटेंट कैसे प्रोसेस होता है',
    body: (
      <>
        <p>
          ड्राफ़्ट लिखने के लिए आपके स्रोत का टेक्स्ट और आपके निर्देश आपके ब्राउज़र से उस AI प्रोवाइडर को भेजे जाते हैं जिसे आप वर्कस्पेस में
          चुनते हैं: <strong>Groq</strong>, <strong>Google (Gemini API)</strong> या <strong>Mistral AI</strong>। हर प्रोवाइडर उस कंटेंट को
          अपनी शर्तों और गोपनीयता नीति के तहत संभालता है, जो उसे अनुरोधों को कुछ समय तक रखने की अनुमति दे सकती है। वे डेटा कितने समय तक
          रखते हैं, इस पर हमारा नियंत्रण नहीं है।
        </p>
        <p>
          अगर आप कोई इमेज अपलोड करते हैं, तो वह या तो किसी प्रोवाइडर के इमेज पढ़ने वाले मॉडल को भेजी जाती है (जब आपने ऐसा मॉडल चुना हो और
          उसकी कुंजी जोड़ी हो), या आपके ब्राउज़र के अंदर चलने वाले OCR इंजन से पढ़ी जाती है। OCR इंजन एक सार्वजनिक कंटेंट डिलीवरी नेटवर्क
          (jsDelivr) से डाउनलोड होता है; उस स्थिति में इमेज आपके डिवाइस से बाहर नहीं जाती।
        </p>
      </>
    ),
  },
  {
    id: 'api-keys',
    title: 'आपकी API कुंजियाँ',
    body: (
      <>
        <p>
          जब आप अपनी Groq, Gemini या Mistral कुंजी पेस्ट करते हैं, तो वह सिर्फ़ उस ब्राउज़र टैब की मेमोरी में रहती है और हर अनुरोध के साथ
          सिर्फ़ उसी प्रोवाइडर को भेजी जाती है। वह कभी हमारे डेटाबेस, हमारे लॉग या आपके ब्राउज़र स्टोरेज में नहीं लिखी जाती, और टैब रीलोड या
          बंद करते ही मिट जाती है।
        </p>
        <p>अगर आप Groq कुंजी खाली छोड़ते हैं, तो अनुरोध इस प्रोजेक्ट की अपनी Groq कुंजी से जाते हैं।</p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'हम आपकी जानकारी का उपयोग कैसे करते हैं',
    body: (
      <>
        <ul>
          <li>आपको साइन इन कराने और आपके वर्कस्पेस को सिर्फ़ आपके लिए निजी रखने के लिए;</li>
          <li>आपको आपके अपने History और Analytics पेज दिखाने के लिए;</li>
          <li>प्रोजेक्ट एडमिनिस्ट्रेटर को यह देखने देने के लिए कि प्रोटोटाइप कैसे इस्तेमाल हो रहा है, अकाउंट हटाने और गड़बड़ियों की जाँच करने के लिए।</li>
        </ul>
        <p>हम आपकी जानकारी बेचते नहीं, विज्ञापन के लिए उसका इस्तेमाल नहीं करते, और उससे AI मॉडल ट्रेन नहीं करते।</p>
      </>
    ),
  },
  {
    id: 'who-can-see',
    title: 'इसे कौन देख सकता है',
    body: (
      <>
        <ul>
          <li><strong>आप</strong>, अपने History और Analytics पेज पर।</li>
          <li><strong>प्रोजेक्ट एडमिनिस्ट्रेटर</strong>, जिसके Admin पैनल में हर अकाउंट और उसकी गतिविधि दिखती है, जिसमें सहेजे गए ड्राफ़्ट भी शामिल हैं।</li>
          <li><strong>Supabase</strong>, जो हमारा ऑथेंटिकेशन और डेटाबेस होस्ट करता है।</li>
          <li><strong>हमारा वेबसाइट होस्ट</strong>, जो IP पता, ब्राउज़र का प्रकार और माँगे गए पेज जैसे सामान्य अनुरोध लॉग रखता है।</li>
        </ul>
        <p>
          <strong>साझा डेमो अकाउंट सार्वजनिक है।</strong> उसका ईमेल और पासवर्ड साइन-इन पेज पर दिखाया गया है, इसलिए डेमो अकाउंट से साइन
          इन रहते हुए आप जो भी बनाते हैं, उसे कोई भी दूसरा उपयोगकर्ता देख सकता है। डेमो अकाउंट में कोई निजी सामग्री न डालें।
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'हम इसकी सुरक्षा कैसे करते हैं',
    body: (
      <>
        <p>
          डेटा एन्क्रिप्टेड HTTPS कनेक्शन पर जाता है। डेटाबेस में row-level security नियम साइन इन किए हुए अकाउंट को सिर्फ़ अपने रिकॉर्ड
          पढ़ने देते हैं (एडमिनिस्ट्रेटर को छोड़कर) और सिर्फ़ अपने नाम से रिकॉर्ड जोड़ने देते हैं; अकाउंट और एडमिन की कार्रवाइयाँ सिर्फ़
          ब्राउज़र में नहीं, बल्कि सर्वर पर जाँची जाती हैं।
        </p>
        <p>कोई भी सिस्टम पूरी तरह सुरक्षित नहीं होता। अगर आपको कोई कमज़ोरी मिले, तो उसे सार्वजनिक करने से पहले नीचे दिए संपर्क तरीक़े से निजी तौर पर बताएँ।</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'आपका डेटा रखना और हटाना',
    body: (
      <>
        <p>
          अकाउंट हटाए जाने तक हम आपका अकाउंट और गतिविधि रखते हैं। आप इसे कभी भी वर्कस्पेस के अकाउंट मेन्यू (<strong>Delete account</strong>)
          से हटा सकते हैं। इससे आपका अकाउंट और आपकी पूरी गतिविधि हिस्ट्री तुरंत और स्थायी रूप से मिट जाती है।
        </p>
        <p>साझा डेमो अकाउंट और एडमिनिस्ट्रेटर अकाउंट इस तरह नहीं हटाए जा सकते। एडमिनिस्ट्रेटर किसी भी दूसरे अकाउंट को भी हटा सकता है।</p>
      </>
    ),
  },
  {
    id: 'storage',
    title: 'कुकीज़ और ब्राउज़र स्टोरेज',
    body: (
      <p>
        हम ट्रैकिंग या विज्ञापन कुकीज़ सेट नहीं करते। साइन इन करने पर आपका सेशन टोकन आपके ब्राउज़र के local storage में रखा जाता है ताकि
        आप साइन इन बने रहें; लॉग आउट करने पर वह हट जाता है। इन पेजों के लिए आपकी चुनी हुई भाषा (अंग्रेज़ी या हिंदी) भी वहीं रखी जाती है,
        ताकि अगली बार साइट उसी भाषा में खुले; यह आपके ब्राउज़र से बाहर कभी नहीं जाती।
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'आपके अधिकार',
    body: (
      <>
        <p>
          आप अपनी सहेजी गई गतिविधि अपने <Link to="/workspace/history">History</Link> पेज पर देख सकते हैं और Delete account से सब कुछ मिटा
          सकते हैं। जहाँ भारत का डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 आप पर लागू होता है, वहाँ आप नीचे दिए संपर्क तरीक़े से हमसे अपने
          व्यक्तिगत डेटा को सुधारने या मिटाने के लिए भी कह सकते हैं, या उसके प्रोसेस होने के बारे में सवाल पूछ सकते हैं।
        </p>
        <p>Sankshep.ai 18 वर्ष से कम उम्र के किसी भी व्यक्ति के लिए नहीं है।</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'इस नीति में बदलाव',
    body: <p>जब हम जो इकट्ठा करते हैं या उसका जिस तरह इस्तेमाल करते हैं, उसमें बदलाव होता है, तो हम यह पेज और ऊपर दी गई तारीख़ अपडेट करते हैं।</p>,
  },
  {
    id: 'contact',
    title: 'संपर्क',
    body: (
      <p>
        सवाल या अनुरोध प्रोजेक्ट के{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">GitHub issues पेज</a> के ज़रिए टीम तक भेजें। सुरक्षा से जुड़े मामले
        के लिए, विवरण सार्वजनिक रूप से पोस्ट करने के बजाय एक issue खोलकर निजी माध्यम माँगें।
      </p>
    ),
  },
]

const en = {
  title: 'Privacy Policy',
  updated: 'October 1, 2026',
  sections: SECTIONS_EN,
  sibling: { label: 'Terms and Conditions', to: '/terms-and-conditions' },
  summary: (
    <>
      <p>We store your <strong>email</strong>, your <strong>activity</strong> and the <strong>drafts</strong> you generate, so you can see your history.</p>
      <p>Your source text goes to the <strong>AI provider you choose</strong>. Your <strong>API keys are never stored</strong>.</p>
      <p>No ads, no trackers, no selling data, no training on it. <strong>Delete account</strong> removes everything.</p>
    </>
  ),
}

const hi: typeof en = {
  title: 'गोपनीयता नीति',
  updated: '1 अक्टूबर 2026',
  sections: SECTIONS_HI,
  sibling: { label: 'नियम और शर्तें', to: '/terms-and-conditions' },
  summary: (
    <>
      <p>हम आपका <strong>ईमेल</strong>, आपकी <strong>गतिविधि</strong> और आपके बनाए <strong>ड्राफ़्ट</strong> सहेजते हैं, ताकि आप अपनी हिस्ट्री देख सकें।</p>
      <p>आपका स्रोत टेक्स्ट <strong>आपके चुने हुए AI प्रोवाइडर</strong> को जाता है। आपकी <strong>API कुंजियाँ कभी सहेजी नहीं जातीं</strong>।</p>
      <p>न विज्ञापन, न ट्रैकर, न डेटा की बिक्री, न उस पर ट्रेनिंग। <strong>Delete account</strong> से सब कुछ मिट जाता है।</p>
    </>
  ),
}

export default function PrivacyPolicyPage() {
  const t = useCopy({ en, hi })
  return <LegalLayout title={t.title} updated={t.updated} sections={t.sections} sibling={t.sibling} summary={t.summary} />
}
