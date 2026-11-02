// The demo's captions and controls. The mockup itself stays in English, as the real workspace does.
import { defineCopy } from '../../i18n'
const en = {
  region: 'Sankshep workspace demo',
  description:
    'An animated walkthrough of the Sankshep workspace. A pointer adds the SIH26154 problem statement as the source, picks Executive Summary, LinkedIn Post and Slide Deck, sets the audience and the model, generates the drafts, refines the LinkedIn post, downloads the deck as PowerPoint and finds it in History.',
  play: 'Play demo',
  pause: 'Pause demo',
  prev: 'Previous step',
  next: 'Next step',
  jump: (label: string) => `Go to step: ${label}`,
  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  chapters: [
    { label: 'Add a source', caption: 'Drop in a report, a paper or a link. Here, the real SIH26154 problem statement.' },
    { label: 'Pick formats', caption: 'Choose every format you need. All of them are drafted from the same source.' },
    { label: 'Audience & model', caption: 'Say who will read it, then pick the model that writes it.' },
    { label: 'Generate', caption: 'One click drafts all three formats at the same time.' },
    { label: 'Read & refine', caption: 'Read each draft, ask for changes in plain words, then preview the article.' },
    { label: 'Export', caption: 'Download the deck as PowerPoint, or any draft as Markdown or plain text.' },
    { label: 'History', caption: 'Every draft is saved to History, where you can filter by format.' },
  ],
}

const hi: typeof en = {
  region: 'Sankshep वर्कस्पेस डेमो',
  description:
    'Sankshep वर्कस्पेस का एनिमेटेड वॉकथ्रू। एक पॉइंटर SIH26154 का प्रॉब्लम स्टेटमेंट स्रोत के रूप में जोड़ता है, Executive Summary, LinkedIn Post और Slide Deck चुनता है, ऑडियंस और मॉडल तय करता है, ड्राफ़्ट जनरेट करता है, LinkedIn पोस्ट को सुधारता है, डेक को PowerPoint में डाउनलोड करता है और उसे History में ढूँढता है।',
  play: 'डेमो चलाएँ',
  pause: 'डेमो रोकें',
  prev: 'पिछला चरण',
  next: 'अगला चरण',
  jump: (label: string) => `इस चरण पर जाएँ: ${label}`,
  stepOf: (n: number, total: number) => `चरण ${n} / ${total}`,
  chapters: [
    { label: 'स्रोत जोड़ें', caption: 'कोई रिपोर्ट, पेपर या लिंक डालें। यहाँ SIH26154 का असली प्रॉब्लम स्टेटमेंट है।' },
    { label: 'फ़ॉर्मेट चुनें', caption: 'जो भी फ़ॉर्मेट चाहिए, सब चुनें। सब एक ही स्रोत से लिखे जाते हैं।' },
    { label: 'ऑडियंस और मॉडल', caption: 'बताइए कि इसे कौन पढ़ेगा, फिर लिखने वाला मॉडल चुनिए।' },
    { label: 'जनरेट', caption: 'एक क्लिक में तीनों फ़ॉर्मेट एक साथ तैयार होते हैं।' },
    { label: 'पढ़ें और सुधारें', caption: 'हर ड्राफ़्ट पढ़ें, सीधे शब्दों में बदलाव माँगें, फिर लेख का प्रीव्यू देखें।' },
    { label: 'एक्सपोर्ट', caption: 'डेक को PowerPoint में, या कोई भी ड्राफ़्ट Markdown या सादे टेक्स्ट में डाउनलोड करें।' },
    { label: 'History', caption: 'हर ड्राफ़्ट History में सहेजा जाता है, जहाँ आप फ़ॉर्मेट से फ़िल्टर कर सकते हैं।' },
  ],
}

export const DEMO_COPY = defineCopy('demo', { en, hi })
