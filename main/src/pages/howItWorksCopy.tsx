// How it works page copy in English and Hindi. Numbers come from the workspace code, so both languages stay in step with it.
// Workspace labels the reader will see in the (English) app, like Generate and History, stay in Latin.
import { MAX_COMPARE, MAX_FILE_BYTES, MAX_IMAGE_BYTES } from '../workspace/LeftPanel'

const MB = 1024 * 1024

const en = {
  hero: {
    eyebrow: 'How it works',
    title: <>One source in. <span className="font-serif text-matcha-deep">Every format</span> out.</>,
    lead: 'Here is exactly what happens between pressing Generate and reading your drafts, and where your content goes on the way.',
    tryIt: 'Try it on a document',
    walk: 'Walk through the pipeline',
    outputs: ['Executive Summary', 'LinkedIn Post', 'Slide Deck', 'Hindi translation'],
    playAgain: 'Play again',
  },
  stages: [
    {
      title: 'Ingest',
      lead: 'Bring the source in however you have it.',
      body: `Paste text, drop a link, or upload a TXT, Markdown, CSV or JSON file up to ${MAX_FILE_BYTES / MB} MB. Images up to ${MAX_IMAGE_BYTES / MB} MB are read too: by a vision model when you have picked one, otherwise by an OCR engine that runs in your browser.`,
      facts: ['Paste, link or upload', 'Images: vision model or on-device OCR'],
    },
    {
      title: 'Clean',
      lead: 'One pass turns raw input into tidy source text.',
      body: 'The first model you selected strips noise, repairs broken formatting and keeps every fact. If that call fails, the run carries on with your original text, so a hiccup here never stops your drafts.',
      facts: ['One call, first selected model', 'Falls back to the raw text'],
    },
    {
      title: 'Draft in parallel',
      lead: 'Every format, from every model, at the same time.',
      body: `Each format is its own step with its own prompt, carrying your tone and audience. They all run at once, and in comparison mode each of up to ${MAX_COMPARE} models writes the full set. One failed draft never takes the others down.`,
      facts: ['Formats × models, all at once', 'Failures stay contained'],
    },
    {
      title: 'Review and refine',
      lead: 'Read, compare, refine, keep.',
      body: 'Drafts land on the output canvas, side by side when you compare models. Refine any single draft with a plain instruction, copy or export it, and find it again later in History.',
      facts: ['Refine one draft at a time', 'Saved to your History'],
    },
  ],
  pipeline: {
    eyebrow: 'The pipeline',
    title: 'Four steps, one run.',
    progress: 'Pipeline progress',
    stepOf: (step: number, total: number) => `step ${step} of ${total}`,
  },
  visuals: {
    sources: ['Paste text', 'Link', 'report.md'],
    slideLines: ['Q3 revenue grew 12%', 'Churn fell to 3%'],
    textRead: 'Text read',
    onDevice: 'On-device OCR, nothing uploaded',
    noise: ['Accept cookies', 'Share · Print · Email', 'Advertisement'],
    rawInput: 'Raw input',
    cleanSource: 'Clean source',
    factsKept: 'Every fact kept',
    cleanNode: ['Clean', 'source'],
    models: ['Model A', 'Model B'],
    fanFormats: ['Summary', 'LinkedIn', 'Slides', 'Blog'],
    started: '8 drafts, started together',
    refineTyped: 'Shorter, three bullets',
    tabs: ['Summary', 'LinkedIn', 'Slides'],
    refine: 'Refine',
    saved: 'Saved to History',
  },
  dataFlow: {
    eyebrow: 'The stack',
    title: 'What goes where.',
    lead: 'Three places touch your content. Pick something you care about and see which of them ever receives it.',
    traceLabel: 'Choose what to trace',
    places: [
      { name: 'Your browser', stack: 'React 19, Vite, Tailwind CSS, Tesseract.js' },
      { name: 'The AI provider you pick', stack: 'Groq, Google Gemini or Mistral' },
      { name: 'Sankshep database', stack: 'Supabase Auth and Postgres, row-level security' },
    ],
    // Notes are in the order browser, provider, database.
    items: [
      { label: 'Your source text', notes: ['Read here first', 'Sent to write the drafts', 'First 300 characters only'] },
      { label: 'Your API key', notes: ['Held in tab memory', 'Sent with each request', 'Never stored'] },
      { label: 'An uploaded image', notes: ['OCR runs here', 'Only if you pick a vision model', 'Never stored'] },
      { label: 'Your drafts', notes: ['Shown on the canvas', 'Written there', 'Kept for your History'] },
      { label: 'Your password', notes: ['Typed here', 'Never sent', 'Stored as a salted hash'] },
    ],
    reach: { yes: 'Goes here', partly: 'Partly', never: 'Never' },
    privacyLink: 'Privacy Policy',
    fullDetail: (link: React.ReactNode) => <>The full detail is in the {link}.</>,
  },
  fromCode: {
    eyebrow: 'Read straight from the code',
    formats: 'output formats, plus one you describe yourself',
    models: (providers: number) => `drafting models across ${providers} providers`,
    compare: 'models side by side in one comparison',
    file: 'largest file you can upload',
    keys: 'API keys stored anywhere',
  },
  closing: {
    title: <>Try it on <span className="font-serif text-matcha">your own</span> document.</>,
    body: 'Use the demo account, or sign up and keep your History private.',
    open: 'Open Workspace',
    team: 'Meet the team',
  },
}

