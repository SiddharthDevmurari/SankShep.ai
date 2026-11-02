import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'ਕਾਨੂੰਨੀ',
  updated: 'ਆਖ਼ਰੀ ਅੱਪਡੇਟ',
  summaryLabel: 'ਸਾਰ',
  shortVersion: 'ਸੰਖੇਪ ਵਿੱਚ',
  contents: 'ਵਿਸ਼ਾ-ਸੂਚੀ',
  readWith: (link: ReactNode) => <>ਇਸ ਨੂੰ ਸਾਡੀ {link} ਨਾਲ ਪੜ੍ਹੋ।</>,
  translationNote: 'ਇਹ ਪੰਜਾਬੀ ਅਨੁਵਾਦ ਤੁਹਾਡੀ ਸਹੂਲਤ ਲਈ ਹੈ। ਅੰਗਰੇਜ਼ੀ ਸੰਸਕਰਣ ਨਾਲ ਕੋਈ ਫ਼ਰਕ ਹੋਣ ’ਤੇ ਅੰਗਰੇਜ਼ੀ ਸੰਸਕਰਣ ਹੀ ਮੰਨਿਆ ਜਾਵੇਗਾ।',
}

export default t
