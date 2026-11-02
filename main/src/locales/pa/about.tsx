import type { ReactNode } from 'react'
import type { ABOUT_COPY } from '../../pages/AboutPage'

const Strong = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>

const t: typeof ABOUT_COPY.en = {
  eyebrow: 'ਸਾਡੇ ਬਾਰੇ',
  intro: <>ਅਸੀਂ Sankshep.ai ਨੂੰ <Strong>ਸਮਾਰਟ ਇੰਡੀਆ ਹੈਕਾਥਨ</Strong> ਲਈ ਬਣਾਇਆ ਹੈ: ਇੱਕ ਅਜਿਹਾ ਵਰਕਸਪੇਸ ਜੋ ਇੱਕ ਸਰੋਤ ਦਸਤਾਵੇਜ਼ ਨੂੰ ਉਹਨਾਂ ਫਾਰਮੈਟਾਂ ਵਿੱਚ ਬਦਲ ਦਿੰਦਾ ਹੈ ਜੋ ਲੋਕਾਂ ਨੂੰ ਅਸਲ ਵਿੱਚ ਭੇਜਣੇ ਪੈਂਦੇ ਹਨ।</>,
  problemLabel: 'SIH ਸਮੱਸਿਆ ਦਾ ਵੇਰਵਾ',
  problem: '“ਸਵੈਚਾਲਿਤ ਕੰਟੈਂਟ ਬਦਲਾਅ ਲਈ Gen AI ਪਲੇਟਫਾਰਮ”',
  why: [
    'ਸੰਸਥਾਵਾਂ ਖਬਰਾਂ, ਰਿਪੋਰਟਾਂ, ਸਲਾਹਾਂ, ਨੀਤੀ ਦਸਤਾਵੇਜ਼ਾਂ ਅਤੇ ਰਿਸਰਚ ਨੂੰ ਬ੍ਰੀਫ, ਪੋਸਟ, ਡੇਕ ਅਤੇ ਸਕ੍ਰਿਪਟ ਵਿੱਚ ਬਦਲਣ ਵਿੱਚ ਘੰਟੇ ਲਗਾਉਂਦੀਆਂ ਹਨ। ਹਰ ਵਾਰ ਸਰੋਤ ਨੂੰ ਦੁਬਾਰਾ ਪੜ੍ਹਨਾ ਪੈਂਦਾ ਹੈ, ਸਮਝਣਾ ਪੈਂਦਾ ਹੈ ਕਿ ਪਾਠਕਾਂ ਨੂੰ ਕੀ ਚਾਹੀਦਾ ਹੈ, ਅਤੇ ਸਭ ਕੁਝ ਸ਼ੁਰੂ ਤੋਂ ਲਿਖਣਾ ਪੈਂਦਾ ਹੈ।',
    'Sankshep.ai ਇਹੀ ਕੰਮ ਉਹਨਾਂ ਲਈ ਕਰਦਾ ਹੈ। ਇੱਕ ਦਸਤਾਵੇਜ਼ ਅੱਪਲੋਡ ਕਰੋ, ਫਾਰਮੈਟ ਅਤੇ ਪਾਠਕ ਚੁਣੋ, ਅਤੇ ਹਰ ਡ੍ਰਾਫਟ ਉਸੇ ਸਰੋਤ ਤੋਂ ਇੱਕਠੇ ਲਿਖਿਆ ਜਾਂਦਾ ਹੈ, ਜਾਂਚਣ ਅਤੇ ਬਦਲਣ ਲਈ ਤਿਆਰ।',
  ],
  name: <><span className="font-semibold text-ink">ਨਾਮ “Sankshep” ਕਿਉਂ?</span> ਸੰਖੇਪ ਦਾ ਅਰਥ ਹੈ “ਸੰਖੇਪ ਵਿੱਚ” ਜਾਂ “ਘੱਟ ਸ਼ਬਦਾਂ ਵਿੱਚ”।</>,
  team: 'ਟੀਮ',
  cta: 'ਦੇਖੋ, ਅੱਪਲੋਡ ਤੋਂ ਡ੍ਰਾਫਟ ਤੱਕ ਕੀ ਹੁੰਦਾ ਹੈ।',
  howItWorks: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
  readCode: 'ਕੋਡ ਪੜ੍ਹੋ',
}

export default t