const hi: typeof en = {
  hero: {
    eyebrow: 'यह कैसे काम करता है',
    title: <>एक स्रोत डालिए। <span className="font-serif text-matcha-deep">हर फ़ॉर्मेट</span> पाइए।</>,
    lead: 'Generate दबाने से लेकर अपने ड्राफ़्ट पढ़ने तक ठीक-ठीक क्या होता है, और इस बीच आपका कंटेंट कहाँ-कहाँ जाता है, यहाँ देखिए।',
    tryIt: 'किसी दस्तावेज़ पर आज़माएँ',
    walk: 'पाइपलाइन को क़दम-दर-क़दम देखें',
    outputs: ['कार्यकारी सारांश', 'LinkedIn पोस्ट', 'स्लाइड डेक', 'हिंदी अनुवाद'],
    playAgain: 'फिर से चलाएँ',
  },
  stages: [
    {
      title: 'इनपुट',
      lead: 'स्रोत जैसे भी आपके पास हो, वैसे ही लाइए।',
      body: `टेक्स्ट पेस्ट करें, लिंक डालें, या ${MAX_FILE_BYTES / MB} MB तक की TXT, Markdown, CSV या JSON फ़ाइल अपलोड करें। ${MAX_IMAGE_BYTES / MB} MB तक की इमेज भी पढ़ी जाती हैं: अगर आपने विज़न मॉडल चुना है तो उससे, नहीं तो आपके ब्राउज़र में चलने वाले OCR इंजन से।`,
      facts: ['पेस्ट, लिंक या अपलोड', 'इमेज: विज़न मॉडल या डिवाइस पर OCR'],
    },
    {
      title: 'सफ़ाई',
      lead: 'एक ही बार में कच्चा इनपुट साफ़-सुथरा स्रोत टेक्स्ट बन जाता है।',
      body: 'आपका चुना पहला मॉडल फ़ालतू हिस्से हटाता है, टूटी फ़ॉर्मेटिंग ठीक करता है और हर तथ्य बनाए रखता है। अगर यह कॉल विफल हो जाए, तो रन आपके मूल टेक्स्ट के साथ आगे बढ़ता है, इसलिए यहाँ की कोई अड़चन आपके ड्राफ़्ट नहीं रोकती।',
      facts: ['एक कॉल, पहला चुना मॉडल', 'विफल होने पर मूल टेक्स्ट'],
    },
    {
      title: 'एक साथ ड्राफ़्ट',
      lead: 'हर फ़ॉर्मेट, हर मॉडल से, एक ही समय पर।',
      body: `हर फ़ॉर्मेट अपना अलग चरण है, अपने प्रॉम्प्ट के साथ, जिसमें आपकी टोन और पाठक शामिल होते हैं। सब एक साथ चलते हैं, और तुलना मोड में ज़्यादा से ज़्यादा ${MAX_COMPARE} मॉडल में से हर एक पूरा सेट लिखता है। एक ड्राफ़्ट विफल हो तो बाकी पर कोई असर नहीं पड़ता।`,
      facts: ['फ़ॉर्मेट × मॉडल, सब एक साथ', 'विफलता अपने तक सीमित'],
    },
    {
      title: 'समीक्षा और सुधार',
      lead: 'पढ़ें, तुलना करें, सुधारें, सहेजें।',
      body: 'ड्राफ़्ट आउटपुट कैनवस पर आते हैं, और मॉडलों की तुलना करते समय साथ-साथ दिखते हैं। किसी भी एक ड्राफ़्ट को सीधे-सादे निर्देश से सुधारें, उसे कॉपी या एक्सपोर्ट करें, और बाद में History में फिर से पाएँ।',
      facts: ['एक बार में एक ड्राफ़्ट सुधारें', 'आपकी History में सहेजा जाता है'],
    },
  ],
  pipeline: {
    eyebrow: 'पाइपलाइन',
    title: 'चार चरण, एक रन।',
    progress: 'पाइपलाइन की प्रगति',
    stepOf: (step: number, total: number) => `चरण ${step} / ${total}`,
  },
  visuals: {
    sources: ['टेक्स्ट पेस्ट करें', 'लिंक', 'report.md'],
    slideLines: ['Q3 में आय 12% बढ़ी', 'ग्राहक छोड़ने की दर 3% रही'],
    textRead: 'पढ़ा गया टेक्स्ट',
    onDevice: 'डिवाइस पर OCR, कुछ भी अपलोड नहीं',
    noise: ['कुकीज़ स्वीकार करें', 'शेयर · प्रिंट · ईमेल', 'विज्ञापन'],
    rawInput: 'कच्चा इनपुट',
    cleanSource: 'साफ़ स्रोत',
    factsKept: 'हर तथ्य सुरक्षित',
    cleanNode: ['साफ़', 'स्रोत'],
    models: ['मॉडल A', 'मॉडल B'],
    fanFormats: ['सारांश', 'LinkedIn', 'स्लाइड', 'ब्लॉग'],
    started: '8 ड्राफ़्ट, एक साथ शुरू',
    refineTyped: 'और छोटा, तीन बिंदुओं में',
    tabs: ['सारांश', 'LinkedIn', 'स्लाइड'],
    refine: 'सुधारें',
    saved: 'History में सहेजा गया',
  },
  dataFlow: {
    eyebrow: 'स्टैक',
    title: 'क्या कहाँ जाता है।',
    lead: 'तीन जगहें आपके कंटेंट को छूती हैं। जिस चीज़ की आपको परवाह है उसे चुनें, और देखें कि इनमें से किस तक वह कभी पहुँचती है।',
    traceLabel: 'चुनें कि किसका रास्ता देखना है',
    places: [
      { name: 'आपका ब्राउज़र', stack: 'React 19, Vite, Tailwind CSS, Tesseract.js' },
      { name: 'आपका चुना AI प्रोवाइडर', stack: 'Groq, Google Gemini या Mistral' },
      { name: 'Sankshep डेटाबेस', stack: 'Supabase Auth और Postgres, row-level security' },
    ],
    items: [
      { label: 'आपका स्रोत टेक्स्ट', notes: ['सबसे पहले यहीं पढ़ा जाता है', 'ड्राफ़्ट लिखने के लिए भेजा जाता है', 'सिर्फ़ पहले 300 अक्षर'] },
      { label: 'आपकी API कुंजी', notes: ['टैब की मेमोरी में रहती है', 'हर अनुरोध के साथ भेजी जाती है', 'कभी सहेजी नहीं जाती'] },
      { label: 'अपलोड की गई इमेज', notes: ['OCR यहीं चलता है', 'सिर्फ़ तब, जब आप विज़न मॉडल चुनें', 'कभी सहेजी नहीं जाती'] },
      { label: 'आपके ड्राफ़्ट', notes: ['कैनवस पर दिखते हैं', 'वहीं लिखे जाते हैं', 'आपकी History के लिए रखे जाते हैं'] },
      { label: 'आपका पासवर्ड', notes: ['यहीं टाइप होता है', 'कभी नहीं भेजा जाता', 'salted hash के रूप में सहेजा जाता है'] },
    ],
    reach: { yes: 'यहाँ जाता है', partly: 'आंशिक', never: 'कभी नहीं' },
    privacyLink: 'गोपनीयता नीति',
    fullDetail: (link: React.ReactNode) => <>पूरी जानकारी {link} में है।</>,
  },
  fromCode: {
    eyebrow: 'सीधे कोड से पढ़े गए आँकड़े',
    formats: 'आउटपुट फ़ॉर्मेट, और एक जिसे आप ख़ुद बताएँ',
    models: (providers: number) => `${providers} प्रोवाइडर में ड्राफ़्ट लिखने वाले मॉडल`,
    compare: 'एक तुलना में साथ-साथ चलने वाले मॉडल',
    file: 'अपलोड की जा सकने वाली सबसे बड़ी फ़ाइल',
    keys: 'कहीं भी सहेजी गई API कुंजियाँ',
  },
  closing: {
    title: <><span className="font-serif text-matcha">अपने</span> दस्तावेज़ पर आज़माकर देखें।</>,
    body: 'डेमो अकाउंट इस्तेमाल करें, या साइन अप करके अपनी History निजी रखें।',
    open: 'वर्कस्पेस खोलें',
    team: 'टीम से मिलें',
  },
}

export const HOW_COPY = { en, hi }
