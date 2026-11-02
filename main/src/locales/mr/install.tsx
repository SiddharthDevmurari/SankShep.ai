import type { ReactNode } from 'react'
import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS साठी डाउनलोड करा', android: 'Android साठी डाउनलोड करा' },
  title: (ios: boolean) => `आपल्या ${ios ? 'iPhone किंवा iPad' : 'Android डिव्हाइस'}वर Sankshep इंस्टॉल करा`,
  free: 'मोफत, कोणत्याही ॲप स्टोअरची गरज नाही.',
  close: 'बंद करा',
  inApp: (browser: string, download: string) => (
    <>हे पेज दुसऱ्या ॲपच्या आत उघडले आहे. आधी ते {browser} मध्ये उघडा (ॲपच्या मेनूमध्ये <B>Open in browser</B> निवडा), नंतर <B>{download}</B> पुन्हा दाबा.</>
  ),
  ios: [
    <>ब्राउझरच्या टूलबारमध्ये <B>Share</B> बटण दाबा.</>,
    <>खाली स्क्रोल करा आणि <B>Add to Home Screen</B> निवडा.</>,
    <><B>Add</B> दाबा. Sankshep कोणत्याही ॲपसारखा तुमच्या होम स्क्रीनवरून उघडेल.</>,
  ],
  android: [
    <>ब्राउझरचा <B>मेनू</B> उघडा (तीन ठिपके).</>,
    <><B>Install app</B> किंवा <B>Add to Home screen</B> निवडा.</>,
    <>पुष्टी करा. Sankshep तुमच्या इतर ॲप्ससोबत दिसेल.</>,
  ],
}

export default t
