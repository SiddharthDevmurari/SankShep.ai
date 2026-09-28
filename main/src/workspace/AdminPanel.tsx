import { useCallback, useEffect, useRef, useState } from 'react'
import { Activity, CircleAlert, RefreshCw, Shield, Trash2, UserCheck, UserX, Users, X, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import {
  adminDeleteUser, adminSetUserDisabled, fetchAllUsers, fetchGlobalActivity, SchemaMissingError,
  type ActivityAction, type AdminUserRow,
} from '../lib/activity'
import { useModalFocus } from './useModalFocus'
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

  /* Disable / enable. Disabling asks first (it signs the person out); enabling only restores access, so it acts at once. */
  const [disabling, setDisabling] = useState<AdminUserRow | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const setDisabled = async (target: AdminUserRow, disable: boolean) => {
    setPendingId(target.id)
    setStatusError(null)
    try {
      await adminSetUserDisabled(target.id, disable)
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    } finally {
      setPendingId(null)
    }
    // Show the new status at once; the refresh brings the date the database recorded.
    setUsers((list) => list.map((u) => (u.id === target.id ? { ...u, is_disabled: disable, disabled_at: disable ? new Date().toISOString() : null } : u)))
    void loadUsers()
    return { error: null }
  }
  const enable = async (target: AdminUserRow) => {
    const { error } = await setDisabled(target, false)
    if (error) setStatusError(`Couldn't enable ${target.email}: ${error}`)
  }

  const totalGenerations = users.reduce((n, u) => n + Number(u.generation_count), 0)
  const disabledCount = users.filter((u) => u.is_disabled).length
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

          {disabling && (
            <ConfirmDisableDialog
              user={disabling}
              onConfirm={async () => {
                const result = await setDisabled(disabling, true)
                if (!result.error) setDisabling(null)
                return result
              }}
              onClose={() => setDisabling(null)}
            />
          )}

          {/* Users table */}
          <section className="mt-8">
            <h3 className="mb-4 flex items-baseline gap-2 text-[15px] font-semibold text-ink">
              All users
              {disabledCount > 0 && <span className="text-[13px] font-normal text-ink-soft">· {disabledCount} disabled</span>}
            </h3>
            {statusError && (
              <div role="alert" className="mb-3 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                <p>{statusError}</p>
                <button type="button" onClick={() => setStatusError(null)} aria-label="Dismiss" className="shrink-0 rounded p-0.5 hover:bg-red-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {usersError ? (
              <ErrorNotice message={`Couldn't load users: ${usersError}`} onRetry={loadUsers} />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-hair bg-white">
                <table className="w-full min-w-[760px] text-left text-[13px]">
                  <thead className="border-b border-hair bg-paper-deep/50 text-[11.5px] uppercase tracking-wide text-ink-soft/70">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Email</th>
                      <th className="px-4 py-2.5 font-semibold">Role</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                      <th className="px-4 py-2.5 font-semibold">Joined</th>
                      <th className="px-4 py-2.5 font-semibold">Last sign-in</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Generations</th>
                      <th className="px-4 py-2.5 font-semibold">Last active</th>
                      <th className="px-4 py-2.5"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hair">
                    {usersLoading && users.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-6 text-center text-ink-soft">Loading users…</td></tr>
                    )}
                    {!usersLoading && users.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-6 text-center text-ink-soft">No registered users yet.</td></tr>
                    )}
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => setUserFilter(u.id === userFilter ? '' : u.id)}
                        title="Show this user's activity"
                        className={`cursor-pointer transition-colors hover:bg-paper/70 ${u.id === userFilter ? 'bg-matcha/15' : ''}`}
                      >
                        <td className={`px-4 py-3 font-medium ${u.is_disabled ? 'text-ink-mute' : 'text-ink'}`}>{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${u.role === 'admin' ? 'bg-matcha text-ink' : 'bg-paper-deep text-ink-soft'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_disabled ? (
                            <span className="inline-flex flex-col">
                              <span className="inline-flex items-center gap-1.5 font-medium text-red-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-hidden /> Disabled
                              </span>
                              {u.disabled_at && <span className="text-[11.5px] text-ink-mute">since {formatDateTime(u.disabled_at)}</span>}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-ink-soft">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-soft">{formatDateTime(u.created_at)}</td>
                        <td className="px-4 py-3 text-ink-soft">{u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : 'Never'}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink">{u.generation_count}</td>
                        <td className="px-4 py-3 text-ink-soft">{u.last_activity_at ? formatDateTime(u.last_activity_at) : '–'}</td>
                        <td className="px-4 py-3 text-right">
                          {u.role !== 'admin' && (
                            <span className="inline-flex items-center justify-end gap-1">
                              {u.is_disabled ? (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); void enable(u) }}
                                  disabled={pendingId === u.id}
                                  aria-label={`Enable ${u.email}`}
                                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-hair bg-white px-2.5 text-[12px] font-medium text-ink transition-colors hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 disabled:cursor-wait disabled:opacity-60"
                                >
                                  {pendingId === u.id
                                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/20 border-t-ink" aria-hidden />
                                    : <UserCheck className="h-3.5 w-3.5 text-green-700" aria-hidden />}
                                  Enable
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setDisabling(u) }}
                                  aria-label={`Disable ${u.email}`}
                                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-hair bg-white px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                                >
                                  <UserX className="h-3.5 w-3.5" aria-hidden />
                                  Disable
                                </button>
                              )}
                              <button
                                type="button"
                                title={`Delete ${u.email}`}
                                aria-label={`Delete ${u.email}`}
                                onClick={(e) => { e.stopPropagation(); setDeleting(u) }}
                                className="rounded-lg p-1.5 text-ink-soft/50 transition-colors hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </span>
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

/**
 * Asks before disabling an account: says what happens (signed out, can't sign in, data kept) and that
 * it can be undone. Escape or a click outside cancels; focus starts on Cancel.
 */
function ConfirmDisableDialog({ user, onConfirm, onClose }: {
  user: AdminUserRow
  onConfirm: () => Promise<{ error: string | null }>
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useModalFocus(panelRef, cancelRef, () => { if (!busy) onClose() })

  const confirm = async () => {
    setBusy(true)
    setError(null)
    const result = await onConfirm()
    // On success the caller unmounts this dialog.
    if (result.error) {
      setError(result.error)
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose() }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-disable-title"
        aria-describedby="confirm-disable-body"
        className="sk-pop w-full max-w-[440px] overflow-hidden rounded-2xl border border-hair bg-white shadow-[0_24px_60px_-20px_rgba(15,16,15,0.35)]"
      >
        <div className="px-6 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200" aria-hidden>
              <UserX className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <h2 id="confirm-disable-title" className="text-[16px] font-semibold text-ink">Disable this account?</h2>
          </div>
          <div id="confirm-disable-body" className="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-ink-soft">
            <p>
              <span className="break-all font-medium text-ink">{user.email}</span> will be signed out everywhere and won’t be able to sign
              in. Anyone trying will be told the account is disabled and to contact you.
            </p>
            <p>
              Their {user.generation_count} {Number(user.generation_count) === 1 ? 'generation' : 'generations'} and history are kept.
              You can enable the account again at any time.
            </p>
          </div>
          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-hair bg-paper px-6 py-4 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={busy}
            className="min-h-11 rounded-xl px-4 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={busy}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha disabled:cursor-wait disabled:opacity-70"
          >
            {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden />}
            Disable account
          </button>
        </div>
      </div>
    </div>
  )
}
