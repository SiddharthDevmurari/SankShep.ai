import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, LayoutDashboard, Home } from 'lucide-react'

export function GlobalHeader() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Landing page and workspace have their own self-contained headers
  if (pathname === '/' || pathname.startsWith('/workspace')) return null

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-hair bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="font-display text-[17px] text-ink group-hover:opacity-80 transition-opacity">
            Sankshep.ai
          </span>
          <span className="rounded-full border border-hair bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
            Beta
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
              pathname === '/' ? 'bg-paper-deep text-ink' : 'text-ink-soft hover:text-ink hover:bg-paper-deep/60'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <Link
            to="/workspace"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
              pathname.startsWith('/workspace') ? 'bg-paper-deep text-ink' : 'text-ink-soft hover:text-ink hover:bg-paper-deep/60'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Workspace
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-ink text-paper flex items-center justify-center text-[11px] font-bold">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-[12.5px] text-ink-soft max-w-[140px] truncate">{user.email}</span>
                {user.isAdmin && (
                  <span className="rounded-full bg-matcha px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-hair bg-white px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-paper transition-transform hover:-translate-y-0.5"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
