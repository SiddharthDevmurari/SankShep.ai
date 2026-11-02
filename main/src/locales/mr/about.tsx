import type { ReactNode } from 'react'
import type { ABOUT_COPY } from '../../pages/AboutPage'

const Strong = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>

const t: typeof ABOUT_COPY.en = {
  eyebrow: 'आमच्याबद्दल',
  intro: <>आम्ही Sankshep.ai <Strong>स्मार्ट इंडिया हॅकेथॉन</Strong>साठी तयार केले आहे: एक असे वर्कस्पेस जे एका मूळ दस्तऐवजाला लोकांना प्रत्यक्षात पाठवाव्या लागणाऱ्या फॉरमॅटमध्ये बदलते.</>,
  problemLabel: 'SIH समस्या विधान',
  problem: '“स्वयंचलित कंटेंट रूपांतरणासाठी Gen AI प्लॅटफॉर्म”',
  why: [
    'संस्था बातम्या, अहवाल, अ‍ॅडव्हायझरी, धोरण दस्तऐवज आणि संशोधन हे ब्रीफ, पोस्ट, डेक आणि स्क्रिप्टमध्ये बदलण्यासाठी तासनतास घालवतात. प्रत्येक वेळी मूळ माहिती पुन्हा वाचावी लागते, वाचकांना काय हवे आहे ते समजून घ्यावे लागते आणि सर्व काही सुरुवातीपासून लिहावे लागते.',
    'Sankshep.ai ही पायरी त्यांच्यासाठी सोपी करते. दस्तऐवज अपलोड करा, फॉरमॅट आणि वाचक निवडा, आणि प्रत्येक ड्राफ्ट एकाच मूळ माहितीवरून एकाच वेळी तयार होतो, तपासण्यासाठी आणि संपादित करण्यासाठी तयार.',
  ],
  name: <><span className="font-semibold text-ink">“Sankshep” हे नाव का?</span> संक्षेपचा अर्थ “थोडक्यात” असा होतो.</>,
  team: 'टीम',
  cta: 'पहा, अपलोड ते ड्राफ्ट दरम्यान काय घडते.',
  howItWorks: 'हे कसे काम करते',
  readCode: 'कोड वाचा',
}

export default t
