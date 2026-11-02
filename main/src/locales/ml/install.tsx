import type { ReactNode } from 'react'
import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS-നായി ഡൗൺലോഡ് ചെയ്യുക', android: 'Android-നായി ഡൗൺലോഡ് ചെയ്യുക' },
  title: (ios: boolean) => `നിങ്ങളുടെ ${ios ? 'iPhone അല്ലെങ്കിൽ iPad' : 'Android ഡിവൈസിൽ'} Sankshep ഇൻസ്റ്റാൾ ചെയ്യുക`,
  free: 'സൗജന്യമാണ്, ആപ്പ് സ്റ്റോറിന്റെ ആവശ്യമില്ല.',
  close: 'അടയ്ക്കുക',
  inApp: (browser: string, download: string) => (
    <>ഈ പേജ് മറ്റൊരു ആപ്പിനുള്ളിലാണ് തുറന്നിരിക്കുന്നത്. ആദ്യം ഇത് {browser}-ൽ തുറക്കുക (ആപ്പിന്റെ മെനു ഉപയോഗിച്ച് <B>Open in browser</B> തിരഞ്ഞെടുക്കുക), തുടർന്ന് <B>{download}</B> വീണ്ടും അമർത്തുക.</>
  ),
  ios: [
    <>ബ്രൗസറിന്റെ ടൂൾബാറിലെ <B>Share</B> ബട്ടൺ അമർത്തുക.</>,
    <>താഴേക്ക് സ്ക്രോൾ ചെയ്ത് <B>Add to Home Screen</B> തിരഞ്ഞെടുക്കുക.</>,
    <><B>Add</B> അമർത്തുക. Sankshep ഏതൊരു ആപ്പും പോലെ നിങ്ങളുടെ ഹോം സ്ക്രീനിൽ നിന്ന് തുറക്കാവുന്നതാണ്.</>,
  ],
  android: [
    <>ബ്രൗസറിന്റെ <B>മെനു</B> തുറക്കുക (മൂന്ന് ബിന്ദുക്കൾ).</>,
    <><B>Install app</B> അല്ലെങ്കിൽ <B>Add to Home screen</B> തിരഞ്ഞെടുക്കുക.</>,
    <>സ്ഥിരീകരിക്കുക. Sankshep നിങ്ങളുടെ മറ്റ് ആപ്പുകൾക്കൊപ്പം ദൃശ്യമാകും.</>,
  ],
}

export default t
