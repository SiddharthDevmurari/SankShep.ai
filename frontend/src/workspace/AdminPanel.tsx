import { useCallback, useEffect, useState } from 'react'
import { Activity, RefreshCw, Shield, Trash2, Users, X, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import {
  adminDeleteUser, fetchAllUsers, fetchGlobalActivity, SchemaMissingError,
  type ActivityAction, type AdminUserRow,
} from '../lib/activity'
import { SUPABASE_URL } from '../lib/supabase'
import { ActivityFeed, ErrorNotice, SchemaNotice, StatTile, formatDateTime } from './ActivityFeed'
import { usePagedActivity } from './usePagedActivity'

const ACTION_FILTERS: { value: ActivityAction | ''; label: string }[] = [
  { value: '', label: 'All actions' },
  { value: 'generate', label: 'Generations' },
  { value: 'regenerate', label: 'Refinements' },
  { value: 'login', label: 'Sign-ins' },
  { value: 'logout', label: 'Sign-outs' },
  { value: 'signup', label: 'Sign-ups' },
]

export function AdminPanel() {
  const { user } = useAuth()

  if (!user?.isAdmin) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <p className="font-semibold text-ink">Access Denied</p>
        <p className="max-w-xs text-[13px] text-ink-soft">This panel is restricted to administrators only.</p>
      </div>
    )
  }

  return <AdminDashboard email={user.email} />
}

function AdminDashboard({ email }: { email: string }) {
  /* Users */
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [schemaMissing, setSchemaMissing] = useState(false)

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      setUsers(await fetchAllUsers())
      setSchemaMissing(false)
    } catch (err) {
      if (err instanceof SchemaMissingError) setSchemaMissing(true)
      else setUsersError(err instanceof Error ? err.message : String(err))
    } finally {
      setUsersLoading(false)
    }
  }, [])
  useEffect(() => { void loadUsers() }, [loadUsers])

  /* Global feed */
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState<ActivityAction | ''>('')
  const fetchPage = useCallback(
    (page: number) => fetchGlobalActivity(page, { userId: userFilter || undefined, action: actionFilter || undefined }),
    [userFilter, actionFilter],
  )
  const feed = usePagedActivity(fetchPage)

  const refresh = () => { void loadUsers(); feed.refresh() }

  /* Delete */
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null)
  const handleDelete = async () => {
    if (!deleting) return { error: null }
    try {
      await adminDeleteUser(deleting.id)
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
    if (userFilter === deleting.id) setUserFilter('')
    setDeleting(null)
    refresh()
    return { error: null }
  }

  const totalGenerations = users.reduce((n, u) => n + Number(u.generation_count), 0)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const activeThisWeek = users.filter((u) => u.last_activity_at && new Date(u.last_activity_at).getTime() > weekAgo).length
  const filteredUser = users.find((u) => u.id === userFilter)

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-paper">
            <Shield className="h-5.5 w-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[28px] text-ink">Admin Panel</h2>
              <span className="rounded-full bg-matcha px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">Admin</span>
            </div>
            <p className="mt-1 text-[14px] text-ink-soft">
              Signed in as <span className="font-medium text-ink">{email}</span> · {new URL(SUPABASE_URL).hostname}
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-hair bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${usersLoading || feed.loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {schemaMissing || feed.schemaMissing ? (
        <SchemaNotice />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatTile label="Registered users" value={usersLoading ? '–' : String(users.length)} icon={Users} color="bg-blue-50 text-blue-600" />
            <StatTile label="Total generations" value={usersLoading ? '–' : String(totalGenerations)} icon={Zap} color="bg-matcha/20 text-matcha-deep" />
            <StatTile label="Active in last 7 days" value={usersLoading ? '–' : String(activeThisWeek)} icon={Activity} color="bg-green-50 text-green-600" />
          </div>

          {deleting && (
            <ConfirmDeleteDialog
              title="Delete this account?"
              description={
                <>This permanently deletes <span className="font-medium text-ink">{deleting.email}</span>, their sign-in, and all {deleting.generation_count} of their generations. This can’t be undone.</>
              }
              confirmText={deleting.email}
              confirmLabel="Delete account"
              onConfirm={handleDelete}
              onClose={() => setDeleting(null)}
            />
          )}

          {/* Users table */}
          <section className="mt-8">
            <h3 className="mb-4 text-[15px] font-semibold text-ink">All users</h3>
            {usersError ? (
              <ErrorNotice message={`Couldn't load users: ${usersError}`} onRetry={loadUsers} />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-hair bg-white">
                <table className="w-full min-w-[640px] text-left text-[13px]">
                  <thead className="border-b border-hair bg-paper-deep/50 text-[11.5px] uppercase tracking-wide text-ink-soft/70">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Email</th>
                      <th className="px-4 py-2.5 font-semibold">Role</th>
                      <th className="px-4 py-2.5 font-semibold">Joined</th>
                      <th className="px-4 py-2.5 font-semibold">Last sign-in</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Generations</th>
                      <th className="px-4 py-2.5 font-semibold">Last active</th>
                      <th className="px-4 py-2.5"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hair">
                    {usersLoading && users.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-soft">Loading users…</td></tr>
                    )}
                    {!usersLoading && users.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-soft">No registered users yet.</td></tr>
                    )}
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => setUserFilter(u.id === userFilter ? '' : u.id)}
                        title="Show this user's activity"
                        className={`cursor-pointer transition-colors hover:bg-paper/70 ${u.id === userFilter ? 'bg-matcha/15' : ''}`}
                      >
                        <td className="px-4 py-3 font-medium text-ink">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${u.role === 'admin' ? 'bg-matcha text-ink' : 'bg-paper-deep text-ink-soft'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink-soft">{formatDateTime(u.created_at)}</td>
                        <td className="px-4 py-3 text-ink-soft">{u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : 'Never'}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink">{u.generation_count}</td>
                        <td className="px-4 py-3 text-ink-soft">{u.last_activity_at ? formatDateTime(u.last_activity_at) : '–'}</td>
                        <td className="px-4 py-3 text-right">
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              title={`Delete ${u.email}`}
                              aria-label={`Delete ${u.email}`}
                              onClick={(e) => { e.stopPropagation(); setDeleting(u) }}
                              className="rounded-lg p-1.5 text-ink-soft/50 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Global activity feed */}
          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-ink">Global activity</h3>
              <div className="flex flex-wrap items-center gap-2">
                {filteredUser && (
                  <button
                    onClick={() => setUserFilter('')}
                    className="flex items-center gap-1 rounded-full bg-matcha/40 px-3 py-1.5 text-[12px] font-medium text-ink"
                  >
                    {filteredUser.email}
                    <X className="h-3 w-3" />
                  </button>
                )}
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="rounded-full border border-hair bg-white px-3 py-1.5 text-[12.5px] text-ink-soft outline-none"
                >
                  <option value="">All users</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
                </select>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as ActivityAction | '')}
                  className="rounded-full border border-hair bg-white px-3 py-1.5 text-[12.5px] text-ink-soft outline-none"
                >
                  {ACTION_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>

            {feed.error ? (
              <ErrorNotice message={`Couldn't load activity: ${feed.error}`} onRetry={feed.refresh} />
            ) : (
              <ActivityFeed
                logs={feed.logs}
                loading={feed.loading}
                hasMore={feed.hasMore}
                onLoadMore={feed.loadMore}
                showUser
                emptyText="No activity matches these filters."
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}
