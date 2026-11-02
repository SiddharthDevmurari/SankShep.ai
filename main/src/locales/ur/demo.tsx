import type { DEMO_COPY } from '../../components/demo/copy'

const t: typeof DEMO_COPY.en = {
  region: 'Sankshep ورک اسپیس ڈیمو',
  description:
    'Sankshep ورک اسپیس کا ایک اینیمیٹڈ واک تھرو۔ ایک پوائنٹر SIH26154 کی پرابلم اسٹیٹمنٹ کو سورس کے طور پر شامل کرتا ہے، Executive Summary، LinkedIn Post اور Slide Deck منتخب کرتا ہے، قارئین اور ماڈل طے کرتا ہے، ڈرافٹ تیار کرتا ہے، LinkedIn پوسٹ کو بہتر بناتا ہے، ڈیک کو PowerPoint میں ڈاؤن لوڈ کرتا ہے اور اسے History میں تلاش کرتا ہے۔',
  play: 'ڈیمو چلائیں',
  pause: 'ڈیمو روکیں',
  prev: 'پچھلا مرحلہ',
  next: 'اگلا مرحلہ',
  jump: (label: string) => `اس مرحلے پر جائیں: ${label}`,
  stepOf: (n: number, total: number) => `مرحلہ ${n} / ${total}`,
  chapters: [
    { label: 'ماخذ جوڑیں', caption: 'کوئی رپورٹ، پیپر یا لنک شامل کریں۔ یہاں SIH26154 کی اصل پرابلم اسٹیٹمنٹ ہے۔' },
    { label: 'فارمیٹس چنیں', caption: 'جو بھی فارمیٹ چاہیے، سب چنیں۔ سب ایک ہی ماخذ سے لکھے جاتے ہیں۔' },
    { label: 'آڈینْس اور ماڈل', caption: 'بتائیں کہ اسے کون پڑھے گا، پھر لکھنے والا ماڈل چنیں۔' },
    { label: 'جنریٹ', caption: 'ایک کلک میں تینوں فارمیٹ ایک ساتھ تیار ہوتے ہیں۔' },
    { label: 'پڑھیں اور سدھاریں', caption: 'ہر ڈرافٹ پڑھیں، سادہ الفاظ میں تبدیلیاں مانگیں، پھر پوسٹ کا پیش منظر دیکھیں۔' },
    { label: 'ایکسپورٹ', caption: 'ڈیک کو PowerPoint میں، یا کوئی بھی ڈرافٹ Markdown یا سادہ ٹیکسٹ میں ڈاؤن لوڈ کریں۔' },
    { label: 'History', caption: 'ہر ڈرافٹ History میں محفوظ کیا جاتا ہے، جہاں آپ فارمیٹ سے فلٹر کر سکتے ہیں۔' },
  ],
}

export default t
