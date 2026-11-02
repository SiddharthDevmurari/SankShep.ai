import type { DEMO_COPY } from '../../components/demo/copy'

const t: typeof DEMO_COPY.en = {
  region: 'Sankshep ਵਰਕਸਪੇਸ ਡੈਮੋ',
  description:
    'Sankshep ਵਰਕਸਪੇਸ ਦਾ ਇੱਕ ਐਨੀਮੇਟਡ ਵਾਕਥਰੂ। ਇੱਕ ਪੁਆਇੰਟਰ SIH26154 ਦੀ ਸਮੱਸਿਆ ਦਾ ਵੇਰਵਾ ਸਰੋਤ ਵਜੋਂ ਜੋੜਦਾ ਹੈ, Executive Summary, LinkedIn Post ਅਤੇ Slide Deck ਚੁਣਦਾ ਹੈ, ਪਾਠਕ ਅਤੇ ਮਾਡਲ ਤੈਅ ਕਰਦਾ ਹੈ, ਡਰਾਫਟ ਤਿਆਰ ਕਰਦਾ ਹੈ, LinkedIn ਪੋਸਟ ਨੂੰ ਸੁਧਾਰਦਾ ਹੈ, ਡੈੱਕ ਨੂੰ PowerPoint ਵਿੱਚ ਡਾਊਨਲੋਡ ਕਰਦਾ ਹੈ ਅਤੇ ਉਸਨੂੰ History ਵਿੱਚ ਲੱਭਦਾ ਹੈ।',
  play: 'ਡੈਮੋ ਚਲਾਓ',
  pause: 'ਡੈਮੋ ਰੋਕੋ',
  prev: 'ਪਿਛਲਾ ਕਦਮ',
  next: 'ਅਗਲਾ ਕਦਮ',
  jump: (label: string) => `ਇਸ ਕਦਮ 'ਤੇ ਜਾਓ: ${label}`,
  stepOf: (n: number, total: number) => `ਕਦਮ ${n} / ${total}`,
  chapters: [
    { label: 'ਸਰੋਤ ਜੋੜੋ', caption: 'ਕੋਈ ਰਿਪੋਰਟ, ਪੇਪਰ ਜਾਂ ਲਿੰਕ ਪਾਓ। ਇੱਥੇ SIH26154 ਦਾ ਅਸਲ ਸਮੱਸਿਆ ਵੇਰਵਾ ਹੈ।' },
    { label: 'ਫਾਰਮੈਟ ਚੁਣੋ', caption: 'ਜੋ ਵੀ ਫਾਰਮੈਟ ਚਾਹੀਦਾ ਹੈ, ਸਭ ਚੁਣੋ। ਸਭ ਇੱਕ ਹੀ ਸਰੋਤ ਤੋਂ ਲਿਖੇ ਜਾਂਦੇ ਹਨ।' },
    { label: 'Audience ਅਤੇ ਮਾਡਲ', caption: 'ਦੱਸੋ ਕਿ ਇਸਨੂੰ ਕੌਣ ਪੜ੍ਹੇਗਾ, ਫਿਰ ਲਿਖਣ ਵਾਲਾ ਮਾਡਲ ਚੁਣੋ।' },
    { label: 'ਜਨਰੇਟ', caption: 'ਇੱਕ ਕਲਿੱਕ ਵਿੱਚ ਤਿੰਨੋਂ ਫਾਰਮੈਟ ਇੱਕੋ ਸਮੇਂ ਤਿਆਰ ਹੁੰਦੇ ਹਨ।' },
    { label: 'ਪੜ੍ਹੋ ਅਤੇ ਸੁਧਾਰੋ', caption: 'ਹਰ ਡਰਾਫਟ ਪੜ੍ਹੋ, ਸਧਾਰਨ ਸ਼ਬਦਾਂ ਵਿੱਚ ਬਦਲਾਅ ਮੰਗੋ, ਫਿਰ ਪੋਸਟ ਦਾ ਪ੍ਰੀਵਿਊ ਦੇਖੋ।' },
    { label: 'ਐਕਸਪੋਰਟ', caption: 'ਡੈਕ ਨੂੰ PowerPoint ਵਿੱਚ, ਜਾਂ ਕੋਈ ਵੀ ਡ੍ਰਾਫਟ Markdown ਜਾਂ ਸਾਦੇ ਟੈਕਸਟ ਵਿੱਚ ਡਾਊਨਲੋਡ ਕਰੋ।' },
    { label: 'History', caption: 'ਹਰ ਡ੍ਰਾਫਟ History ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਜਿੱਥੇ ਤੁਸੀਂ ਫਾਰਮੈਟ ਨਾਲ ਫਿਲਟਰ ਕਰ ਸਕਦੇ ਹੋ।' },
  ],
}

export default t
