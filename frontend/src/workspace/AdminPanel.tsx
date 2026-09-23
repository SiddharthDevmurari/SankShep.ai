import { useAuth } from '../contexts/AuthContext'
import { Shield, Users, Settings, Database, AlertTriangle } from 'lucide-react'

const ADMIN_SECTIONS = [
  {
    icon: Users,
    title: 'User Management',
    desc: 'View registered users, manage roles, and revoke access.',
    badge: 'Coming soon',
  },
  {
    icon: Database,
    title: 'System Usage',
    desc: 'Monitor API token consumption, Groq quota, and pipeline metrics.',
    badge: 'Coming soon',
  },
  {
    icon: Settings,
    title: 'Configuration',
    desc: 'Update Groq API keys, Supabase settings, and pipeline defaults.',
    badge: 'Coming soon',
  },
  {
    icon: AlertTriangle,
    title: 'Error Logs',
    desc: 'Review failed generation attempts and pipeline errors.',
    badge: 'Coming soon',
  },
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
        <p className="text-[13px] text-ink-soft max-w-xs">
          This panel is restricted to administrators only.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-paper">
          <Shield className="h-5.5 w-5.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[28px] text-ink">Admin Panel</h2>
            <span className="rounded-full bg-matcha px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
              Admin
            </span>
          </div>
          <p className="mt-1 text-[14px] text-ink-soft">
            Logged in as <span className="font-medium text-ink">{user.email}</span>
          </p>
        </div>
      </div>

      {/* System info */}
      <div className="mb-6 rounded-2xl border border-hair bg-paper-deep/40 px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft/70 mb-3">System Status</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4">
          {[
            ['Environment', import.meta.env.MODE],
            ['Auth Mode', import.meta.env.VITE_SUPABASE_URL ? 'Supabase' : 'Mock'],
            ['AI Provider', 'Groq (LLaMA 3.3-70B)'],
            ['Pipeline', 'Parallel (LangGraph-style)'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[11px] text-ink-soft/60">{k}</p>
              <p className="text-[13px] font-medium text-ink">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {ADMIN_SECTIONS.map(({ icon: Icon, title, desc, badge }) => (
          <div
            key={title}
            className="relative rounded-2xl border border-hair bg-white p-6 transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(15,16,15,0.2)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-paper">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink">{title}</h3>
                  <span className="rounded-full border border-hair bg-paper-deep px-2 py-0.5 text-[10px] font-medium text-ink-soft">{badge}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <p className="text-[13px] font-semibold text-red-700">Danger Zone</p>
        </div>
        <p className="text-[12.5px] text-red-600/80 mb-4">
          These actions are irreversible. Proceed with caution.
        </p>
        <div className="flex flex-wrap gap-3">
          <button disabled className="rounded-xl border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 opacity-50 cursor-not-allowed">
            Clear all session data
          </button>
          <button disabled className="rounded-xl border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 opacity-50 cursor-not-allowed">
            Reset API quotas
          </button>
        </div>
      </div>
    </div>
  )
}
