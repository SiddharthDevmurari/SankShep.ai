import type { INSTALL_COPY } from '../../components/InstallApp'
import { type ReactNode } from 'react'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS ಗಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ', android: 'Android ಗಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' },
  title: (ios: boolean) => `ನಿಮ್ಮ ${ios ? 'iPhone ಅಥವಾ iPad' : 'Android ಸಾಧನ'}ದಲ್ಲಿ Sankshep ಅನ್ನು ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ`,
  free: 'ಉಚಿತ, ಯಾವುದೇ ಆಪ್ ಸ್ಟೋರ್ ಅಗತ್ಯವಿಲ್ಲ.',
  close: 'ಮುಚ್ಚಿ',
  inApp: (browser: string, download: string) => (
    <>ಈ ಪುಟವು ಬೇರೆ ಆಪ್ ಒಳಗೆ ತೆರೆದಿದೆ. ಮೊದಲು ಇದನ್ನು {browser} ನಲ್ಲಿ ತೆರೆಯಿರಿ (ಆಪ್ ಮೆನುವಿನಲ್ಲಿ <B>Open in browser</B> ಆಯ್ಕೆಮಾಡಿ), ನಂತರ <B>{download}</B> ಅನ್ನು ಮತ್ತೊಮ್ಮೆ ಒತ್ತಿ.</>
  ),
  ios: [
    <>ಬ್ರೌಸರ್‌ನ ಟೂಲ್‌ಬಾರ್‌ನಲ್ಲಿ <B>Share</B> ಬಟನ್ ಒತ್ತಿ.</>,
    <>ಕೆಳಗೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ ಮತ್ತು <B>Add to Home Screen</B> ಆಯ್ಕೆಮಾಡಿ.</>,
    <><B>Add</B> ಒತ್ತಿ. Sankshep ಯಾವುದೇ ಆಪ್‌ನಂತೆ ನಿಮ್ಮ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಿಂದ ತೆರೆಯುತ್ತದೆ.</>,
  ],
  android: [
    <>ಬ್ರೌಸರ್‌ನ <B>ಮೆನು</B> ತೆರೆಯಿರಿ (ಮೂರು ಚುಕ್ಕೆಗಳು).</>,
    <><B>Install app</B> ಅಥವಾ <B>Add to Home screen</B> ಆಯ್ಕೆಮಾಡಿ.</>,
    <>ದೃಢೀಕರಿಸಿ. Sankshep ನಿಮ್ಮ ಉಳಿದ ಆಪ್‌ಗಳೊಂದಿಗೆ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.</>,
  ],
}

export default t
