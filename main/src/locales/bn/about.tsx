import type { ReactNode } from 'react'
import type { ABOUT_COPY } from '../../pages/AboutPage'

const Strong = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>

const t: typeof ABOUT_COPY.en = {
  eyebrow: 'আমাদের সম্পর্কে',
  intro: <>আমরা <Strong>স্মার্ট ইন্ডিয়া হ্যাকাথন</Strong>-এর জন্য Sankshep.ai তৈরি করেছি: এমন একটি Workspace যা একটি উৎস নথিকে সেই সব Format-এ রূপান্তর করে, যা মানুষের সত্যিই পাঠানোর প্রয়োজন হয়।</>,
  problemLabel: 'SIH সমস্যার বিবরণ',
  problem: '“স্বয়ংক্রিয় কনটেন্ট রূপান্তরের জন্য Gen AI প্ল্যাটফর্ম”',
  why: [
    'সংস্থাসমূহ খবর, রিপোর্ট, নির্দেশিকা, নীতি সংক্রান্ত নথি এবং গবেষণাকে Brief, Post, Deck এবং Script-এ রূপান্তর করতে ঘণ্টার পর ঘণ্টা সময় ব্যয় করে। প্রতিবারই উৎস নথিটি নতুন করে পড়তে হয়, পাঠকদের কী প্রয়োজন তা বুঝতে হয় এবং সবকিছু শুরু থেকে লিখতে হয়।',
    'Sankshep.ai তাদের জন্য এই কাজটি করে দেয়। একটি নথি Upload করুন, Format এবং পাঠক নির্বাচন করুন, আর প্রতিটি Draft একই উৎস থেকে একযোগে লেখা হয়ে যাবে, পরীক্ষা এবং সম্পাদনা করার জন্য প্রস্তুত।',
  ],
  name: <><span className="font-semibold text-ink">নাম “Sankshep” কেন?</span> সংক্ষিপ্ত (sankshep) হলো একটি হিন্দি শব্দ, যার অর্থ “সংক্ষেপে”।</>,
  team: 'টিম',
  cta: 'দেখুন, Upload থেকে Draft পর্যন্ত কী ঘটে।',
  howItWorks: 'এটি কীভাবে কাজ করে',
  readCode: 'কোড পড়ুন',
}

export default t
