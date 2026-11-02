import type { INSTALL_COPY } from '../../components/InstallApp'
import { type ReactNode } from 'react'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS کے لیے ڈاؤن لوڈ کریں', android: 'Android کے لیے ڈاؤن لوڈ کریں' },
  title: (ios: boolean) => `اپنے ${ios ? 'iPhone یا iPad' : 'Android ڈیوائس'} پر Sankshep انسٹال کریں`,
  free: 'مفت، کسی ایپ اسٹور کی ضرورت نہیں۔',
  close: 'بند کریں',
  inApp: (browser: string, download: string) => (
    <>یہ صفحہ کسی دوسرے ایپ کے اندر کھلا ہے۔ پہلے اسے {browser} میں کھولیں (ایپ کے مینو میں <B>Open in browser</B> منتخب کریں)، پھر <B>{download}</B> دوبارہ دبائیں۔</>
  ),
  ios: [
    <>براؤزر کے ٹول بار میں <B>Share</B> بٹن دبائیں۔</>,
    <>نیچے اسکرول کریں اور <B>Add to Home Screen</B> منتخب کریں۔</>,
    <><B>Add</B> دبائیں۔ Sankshep کسی بھی ایپ کی طرح آپ کی ہوم اسکرین سے کھلے گا۔</>,
  ],
  android: [
    <>براؤزر کا <B>مینو</B> کھولیں (تین نقطے)۔</>,
    <><B>Install app</B> یا <B>Add to Home screen</B> منتخب کریں۔</>,
    <>تصدیق کریں۔ Sankshep آپ کے باقی ایپس کے ساتھ ظاہر ہونے لگے گا۔</>,
  ],
}

export default t
