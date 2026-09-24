import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, ADMIN_EMAIL, DEMO_EMAIL } from '../lib/supabase'
import { logActivity } from '../lib/activity'
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
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
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

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.'

  // Accounts are active immediately. This only happens if "Confirm email" is
  // still switched on in the Supabase dashboard.
  if (/email not confirmed|email rate limit exceeded|error sending confirmation/i.test(message)) {
    return 'Sign-up is misconfigured: email confirmation is still enabled in Supabase. Ask the site admin to turn off “Confirm email”.'
  }

  if (/rate limit|too many requests/i.test(message)) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }
  return message
}

/* ─── Context ────────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? toAuthUser(data.session.user) : null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAuthUser(session.user) : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: normaliseEmail(email),
      password,
    })
    if (error) return { error: friendlyAuthError(error.message) }
    void logActivity({ action: 'login' })
    return { error: null }
  }

  // No email verification: the account is created and signed in immediately.
  const signUp = async (email: string, password: string) => {
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
  }

  // Permanently deletes the signed-in account (and, by cascade, its profile and
  // activity history) via the delete_my_account() database function.
  const deleteAccount = async () => {
    const { error } = await supabase.rpc('delete_my_account')
    if (error) return { error: error.message }
    // The user no longer exists server-side; just clear the local session.
    await supabase.auth.signOut({ scope: 'local' })
    setUser(null)
    return { error: null }
  }

  const signOut = async () => {
    await logActivity({ action: 'logout' })
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, deleteAccount, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
