import type { ReactNode } from 'react'
import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS కోసం డౌన్‌లోడ్ చేయండి', android: 'Android కోసం డౌన్‌లోడ్ చేయండి' },
  title: (ios: boolean) => `మీ ${ios ? 'iPhone లేదా iPad' : 'Android పరికరంలో'} Sankshep ఇన్‌స్టాల్ చేయండి`,
  free: 'ఉచితం, యాప్ స్టోర్ అవసరం లేదు.',
  close: 'మూసివేయి',
  inApp: (browser: string, download: string) => (
    <>ఈ పేజీ మరొక యాప్ లోపల తెరిచి ఉంది. మొదట దీన్ని {browser} లో తెరవండి (యాప్ మెనూలో <B>Open in browser</B> ఎంచుకోండి), ఆపై మళ్లీ <B>{download}</B> నొక్కండి.</>
  ),
  ios: [
    <>మీ బ్రౌజర్ టూల్‌బార్‌లో <B>Share</B> బటన్‌ను నొక్కండి.</>,
    <>కిందికి స్క్రోల్ చేసి <B>Add to Home Screen</B> ఎంచుకోండి.</>,
    <><B>Add</B> నొక్కండి. Sankshep ఏ యాప్‌లా అయినా మీ హోమ్ స్క్రీన్ నుండి తెరుచుకుంటుంది.</>,
  ],
  android: [
    <>మీ బ్రౌజర్ <B>మెనూ</B> తెరవండి (మూడు చుక్కలు).</>,
    <><B>Install app</B> లేదా <B>Add to Home screen</B> ఎంచుకోండి.</>,
    <>నిర్ధారించండి. Sankshep మీ ఇతర యాప్‌లతో పాటు కనిపిస్తుంది.</>,
  ],
}

export default t
