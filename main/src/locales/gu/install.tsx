import type { ReactNode } from 'react'
import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS માટે ડાઉનલોડ કરો', android: 'Android માટે ડાઉનલોડ કરો' },
  title: (ios: boolean) => `તમારા ${ios ? 'iPhone અથવા iPad' : 'Android ઉપકરણ'} પર Sankshep ઇન્સ્ટોલ કરો`,
  free: 'મફત, કોઈ એપ સ્ટોરની જરૂર નથી.',
  close: 'બંધ કરો',
  inApp: (browser: string, download: string) => (
    <>આ પેજ અન્ય એપની અંદર ખુલ્લું છે. પહેલા તેને {browser} માં ખોલો (એપના મેનૂમાં <B>Open in browser</B> પસંદ કરો), પછી ફરીથી <B>{download}</B> પર ટેપ કરો.</>
  ),
  ios: [
    <>બ્રાઉઝરના ટૂલબારમાં <B>Share</B> બટન પર ટેપ કરો.</>,
    <>નીચે સ્ક્રોલ કરો અને <B>Add to Home Screen</B> પસંદ કરો.</>,
    <><B>Add</B> પર ટેપ કરો. Sankshep કોઈ પણ એપની જેમ તમારી હોમ સ્ક્રીન પરથી ખુલશે.</>,
  ],
  android: [
    <>બ્રાઉઝરનું <B>મેનૂ</B> ખોલો (ત્રણ બિંદુઓ).</>,
    <><B>Install app</B> અથવા <B>Add to Home screen</B> પસંદ કરો.</>,
    <>પુષ્ટિ કરો. Sankshep તમારી અન્ય એપ્સ સાથે દેખાશે.</>,
  ],
}

export default t
