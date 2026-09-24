import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  description: React.ReactNode
  /** The user must type this exactly to enable the delete button. */
  confirmText: string
  confirmLabel: string
  onConfirm: () => Promise<{ error: string | null }>
  onClose: () => void
}

/** Modal for irreversible deletes: the user types `confirmText` to proceed. */
export function ConfirmDeleteDialog({ title, description, confirmText, confirmLabel, onConfirm, onClose }: Props) {
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const matches = typed.trim().toLowerCase() === confirmText.toLowerCase()

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matches) return
    setBusy(true)
    setError(null)
    const { error } = await onConfirm()
    if (error) {
      setError(error)
      setBusy(false)
    }
    // On success the caller unmounts this dialog.
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose() }}
    >
      <form
        onSubmit={handleConfirm}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="w-full max-w-[420px] rounded-2xl border border-hair bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,16,15,0.35)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-delete-title" className="text-[16px] font-semibold text-ink">{title}</h2>
            <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">{description}</div>
          </div>
        </div>

        <label className="mt-5 block text-[12.5px] text-ink-soft" htmlFor="confirm-delete-input">
          Type <span className="font-semibold text-ink">{confirmText}</span> to confirm
        </label>
        <input
          id="confirm-delete-input"
          autoFocus
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-hair bg-white px-3.5 py-2.5 text-[13.5px] text-ink outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">{error}</div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-hair bg-white px-4 py-2 text-[13px] font-medium text-ink-soft hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!matches || busy}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
