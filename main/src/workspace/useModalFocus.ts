import { useEffect, useRef, type RefObject } from 'react'

/**
 * Keyboard behaviour shared by the workspace's modal prompts: focus starts on `initialRef`,
 * Tab and Shift+Tab cycle through the panel's buttons, Escape cancels, and focus returns to
 * whatever had it once the prompt closes.
 */
export function useModalFocus(panelRef: RefObject<HTMLElement | null>, initialRef: RefObject<HTMLElement | null>, onCancel: () => void) {
  // The latest handler, so a parent re-render doesn't re-run the focus effect below.
  const cancelRef = useRef(onCancel)
  cancelRef.current = onCancel

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null
    initialRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelRef.current()
      } else if (e.key === 'Tab') {
        const buttons = [...(panelRef.current?.querySelectorAll('button') ?? [])]
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
        e.preventDefault()
        buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      returnTo?.focus?.()
    }
  }, [panelRef, initialRef])
}
