import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, ADMIN_EMAIL, DEMO_EMAIL } from '../lib/supabase'
import { fetchMyAccountDisabled, logActivity } from '../lib/activity'
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../lib/password'
import type { User } from '@supabase/supabase-js'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string
  email: string
  isAdmin: boolean
  /** The shared demo account — can't be deleted. */
  isDemo: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /**
   * The email of an account an admin disabled while it was signed in here; the sign-in page
   * explains it. Cleared by clearDisabledNotice.
   */
  disabledEmail: string | null
  clearDisabledNotice: () => void
  /** `disabled`: the account exists but an admin has disabled it. */
  signIn: (email: string, password: string) => Promise<{ error: string | null; disabled?: boolean }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  deleteAccount: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

// Admin status here only gates the UI. The database enforces it independently
// via public.is_admin() in RLS policies.
function toAuthUser(u: User): AuthUser {
  const email = u.email ?? ''
  const lower = email.toLowerCase()
  return { id: u.id, email, isAdmin: lower === ADMIN_EMAIL, isDemo: lower === DEMO_EMAIL }
}

const normaliseEmail = (email: string) => email.trim().toLowerCase()

/** Supabase Auth refuses a disabled (banned) account with code `user_banned`, "User is banned". */
function isBannedError(err: { code?: string; message?: string }) {
  return err.code === 'user_banned' || /user is banned/i.test(err.message ?? '')
}

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.'
  if (/user is banned/i.test(message)) return 'This account has been disabled by the administrator.'

  // Accounts are active immediately. This only happens if "Confirm email" is
  // still switched on in the Supabase dashboard.
  if (/email not confirmed|email rate limit exceeded|error sending confirmation/i.test(message)) {
    return 'Sign-up is misconfigured: email confirmation is still enabled in Supabase. Ask the site admin to turn off “Confirm email”.'
  }

  if (/rate limit|too many requests/i.test(message)) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  // Supabase returns network failures as errors carrying the browser's wording (Chrome, Safari, Firefox).
  if (/failed to fetch|load failed|networkerror|network request failed|fetch failed/i.test(message)) {
    return networkError(null)
  }
  return message
}

/** A request that threw instead of returning an error: almost always the network. */
function networkError(err: unknown): string {
  const detail = err instanceof Error && err.message ? ` (${err.message})` : ''
  return `Couldn't reach the sign-in service${detail}. Check your connection and try again.`
}

/** How long the first session check may take before the app stops waiting and shows the signed-out state. */
const SESSION_CHECK_TIMEOUT_MS = 12_000

/**
 * How often a signed-in tab asks whether its account has been disabled. Disabling ends the account's
 * sessions, but an access token already issued stays valid for up to an hour; this ends it sooner.
 */
const DISABLED_CHECK_MS = 2 * 60_000

/* ─── Context ────────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Token refreshes hand back a new User object for the same person; keep the old one so
    // everything keyed on `user` doesn't re-render (or re-fetch) every hour.
    const apply = (next: User | null | undefined) =>
      setUser((prev) => {
        if (!next) return null
        const mapped = toAuthUser(next)
        return prev && prev.id === mapped.id && prev.email === mapped.email ? prev : mapped
      })

    // Until this settles, ProtectedRoute renders a neutral loading screen, never the workspace.
    // If it fails, treat the visitor as signed out rather than hanging on that screen.
    let settled = false
    const settle = () => {
      settled = true
      setLoading(false)
    }
    supabase.auth.getSession()
      .then(({ data }) => apply(data.session?.user))
      .catch(() => apply(null))
      .finally(settle)
    // A stored session whose refresh can't reach Supabase can leave getSession pending for a long
    // time on a bad connection. Stop waiting after a while; a later auth event still signs them in.
    const giveUp = window.setTimeout(() => { if (!settled) settle() }, SESSION_CHECK_TIMEOUT_MS)

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user))
    return () => {
      window.clearTimeout(giveUp)
      sub.subscription.unsubscribe()
    }
  }, [])

  // A signed-in account an admin disables is signed out here: on load, whenever the tab comes back
  // into view, and every couple of minutes. Only a clear "disabled" answer signs out; a failed check doesn't.
  const [disabledEmail, setDisabledEmail] = useState<string | null>(null)
  useEffect(() => {
    if (!user) return
    let stopped = false
    const check = async () => {
      if (document.visibilityState !== 'visible') return
      if ((await fetchMyAccountDisabled()) !== true || stopped) return
      stopped = true
      setDisabledEmail(user.email)
      // The account's sessions are already gone on the server; clear this device's copy.
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      setUser(null)
    }
    void check()
    const timer = window.setInterval(check, DISABLED_CHECK_MS)
    document.addEventListener('visibilitychange', check)
    window.addEventListener('focus', check)
    return () => {
      stopped = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('focus', check)
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    setDisabledEmail(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normaliseEmail(email),
        password,
      })
      if (error) return { error: friendlyAuthError(error.message), disabled: isBannedError(error) }
    } catch (err) {
      return { error: networkError(err) }
    }
    void logActivity({ action: 'login' })
    return { error: null }
  }

  // No email verification: the account is created and signed in immediately.
  const signUp = async (email: string, password: string) => {
    if (!isStrongPassword(password)) return { error: PASSWORD_POLICY_MESSAGE }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normaliseEmail(email),
        password,
      })
      if (error) return { error: friendlyAuthError(error.message) }

      // Supabase hides whether an email is taken: it returns a user with no
      // identities instead of an error. Surface that instead of a false "success".
      if (data.user && data.user.identities?.length === 0) {
        return { error: 'An account with this email already exists. Sign in instead.' }
      }

      // No session means Supabase is still set to require email confirmation.
      if (!data.session) return { error: friendlyAuthError('email not confirmed') }

      return { error: null }
    } catch (err) {
      return { error: networkError(err) }
    }
  }

  // Permanently deletes the signed-in account (and, by cascade, its profile and
  // activity history) via the delete_my_account() database function.
  const deleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_my_account')
      if (error) return { error: error.message }
    } catch (err) {
      return { error: networkError(err) }
    }
    // The user no longer exists server-side; just clear the local session.
    await supabase.auth.signOut({ scope: 'local' })
    setUser(null)
    return { error: null }
  }

  const signOut = async () => {
    await logActivity({ action: 'logout' })
    // When the server can't be reached, Supabase keeps the stored session, so the next page load
    // would sign the user straight back in. Clear it on this device regardless.
    const { error } = await supabase.auth.signOut().catch((err: unknown) => ({ error: err }))
    if (error) await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, disabledEmail, clearDisabledNotice: () => setDisabledEmail(null), signIn, signUp, deleteAccount, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
