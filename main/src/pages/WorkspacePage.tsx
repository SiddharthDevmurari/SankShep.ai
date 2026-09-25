import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TransformView } from '../workspace/TransformView'
import { HistoryView } from '../workspace/HistoryView'
import { AnalyticsView } from '../workspace/AnalyticsView'
import { AdminPanel } from '../workspace/AdminPanel'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import { BrandCapsule, BrandMark, CAPSULE_SHADOW } from '../components/site/SiteChrome'
import { Shuffle, History, ChartNoAxesColumn, Shield, LogOut, ChevronDown, Trash2 } from 'lucide-react'

type WorkspaceTab = 'transform' | 'history' | 'analytics' | 'admin'

const TABS: { id: WorkspaceTab; label: string; icon: typeof Shuffle; adminOnly?: boolean }[] = [
  { id: 'transform', label: 'Transform', icon: Shuffle },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesColumn },
  { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
]

/** Transform lives at /workspace; every other tab at /workspace/<id>. */
const tabPath = (id: WorkspaceTab) => (id === 'transform' ? '/workspace' : `/workspace/${id}`)

export default function WorkspacePage() {
  const { user, signOut, deleteAccount } = useAuth()
  const navigate = useNavigate()
  // Route is /workspace/*: the first segment names the tab; anything deeper is not a real page.
  const segments = (useParams()['*'] ?? '').split('/').filter(Boolean)
  const activeTab = (segments[0] ?? 'transform') as WorkspaceTab
  const setActiveTab = (id: WorkspaceTab) => navigate(tabPath(id))
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the account menu on any click outside it, or on Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const canDelete = !!user && !user.isDemo && !user.isAdmin

  const handleDeleteAccount = async () => {
    const result = await deleteAccount()
    if (!result.error) navigate('/', { replace: true })
    return result
  }

  const visibleTabs = TABS.filter((t) => !t.adminOnly || user?.isAdmin)
  // Unknown tabs (including the retired /workspace/activity) and admin for non-admins fall back to Transform.
  const tabAllowed = segments.length <= 1 && visibleTabs.some((t) => t.id === activeTab)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  if (!tabAllowed) return <Navigate to="/workspace" replace />

  return (
    <div className="sk-canvas flex h-dvh flex-col overflow-hidden">

      {/* ── Header: app chrome on the same stone as the canvas, so bar, toolbar and windows read as one surface ── */}
      <header className="relative z-30 shrink-0 border-b border-ink/10 bg-canvas/85 backdrop-blur-xl">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <BrandCapsule className="hidden sm:inline-flex" />
            {/* Phones: mark only, so the tab control keeps its room */}
            <Link to="/" className="shrink-0 rounded-full sm:hidden" aria-label="Sankshep home" style={{ boxShadow: CAPSULE_SHADOW }}>
              <BrandMark className="h-9 w-9 rounded-full" />
            </Link>
          </div>

          {/* Tabs: segmented control */}
          <nav aria-label="Workspace sections">
            <div role="tablist" className="flex items-center gap-1 rounded-full bg-ink/[0.05] p-1 ring-1 ring-ink/10">
              {visibleTabs.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(id)}
                    className={`relative flex h-9 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 sm:px-4 ${
                      active
                        ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(231,228,217,0.9),0_2px_8px_-3px_rgba(15,16,15,0.18)]'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Icon className={`h-[15px] w-[15px] ${active ? 'text-ink' : 'text-ink-mute'}`} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Account */}
          <div className="flex items-center justify-end gap-1.5">
            {user && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink font-mono text-[12px] font-semibold text-matcha">
                    {user.email[0].toUpperCase()}
                  </span>
                  <span className="hidden min-w-0 text-left lg:block">
                    <span className="block max-w-[180px] truncate text-[13px] font-medium leading-tight text-ink">{user.email}</span>
                    <span className="block text-[11.5px] leading-tight text-ink-mute">
                      {user.isAdmin ? 'admin' : user.isDemo ? 'demo' : 'member'}
                    </span>
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-ink-mute transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="sk-float sk-pop absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl bg-white"
                  >
                    <div className="border-b border-hair px-4 py-3.5">
                      <p className="text-[11.5px] text-ink-mute">Signed in as</p>
                      <p className="mt-1 truncate text-[13.5px] font-medium text-ink">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        role="menuitem"
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                      <button
                        role="menuitem"
                        type="button"
                        disabled={!canDelete}
                        onClick={() => { setMenuOpen(false); setConfirmingDelete(true) }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors enabled:hover:bg-red-50 disabled:cursor-not-allowed disabled:text-ink-mute"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete account
                      </button>
                      {!canDelete && (
                        <p className="px-3 pb-2 text-[11.5px] leading-snug text-ink-mute">
                          {user.isDemo ? 'The shared demo account can’t be deleted.' : 'The admin account can’t be deleted.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 sm:flex"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {confirmingDelete && user && (
        <ConfirmDeleteDialog
          title="Delete your account?"
          description={
            <>This permanently deletes <span className="font-medium text-ink">{user.email}</span> and your entire activity history. This can’t be undone.</>
          }
          confirmText={user.email}
          confirmLabel="Delete my account"
          onConfirm={handleDeleteAccount}
          onClose={() => setConfirmingDelete(false)}
        />
      )}

      {/* ── Tab content ──────────────────────────────────────────────── */}
      {/* Transform stays mounted so generated drafts survive tab switches. */}
      <main className="min-h-0 flex-1 overflow-hidden">
        <div className={activeTab === 'transform' ? 'h-full' : 'hidden'}>
          <TransformView onOpenHistory={() => setActiveTab('history')} />
        </div>
        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto">
            <HistoryView />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="h-full overflow-y-auto">
            <AnalyticsView onOpenHistory={() => setActiveTab('history')} />
          </div>
        )}
        {activeTab === 'admin' && user?.isAdmin && (
          <div className="h-full overflow-y-auto">
            <AdminPanel />
          </div>
        )}
      </main>
    </div>
  )
}
