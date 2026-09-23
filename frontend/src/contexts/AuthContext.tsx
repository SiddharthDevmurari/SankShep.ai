import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string
  email: string
  isAdmin: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

/* ─── Mock auth (no Supabase) ─────────────────────────────────────────────── */

const MOCK_ACCOUNTS: Record<string, { password: string }> = {
  'demo@sankshep.ai': { password: 'demo123' },
  'admin@gmail.com': { password: 'admin' },
}

const MOCK_SESSION_KEY = 'sankshep_mock_user'

function mockSignIn(email: string, password: string): AuthUser | null {
  const acc = MOCK_ACCOUNTS[email.toLowerCase()]
  if (!acc || acc.password !== password) return null
  return buildMockUser(email)
}

function buildMockUser(email: string): AuthUser {
  return {
    id: `mock-${btoa(email)}`,
    email,
    isAdmin: email.toLowerCase() === 'admin@gmail.com',
  }
}

/* ─── Convert Supabase user → AuthUser ───────────────────────────────────── */

function toAuthUser(u: User): AuthUser {
  return {
    id: u.id,
    email: u.email ?? '',
    isAdmin: (u.email ?? '').toLowerCase() === 'admin@gmail.com',
  }
}

/* ─── Context ────────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  /* Init */
  useEffect(() => {
    if (isSupabaseEnabled && supabase) {
      supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
        if (data.session?.user) setUser(toAuthUser(data.session.user))
        setLoading(false)
      })

      const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        setUser(session?.user ? toAuthUser(session.user) : null)
      })
      return () => sub.subscription.unsubscribe()
    } else {
      // Mock: restore from sessionStorage
      try {
        const stored = sessionStorage.getItem(MOCK_SESSION_KEY)
        if (stored) setUser(JSON.parse(stored) as AuthUser)
      } catch { /* ignore */ }
      setLoading(false)
    }
  }, [])

  /* Sign in */
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    // Mock accounts (demo + admin) always take priority over Supabase
    const mockUser = mockSignIn(email, password)
    if (mockUser) {
      sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      return { error: null }
    }

    // Real Supabase auth for any other account
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    }

    return { error: 'Invalid email or password.' }
  }

  /* Sign up */
  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message }
      return { error: null }
    }
    // Mock: register and auto-login
    const u = buildMockUser(email)
    sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(u))
    setUser(u)
    return { error: null }
  }

  /* Sign out */
  const signOut = async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut()
    } else {
      sessionStorage.removeItem(MOCK_SESSION_KEY)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
