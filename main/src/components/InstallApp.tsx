import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Download, EllipsisVertical, Share, SquarePlus, X } from 'lucide-react'
import { promptInstall, useInstall, type Platform } from '../lib/install'
import { useCopy } from '../i18n'

const B = ({ children }: { children: ReactNode }) => <b className="font-semibold text-ink">{children}</b>

// The browser's own menu labels (Share, Add to Home Screen…) stay in English, as most phones show them that way.
const en = {
  download: { ios: 'Download for iOS', android: 'Download for Android' },
  title: (ios: boolean) => `Install Sankshep on your ${ios ? 'iPhone or iPad' : 'Android device'}`,
  free: 'Free, no app store needed.',
  close: 'Close',
  inApp: (browser: string, download: string) => (
    <>This page is open inside another app. Open it in {browser} first (use the app's menu, then <B>Open in browser</B>), then tap <B>{download}</B> again.</>
  ),
  ios: [
    <>Tap the <B>Share</B> button in your browser's toolbar.</>,
    <>Scroll down and choose <B>Add to Home Screen</B>.</>,
    <>Tap <B>Add</B>. Sankshep opens from your home screen like any app.</>,
  ],
  android: [
    <>Open your browser's <B>menu</B> (the three dots).</>,
    <>Choose <B>Install app</B> or <B>Add to Home screen</B>.</>,
    <>Confirm. Sankshep appears with your other apps.</>,
  ],
}

const hi: typeof en = {
  download: { ios: 'iOS के लिए डाउनलोड करें', android: 'Android के लिए डाउनलोड करें' },
  title: (ios: boolean) => `अपने ${ios ? 'iPhone या iPad' : 'Android डिवाइस'} पर Sankshep इंस्टॉल करें`,
  free: 'मुफ़्त, किसी ऐप स्टोर की ज़रूरत नहीं।',
  close: 'बंद करें',
  inApp: (browser: string, download: string) => (
    <>यह पेज किसी दूसरे ऐप के अंदर खुला है। पहले इसे {browser} में खोलें (ऐप के मेन्यू में <B>Open in browser</B> चुनें), फिर <B>{download}</B> दोबारा दबाएँ।</>
  ),
  ios: [
    <>ब्राउज़र के टूलबार में <B>Share</B> बटन दबाएँ।</>,
    <>नीचे स्क्रॉल करें और <B>Add to Home Screen</B> चुनें।</>,
    <><B>Add</B> दबाएँ। Sankshep किसी भी ऐप की तरह आपकी होम स्क्रीन से खुलेगा।</>,
  ],
  android: [
    <>ब्राउज़र का <B>मेन्यू</B> खोलें (तीन बिंदु)।</>,
    <><B>Install app</B> या <B>Add to Home screen</B> चुनें।</>,
    <>पुष्टि करें। Sankshep आपके बाकी ऐप्स के साथ दिखने लगेगा।</>,
  ],
}

/**
 * "Download for Android" / "Download for iOS", shown only on those devices and only
 * while the app isn't installed. Android opens the browser's install dialog when it
 * offers one; otherwise (and always on iOS, which has no install API) it shows the
 * few taps that add Sankshep to the home screen.
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
  const { platform, installed, canPrompt } = useInstall()
  const [showSteps, setShowSteps] = useState(false)
  const t = useCopy({ en, hi })

  if (installed || platform === 'other') return null

  const onClick = async () => {
    if (platform === 'android' && canPrompt) {
      await promptInstall()
      return
    }
    setShowSteps(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`flex min-h-11 items-center gap-2 rounded-full border border-hair bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha ${className}`}
      >
        <Download className="h-4 w-4" />
        {platform === 'ios' ? t.download.ios : t.download.android}
      </button>
      {showSteps && <InstallSteps platform={platform} onClose={() => setShowSteps(false)} />}
    </>
  )
}

/** In-app browsers (Instagram, Facebook, LinkedIn…) can't add to the home screen. */
function inAppBrowser() {
  return /FBAN|FBAV|Instagram|LinkedInApp|Line\/|Snapchat|Twitter/i.test(navigator.userAgent)
}

function InstallSteps({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const t = useCopy({ en, hi })

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ios = platform === 'ios'
  const icons = ios ? [Share, SquarePlus, Download] : [EllipsisVertical, SquarePlus, Download]
  const texts = ios ? t.ios : t.android

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-4 backdrop-blur-[2px] sm:items-center sm:pb-0"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-steps-title"
        className="w-full max-w-[420px] rounded-2xl border border-hair bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,16,15,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/apple-touch-icon.png" alt="" className="h-11 w-11 rounded-xl" />
            <div>
              <h2 id="install-steps-title" className="text-[16px] font-semibold text-ink">
                {t.title(ios)}
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">{t.free}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {inAppBrowser() ? (
          <p className="mt-5 rounded-xl border border-hair bg-paper px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
            {t.inApp(ios ? 'Safari' : 'Chrome', ios ? t.download.ios : t.download.android)}
          </p>
        ) : (
          <ol className="mt-5 space-y-3">
            {texts.map((text, i) => {
              const Icon = icons[i]
              return (
                <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-soft">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper-deep ring-1 ring-hair">
                    <Icon className="h-4 w-4 text-ink" />
                  </span>
                  <span className="pt-1">{text}</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
