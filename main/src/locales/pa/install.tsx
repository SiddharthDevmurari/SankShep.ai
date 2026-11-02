import type { INSTALL_COPY } from '../../components/InstallApp'

const B = ({ children }: { children: any }) => <b className="font-semibold text-ink">{children}</b>

const t: typeof INSTALL_COPY.en = {
  download: { ios: 'iOS ਲਈ ਡਾਊਨਲੋਡ ਕਰੋ', android: 'Android ਲਈ ਡਾਊਨਲੋਡ ਕਰੋ' },
  title: (ios: boolean) => `ਆਪਣੇ ${ios ? 'iPhone ਜਾਂ iPad' : 'Android ਡਿਵਾਈਸ'} ਉੱਤੇ Sankshep ਇੰਸਟਾਲ ਕਰੋ`,
  free: 'ਮੁਫ਼ਤ, ਕਿਸੇ ਐਪ ਸਟੋਰ ਦੀ ਲੋੜ ਨਹੀਂ।',
  close: 'ਬੰਦ ਕਰੋ',
  inApp: (browser: string, download: string) => (
    <>ਇਹ ਪੇਜ ਕਿਸੇ ਹੋਰ ਐਪ ਦੇ ਅੰਦਰ ਖੁੱਲ੍ਹਾ ਹੈ। ਪਹਿਲਾਂ ਇਸਨੂੰ {browser} ਵਿੱਚ ਖੋਲ੍ਹੋ (ਐਪ ਦੇ ਮੀਨੂ ਵਿੱਚ <B>Open in browser</B> ਚੁਣੋ), ਫਿਰ <B>{download}</B> ਦੁਬਾਰਾ ਦਬਾਓ।</>
  ),
  ios: [
    <>ਬ੍ਰਾਊਜ਼ਰ ਦੇ ਟੂਲਬਾਰ ਵਿੱਚ <B>Share</B> ਬਟਨ ਦਬਾਓ।</>,
    <>ਹੇਠਾਂ ਸਕ੍ਰੋਲ ਕਰੋ ਅਤੇ <B>Add to Home Screen</B> ਚੁਣੋ।</>,
    <><B>Add</B> ਦਬਾਓ। Sankshep ਕਿਸੇ ਵੀ ਐਪ ਦੀ ਤਰ੍ਹਾਂ ਤੁਹਾਡੀ ਹੋਮ ਸਕ੍ਰੀਨ ਤੋਂ ਖੁੱਲ੍ਹੇਗਾ।</>,
  ],
  android: [
    <>ਬ੍ਰਾਊਜ਼ਰ ਦਾ <B>ਮੀਨੂ</B> ਖੋਲ੍ਹੋ (ਤਿੰਨ ਬਿੰਦੂ)।</>,
    <><B>Install app</B> ਜਾਂ <B>Add to Home screen</B> ਚੁਣੋ।</>,
    <>ਪੁਸ਼ਟੀ ਕਰੋ। Sankshep ਤੁਹਾਡੀਆਂ ਬਾਕੀ ਐਪਸ ਨਾਲ ਦਿਖਣ ਲੱਗੇਗਾ।</>,
  ],
}

export default t
