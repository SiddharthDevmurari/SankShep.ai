import type { ReactNode } from 'react'
import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS-க்கு பதிவிறக்கவும்', android: 'Android-க்கு பதிவிறக்கவும்' },
  title: (ios: boolean) => `உங்கள் ${ios ? 'iPhone அல்லது iPad-இல்' : 'Android சாதனத்தில்'} Sankshep-ஐ இன்ஸ்டால் செய்யுங்கள்`,
  free: 'இலவசம், ஆப் ஸ்டோர் எதுவும் தேவையில்லை.',
  close: 'மூடுக',
  inApp: (browser: string, download: string) => (
    <>இந்தப் பக்கம் வேறு ஒரு ஆப்பின் உள்ளே திறக்கப்பட்டுள்ளது. முதலில் இதை {browser}-இல் திறக்கவும் (ஆப்பின் மெனுவில் <B>Open in browser</B>-ஐத் தேர்ந்தெடுக்கவும்), பிறகு மீண்டும் <B>{download}</B>-ஐத் தட்டவும்.</>
  ),
  ios: [
    <>பிரவுசரின் டூல்பாரில் <B>Share</B> பொத்தானைத் தட்டவும்.</>,
    <>கீழே ஸ்க்ரோல் செய்து <B>Add to Home Screen</B>-ஐத் தேர்ந்தெடுக்கவும்.</>,
    <><B>Add</B>-ஐத் தட்டவும். Sankshep எந்தவொரு ஆப்பையும் போல உங்கள் ஹோம் ஸ்கிரீனிலிருந்து திறக்கும்.</>,
  ],
  android: [
    <>பிரவுசரின் <B>மெனுவை</B> திறக்கவும் (மூன்று புள்ளிகள்).</>,
    <><B>Install app</B> அல்லது <B>Add to Home screen</B>-ஐத் தேர்ந்தெடுக்கவும்.</>,
    <>உறுதிப்படுத்தவும். Sankshep உங்கள் மற்ற ஆப்புகளுடன் தோன்றும்.</>,
  ],
}

export default t
