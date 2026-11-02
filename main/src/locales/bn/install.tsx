import type { ReactNode } from 'react'
import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS-এর জন্য ডাউনলোড করুন', android: 'Android-এর জন্য ডাউনলোড করুন' },
  title: (ios: boolean) => `আপনার ${ios ? 'iPhone বা iPad' : 'Android ডিভাইসে'} Sankshep ইনস্টল করুন`,
  free: 'বিনামূল্যে, কোনো অ্যাপ স্টোরের প্রয়োজন নেই।',
  close: 'বন্ধ করুন',
  inApp: (browser: string, download: string) => (
    <>এই পেজটি অন্য একটি অ্যাপের ভেতরে খোলা হয়েছে। প্রথমে এটি {browser}-এ খুলুন (অ্যাপের মেনুতে <B>Open in browser</B> বেছে নিন), তারপর আবার <B>{download}</B>-এ চাপুন।</>
  ),
  ios: [
    <>ব্রাউজারের টুলবারে <B>Share</B> বটনে চাপুন।</>,
    <>নিচে স্ক্রোল করুন এবং <B>Add to Home Screen</B> বেছে নিন।</>,
    <><B>Add</B>-এ চাপুন। Sankshep যেকোনো অ্যাপের মতো আপনার হোম স্ক্রিন থেকে খুলে যাবে।</>,
  ],
  android: [
    <>আপনার ব্রাউজারের <B>মেনু</B> খুলুন (তিনটি বিন্দু)।</>,
    <><B>Install app</B> বা <B>Add to Home screen</B> বেছে নিন।</>,
    <>নিশ্চিত করুন। Sankshep আপনার অন্যান্য অ্যাপের সাথে দেখা যাবে।</>,
  ],
}

export default t
