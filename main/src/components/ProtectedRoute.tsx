import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Client-side gate for every /workspace route. The workspace never renders until
 * the session check settles: while it runs this shows a neutral screen, and a
 * signed-out visitor is replaced to /login (so Back doesn't return here).
 *
 * This gate is for the interface only. The data is protected independently in
 * the database: row-level security and server-checked functions in
 * supabase/schema.sql refuse any request without a valid session.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-hair border-t-ink" aria-hidden />
          <p className="text-[13px] text-ink-soft">Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
