import type { INSTALL_COPY } from '../../components/InstallApp'
import { type ReactNode } from 'react'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS ପାଇଁ ଡାଉନଲୋଡ କରନ୍ତୁ', android: 'Android ପାଇଁ ଡାଉନଲୋଡ କରନ୍ତୁ' },
  title: (ios: boolean) => `ଆପଣଙ୍କ ${ios ? 'iPhone କିମ୍ବା iPad' : 'Android ଡିଭାଇସ'}ରେ Sankshep ଇନଷ୍ଟଲ କରନ୍ତୁ`,
  free: 'ମାଗଣା, କୌଣସି ଆପ୍ ଷ୍ଟୋରର ଆବଶ୍ୟକତା ନାହିଁ।',
  close: 'ବନ୍ଦ କରନ୍ତୁ',
  inApp: (browser: string, download: string) => (
    <>ଏହି ପେଜ୍ଟି ଅନ୍ୟ ଏକ ଆପ୍ ଭିତରେ ଖୋଲା ଅଛି। ପ୍ରଥମେ ଏହାକୁ {browser}ରେ ଖୋଲନ୍ତୁ (ଆପ୍ର ମେନ୍ୟୁ ବ୍ୟବହାର କରି <B>Open in browser</B> ବାଛନ୍ତୁ), ତା’ପରେ ପୁଣିଥାଏ <B>{download}</B> ଉପରେ ଟାପ୍ କରନ୍ତୁ।</>
  ),
  ios: [
    <>ବ୍ରାଉଜରର ଟୁଲବାରରେ <B>Share</B> ବଟନ୍ ଟାପ୍ କରନ୍ତୁ।</>,
    <>ତଳକୁ ସ୍କ୍ରୋଲ୍ କରନ୍ତୁ ଏବଂ <B>Add to Home Screen</B> ବାଛନ୍ତୁ।</>,
    <><B>Add</B> ଟାପ୍ କରନ୍ତୁ। Sankshep ଯେକୌଣସି ଆପ୍ ପରି ଆପଣଙ୍କ ହୋମ୍ ସ୍କ୍ରିନରୁ ଖୋଲିବ।</>,
  ],
  android: [
    <>ବ୍ରାଉଜରର <B>ମେନ୍ୟୁ</B> ଖୋଲନ୍ତୁ (ତିନୋଟି ବିନ୍ଦୁ)।</>,
    <><B>Install app</B> କିମ୍ବା <B>Add to Home screen</B> ବାଛନ୍ତୁ।</>,
    <>ନିଶ୍ଚିତ କରନ୍ତୁ। Sankshep ଆପଣଙ୍କର ଅନ୍ୟାନ୍ୟ ଆପ୍ ଗୁଡ଼ିକ ସହିତ ଦୃଶ୍ୟମାନ ହେବ।</>,
  ],
}

export default t
