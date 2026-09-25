import { useEffect, useRef, useState } from 'react'
import { Download, EllipsisVertical, Share, SquarePlus, X } from 'lucide-react'
import { promptInstall, useInstall, type Platform } from '../lib/install'

/**
 * "Download for Android" / "Download for iOS", shown only on those devices and only
 * while the app isn't installed. Android opens the browser's install dialog when it
 * offers one; otherwise (and always on iOS, which has no install API) it shows the
 * few taps that add Sankshep to the home screen.
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
  const { platform, installed, canPrompt } = useInstall()
  const [showSteps, setShowSteps] = useState(false)

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
        {platform === 'ios' ? 'Download for iOS' : 'Download for Android'}
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

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ios = platform === 'ios'
  const steps: { icon: typeof Share; text: React.ReactNode }[] = ios
    ? [
        { icon: Share, text: <>Tap the <b className="font-semibold text-ink">Share</b> button in your browser's toolbar.</> },
        { icon: SquarePlus, text: <>Scroll down and choose <b className="font-semibold text-ink">Add to Home Screen</b>.</> },
        { icon: Download, text: <>Tap <b className="font-semibold text-ink">Add</b>. Sankshep opens from your home screen like any app.</> },
      ]
    : [
        { icon: EllipsisVertical, text: <>Open your browser's <b className="font-semibold text-ink">menu</b> (the three dots).</> },
        { icon: SquarePlus, text: <>Choose <b className="font-semibold text-ink">Install app</b> or <b className="font-semibold text-ink">Add to Home screen</b>.</> },
        { icon: Download, text: <>Confirm. Sankshep appears with your other apps.</> },
      ]

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
                Install Sankshep on your {ios ? 'iPhone or iPad' : 'Android device'}
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">Free, no app store needed.</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {inAppBrowser() ? (
          <p className="mt-5 rounded-xl border border-hair bg-paper px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
            This page is open inside another app. Open it in {ios ? 'Safari' : 'Chrome'} first (use the app's menu, then <b className="font-semibold text-ink">Open in browser</b>), then tap <b className="font-semibold text-ink">{ios ? 'Download for iOS' : 'Download for Android'}</b> again.
          </p>
        ) : (
          <ol className="mt-5 space-y-3">
            {steps.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-soft">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper-deep ring-1 ring-hair">
                  <Icon className="h-4 w-4 text-ink" />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
