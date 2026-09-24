import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Clock, RefreshCw, TrendingUp, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserActivity, fetchUserStatsRows } from '../lib/activity'
import { ActivityFeed, ErrorNotice, SchemaNotice, StatTile, formatDuration } from './ActivityFeed'
import { usePagedActivity } from './usePagedActivity'

type StatsRow = Awaited<ReturnType<typeof fetchUserStatsRows>>[number]

function computeStats(rows: StatsRow[]) {
  const today = new Date().toDateString()
  const generations = rows.filter((r) => r.action === 'generate')
  const todayCount = generations.filter((r) => new Date(r.created_at).toDateString() === today).length
  const formatCount = rows.reduce((n, r) => n + (r.success_count ?? 0), 0)
  const timed = generations.filter((r) => r.duration_ms != null)
  const avgMs = timed.length ? Math.round(timed.reduce((n, r) => n + (r.duration_ms ?? 0), 0) / timed.length) : null
  const succeeded = rows.filter((r) => r.status === 'success').length
  const successRate = rows.length ? Math.round((succeeded / rows.length) * 100) : null
  return { total: generations.length, todayCount, formatCount, avgMs, successRate, refinements: rows.length - generations.length }
}

export function ActivityView() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const fetchPage = useCallback((page: number) => fetchUserActivity(userId, page), [userId])
  const feed = usePagedActivity(fetchPage)

  const [stats, setStats] = useState<ReturnType<typeof computeStats> | null>(null)
  const loadStats = useCallback(() => {
    fetchUserStatsRows(userId).then((rows) => setStats(computeStats(rows))).catch(() => setStats(null))
  }, [userId])
  useEffect(loadStats, [loadStats])

  const refresh = () => { feed.refresh(); loadStats() }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[28px] text-ink">Your Activity</h2>
          <p className="mt-2 text-[14px] text-ink-soft">
            Every transformation you've run — inputs, formats, timings and the generated content.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-hair bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${feed.loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Generations" value={stats ? String(stats.total) : '–'} sub={stats ? `${stats.todayCount} today` : undefined} icon={Zap} color="bg-matcha/20 text-matcha-deep" />
        <StatTile label="Formats generated" value={stats ? String(stats.formatCount) : '–'} sub={stats ? `${stats.refinements} refinements` : undefined} icon={BarChart3} color="bg-blue-50 text-blue-600" />
        <StatTile label="Avg. generation time" value={stats ? formatDuration(stats.avgMs) : '–'} icon={Clock} color="bg-orange-50 text-orange-600" />
        <StatTile label="Success rate" value={stats?.successRate != null ? `${stats.successRate}%` : '–'} icon={TrendingUp} color="bg-green-50 text-green-600" />
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-[15px] font-semibold text-ink">History</h3>
        {feed.schemaMissing ? (
          <SchemaNotice />
        ) : feed.error ? (
          <ErrorNotice message={`Couldn't load your activity: ${feed.error}`} onRetry={feed.refresh} />
        ) : (
          <ActivityFeed
            logs={feed.logs}
            loading={feed.loading}
            hasMore={feed.hasMore}
            onLoadMore={feed.loadMore}
            emptyText="No activity yet. Run a transformation in the Transform tab and it will show up here."
          />
        )}
      </div>
    </div>
  )
}
