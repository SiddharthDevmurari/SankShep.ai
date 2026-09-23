import { BarChart3, Clock, TrendingUp, Zap } from 'lucide-react'

const PLACEHOLDER_STATS = [
  { label: 'Transforms today', value: '–', icon: Zap, color: 'bg-matcha/20 text-matcha-deep' },
  { label: 'Formats generated', value: '–', icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
  { label: 'Avg. generation time', value: '–', icon: Clock, color: 'bg-orange-50 text-orange-600' },
  { label: 'Success rate', value: '–', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
]

export function ActivityView() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-[28px] text-ink">Activity & Insights</h2>
        <p className="mt-2 text-[14px] text-ink-soft">
          Track your content transformation history, usage patterns, and performance metrics.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {PLACEHOLDER_STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-hair bg-white p-5">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="font-display text-[28px] leading-none text-ink">{value}</p>
            <p className="mt-1 text-[12px] text-ink-soft">{label}</p>
          </div>
        ))}
      </div>

      {/* Coming soon notice */}
      <div className="mt-8 rounded-2xl border border-dashed border-hair bg-paper-deep/40 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-ink">Analytics coming soon</h3>
        <p className="mt-2 text-[13.5px] text-ink-soft max-w-sm mx-auto leading-relaxed">
          Detailed transform history, format popularity charts, token usage, and collaboration insights will appear here once your session data accumulates.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {['Transform History', 'Format Usage Chart', 'Token Consumption', 'Export Stats'].map((item) => (
            <span key={item} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[12px] text-ink-soft">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
