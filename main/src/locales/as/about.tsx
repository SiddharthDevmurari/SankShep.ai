import type { ReactNode } from 'react'
import type { ABOUT_COPY } from '../../pages/AboutPage'

const Strong = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>

const t: typeof ABOUT_COPY.en = {
  eyebrow: 'আমাৰ বিষয়ে',
  intro: <>আমি <Strong>স্মাৰ্ট ইণ্ডিয়া হেকাথন</Strong>ৰ বাবে Sankshep.ai নিৰ্মাণ কৰিছো: এনে এক কৰ্মক্ষেত্ৰ যি এটা মূল নথিপত্ৰক মানুহে আচলতে পঠিয়াব লগা ফৰমেটলৈ ৰূপান্তৰ কৰে।</>,
  problemLabel: 'SIH সমস্যাৰ বিবৃতি',
  problem: '“স্বয়ংক্ৰিয় কনটেণ্ট ৰূপান্তৰৰ বাবে Gen AI প্লেটফৰ্ম”',
  why: [
    'সংস্থাসমূহে বাতৰি, প্ৰতিবেদন, পৰামৰ্শৱলী, নীতিগত নথিপত্ৰ আৰু গৱেষণাক চমূ বিৱৰণ, প’ষ্ট, ডে’ক আৰু স্ক্ৰিপ্টলৈ সলনি কৰাত ঘণ্টাৰ পরূ ঘণ্টা ব্যয় কৰে। প্ৰতিবাৰে উৎসটো পুনৰ পঢ়িবলগীয়া হয়, দৰ্শকক কি লাগে তাৰ হিচাপ কৰিবলগীয়া হয়, আৰু সকলোবোৰ একেবাৰে নতুনকৈ লিখিবলগীয়া হয়।',
    'Sankshep.ai য়ে সিহঁতৰ বাবে সেই কামটো কৰে। এটা নথিপত্ৰ আপলোড কৰক, ফৰমেট আৰু দৰ্শক বাছক, আৰু প্ৰতিটো খচৰা একে উৎসৰ পৰা একেলগে লিখা হয়, পৰীক্ষা কৰিবলৈ আৰু সম্পাদনা কৰিবলৈ সাজু।',
  ],
  name: <><span className="font-semibold text-ink">“Sankshep” নামটো কিয়?</span> সংক্ষেপ (sankshep) হ’ল হিন্দী শব্দ যাৰ অৰ্থ “চমুকৈ” বা “কম শব্দত”।</>,
  team: 'দলটো',
  cta: 'আপলোড আৰু খচৰাৰ মাজত কি হয় চাওক।',
  howItWorks: 'ই কেনেকৈ কাম কৰে',
  readCode: 'কোড পঢ়ক',
}

export default t
