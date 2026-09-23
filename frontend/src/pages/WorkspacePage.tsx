import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TransformView } from '../workspace/TransformView'
import { ActivityView } from '../workspace/ActivityView'
import { AdminPanel } from '../workspace/AdminPanel'
import { Zap, BarChart3, Shield, LogOut } from 'lucide-react'

type WorkspaceTab = 'transform' | 'activity' | 'admin'

const TABS: { id: WorkspaceTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: 'transform', label: 'Transform', icon: <Zap className="h-3.5 w-3.5" /> },
  { id: 'activity', label: 'Activity', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: 'admin', label: 'Admin', icon: <Shield className="h-3.5 w-3.5" />, adminOnly: true },
]

export default function WorkspacePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('transform')

  const visibleTabs = TABS.filter((t) => !t.adminOnly || user?.isAdmin)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">

      {/* ── Workspace pill header ─────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3">
        <div
          className="mx-auto flex max-w-[1440px] items-center gap-3 rounded-full bg-white px-4 py-2.5"
          style={{
            boxShadow:
              '0 0 0 1px rgba(231,228,217,0.9), 0 0 0 2.5px #0f100f, 0 0 0 4px rgba(231,228,217,0.7), 0 4px 20px -6px rgba(15,16,15,0.12)',
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2 mr-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-matcha"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2" />
              </svg>
            </span>
            <span className="hidden font-display text-[15px] text-ink sm:block">Sankshep</span>
          </Link>

          {/* Divider */}
          <span className="h-5 w-px bg-hair shrink-0" />

          {/* Tabs — pill-within-pill */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-0.5 rounded-full bg-paper-deep/70 p-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-ink text-paper shadow-sm'
                      : 'text-ink-soft hover:bg-white/80 hover:text-ink'
                  } ${tab.adminOnly ? 'pl-3' : ''}`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.adminOnly && (
                    <span className="ml-0.5 rounded-full bg-matcha/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink leading-none">
                      Admin
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <span className="h-5 w-px bg-hair shrink-0" />

          {/* User info + logout */}
          <div className="flex shrink-0 items-center gap-2">
            {user && (
              <>
                {/* Avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="hidden max-w-[130px] truncate text-[12.5px] text-ink-soft sm:block">
                  {user.email}
                </span>
                {user.isAdmin && (
                  <span className="hidden rounded-full bg-matcha px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-ink sm:block">
                    Admin
                  </span>
                )}
              </>
            )}
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex items-center gap-1.5 rounded-full border border-hair bg-paper-deep/60 px-3 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:bg-white hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'transform' && <TransformView />}
        {activeTab === 'activity' && (
          <div className="h-full overflow-y-auto">
            <ActivityView />
          </div>
        )}
        {activeTab === 'admin' && user?.isAdmin && (
          <div className="h-full overflow-y-auto">
            <AdminPanel />
          </div>
        )}
      </div>

    </div>
  )
}
