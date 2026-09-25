/**
 * Installing Sankshep as an app (PWA). Android and desktop Chromium browsers fire
 * `beforeinstallprompt`, which we keep so a button can open the real install dialog.
 * iOS has no install API: the user adds the site from the Share menu, so the UI shows
 * those steps instead.
 */

import { useSyncExternalStore } from 'react'

export type Platform = 'android' | 'ios' | 'other'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  // iPadOS reports itself as a Mac; a touch screen gives it away.
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  return 'other'
}

function runningAsApp() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

interface InstallState {
  platform: Platform
  /** Opened from the home screen / app icon, or installed during this visit. */
  installed: boolean
  /** The browser handed us its install dialog (Android Chrome, Edge, Samsung Internet…). */
  canPrompt: boolean
}

let deferred: InstallPromptEvent | null = null
let state: InstallState = { platform: detectPlatform(), installed: runningAsApp(), canPrompt: false }
const listeners = new Set<() => void>()

function update(next: Partial<InstallState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

/** Call once at startup, before React renders: the prompt event can fire very early. */
export function initInstall() {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // Keep it for our button instead of the browser's own mini-bar.
    deferred = e as InstallPromptEvent
    update({ canPrompt: true })
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    update({ installed: true, canPrompt: false })
  })
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('[install] service worker failed', err))
    })
  }
}

/** Opens the browser's install dialog. Resolves true if the user installed. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const event = deferred
  deferred = null // A prompt event can only be used once.
  update({ canPrompt: false })
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') update({ installed: true })
  return outcome === 'accepted'
}

export function useInstall(): InstallState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
    () => state,
  )
}
