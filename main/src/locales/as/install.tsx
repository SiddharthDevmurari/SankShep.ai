import { type ReactNode } from 'react'
import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS ৰ বাবে ডাউনলোড কৰক', android: 'Android ৰ বাবে ডাউনলোড কৰক' },
  title: (ios: boolean) => `আপোনাৰ ${ios ? 'iPhone বা iPad' : 'Android ডিভাইচ'}ত Sankshep ইনষ্টল কৰক`,
  free: 'বিনমূলীয়া, কোনো এপ ষ্টোৰৰ প্ৰয়োজন নাই।',
  close: 'বন্ধ কৰক',
  inApp: (browser: string, download: string) => (
    <>এই পেজটো আন এটা এপৰ ভিতৰত খোলা আছে। পোনতে ইয়াক {browser} ত খোলক (এপটোৰ মেনু ব্যৱহাৰ কৰি <B>Open in browser</B> বাছক), তাৰ পিছত পুনৰ <B>{download}</B> ত টিপক।</>
  ),
  ios: [
    <>আপোনাৰ ব্ৰাউজাৰৰ টুলবাৰত থকা <B>Share</B> বুটামটো টিপক।</>,
    <>তললৈ স্ক্ৰ'ল কৰি <B>Add to Home Screen</B> বাছক।</>,
    <><B>Add</B> টিপক। Sankshep যিকোনো এপৰ দৰেই আপোনাৰ হোম স্ক্ৰীণৰ পৰা মুকলি হ'ব।</>,
  ],
  android: [
    <>আপোনাৰ ব্ৰাউজাৰৰ <B>মেনু</B> (তিনিটা বিন্দু) খোলক।</>,
    <><B>Install app</B> বা <B>Add to Home screen</B> বাছক।</>,
    <>নিশ্চিত কৰক। Sankshep আপোনাৰ বাকী এপসমূহৰ সৈতে দেখা যাব।</>,
  ],
}

export default t
