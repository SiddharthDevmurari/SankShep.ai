import type { ReactNode } from 'react'
import type { ABOUT_COPY } from '../../pages/AboutPage'

const Strong = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>

const t: typeof ABOUT_COPY.en = {
  eyebrow: 'ہمارے بارے میں',
  intro: <>ہم نے Sankshep.ai کو <Strong>اسمارٹ انڈیا ہیکاتھون</Strong> کے لیے بنایا ہے: ایک ایسا ورک اسپیس جو ایک سورس دستاویز کو ان فارمیٹس میں بدل دیتا ہے جو لوگوں کو اصل میں بھیجنے ہوتے ہیں۔</>,
  problemLabel: 'SIH پرابلم اسٹیٹمنٹ',
  problem: '“خودکار مواد کی تبدیلی کے لیے Gen AI پلیٹ فارم”',
  why: [
    'تنظیمیں خبروں، رپورٹس، ایڈوائزریز، پالیسی دستاویزات اور ریسرچ کو بریف، پوسٹس، ڈیکس اور اسکرٹس میں بدلنے میں گھنٹوں لگاتی ہیں۔ ہر ایک کا مطلب ہے سورس کو دوبارہ پڑھنا، یہ سمجھنا کہ آڈینَس کو کیا چاہیے، اور اسے شروع سے لکھنا۔',
    'Sankshep.ai ان کے لیے وہ قدم اٹھاتا ہے۔ ایک دستاویز اپ لوڈ کریں، فارمیٹس اور آڈینَس کا انتخاب کریں، اور ہر ڈرافٹ اسی سورس سے متوازی طور پر لکھا جاتا ہے، جانچنے اور ایڈٹ کرنے کے لیے تیار۔',
  ],
  name: <><span className="font-semibold text-ink">“Sankshep” کیوں؟</span>سنکشیپ ہندی میں “مختصر میں” کا مطلب ہے۔</>,
  team: 'ٹیم',
  cta: 'دیکھیں اپ لوڈ اور ڈرافٹ کے درمیان کیا ہوتا ہے۔',
  howItWorks: 'یہ کیسے کام کرتا ہے',
  readCode: 'کوڈ پڑھیں',
}

export default t
