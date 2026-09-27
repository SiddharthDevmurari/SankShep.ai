import { useRef } from 'react'
import { KeyRound } from 'lucide-react'
import { providerInfo, type OwnKeyError } from '../lib/providers'
import { useModalFocus } from './useModalFocus'

/**
 * Asks before the shared keys stand in for a failing own key. Shows the provider's exact error;
 * "Use Sankshep Key" retries through the shared keys, Cancel (or Escape, or a click outside)
 * leaves everything idle. Focus starts on the primary action and stays inside while open.
 */
export function KeyConsentDialog({ error, onUseShared, onCancel }: {
  error: OwnKeyError
  onUseShared: () => void
  onCancel: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const name = providerInfo(error.provider).name
  useModalFocus(panelRef, primaryRef, onCancel)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="key-consent-title"
        aria-describedby="key-consent-error key-consent-question"
        className="sk-pop w-full max-w-[460px] overflow-hidden rounded-2xl border border-hair bg-white shadow-[0_24px_60px_-20px_rgba(15,16,15,0.35)]"
      >
        <div className="px-6 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-deep text-ink ring-1 ring-hair" aria-hidden>
              <KeyRound className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <h2 id="key-consent-title" className="text-[16px] font-semibold text-ink">
              {error.kind === 'unreachable' ? `${name} isn’t answering requests with your API key` : `Your ${name} API key didn’t work`}
            </h2>
          </div>

          <p
            id="key-consent-error"
            className="mt-4 max-h-40 overflow-y-auto break-words rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 font-mono text-[12px] leading-relaxed text-red-800"
          >
            {error.message}
          </p>

          <p id="key-consent-question" className="mt-4 text-[14px] leading-relaxed text-ink">
            Would you like to generate this using Sankshep.ai's free API key instead?
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-hair bg-paper px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl px-4 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            Cancel
          </button>
          <button
            ref={primaryRef}
            type="button"
            onClick={onUseShared}
            className="min-h-11 rounded-xl bg-ink px-5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
          >
            Use Sankshep Key
          </button>
        </div>
      </div>
    </div>
  )
}
