import type { DEMO_COPY } from '../../components/demo/copy'

const t: typeof DEMO_COPY.en = {
  region: 'Sankshep वर्कस्पेस डेमो',
  description:
    'Sankshep वर्कस्पेसचा ॲनिमेटेड वॉकथ्रू. एक पॉइंटर SIH26154 चे प्रॉब्लेम स्टेटमेंट स्रोत म्हणून जोडतो, Executive Summary, LinkedIn Post आणि Slide Deck निवडतो, ऑडियन्स आणि मॉडेल ठरवतो, ड्राफ्ट जनरेट करतो, LinkedIn पोस्ट सुधारतो, डेक PowerPoint मध्ये डाउनलोड करतो आणि तो History मध्ये शोधतो.',
  play: 'डेमो चालवा',
  pause: 'डेमो थांबवा',
  prev: 'मागील पायरी',
  next: 'पुढील पायरी',
  jump: (label: string) => `या पायरीवर जा: ${label}`,
  stepOf: (n: number, total: number) => `पायरी ${n} / ${total}`,
  chapters: [
    { label: 'स्रोत जोडा', caption: 'एखादा रिपोर्ट, पेपर किंवा लिंक टाका. इथे SIH26154 चे खरे प्रॉब्लेम स्टेटमेंट आहे.' },
    { label: 'फॉर्मेट निवडा', caption: 'तुम्हाला हवे असलेले सर्व फॉर्मेट निवडा. सर्व एकाच स्रोतावरून तयार केले जातात.' },
    { label: 'ऑडियंस आणि मॉडेल', caption: 'हे कोण वाचणार आहे ते सांगा, मग लिहिणारे मॉडेल निवडा.' },
    { label: 'जनरेट', caption: 'एका क्लिकमध्ये तिन्ही फॉर्मेट एकाच वेळी तयार होतात.' },
    { label: 'वाचा आणि सुधारा', caption: 'प्रत्येक ड्राफ्ट वाचा, साध्या शब्दांत बदल मागा, मग पोस्टचे प्रिव्ह्यू पाहा.' },
    { label: 'एक्सपोर्ट', caption: 'डेक PowerPoint मध्ये किंवा कोणताही मसुदा Markdown अथवा साध्या मजकुरात डाउनलोड करा.' },
    { label: 'History', caption: 'प्रत्येक मसुदा History मध्ये सेव्ह केला जातो, जिथे तुम्ही फॉर्मेटनुसार फिल्टर करू शकता.' },
  ],
}

export default t
