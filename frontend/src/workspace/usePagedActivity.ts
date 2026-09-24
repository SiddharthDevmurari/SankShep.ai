import { useCallback, useEffect, useRef, useState } from 'react'
import { PAGE_SIZE, SchemaMissingError, type ActivityLog } from '../lib/activity'

/**
 * Loads activity newest-first, one page at a time. `fetchPage` must be stable
 * per query (wrap in useCallback); a new function resets the list.
 */
export function usePagedActivity(fetchPage: (page: number) => Promise<ActivityLog[]>) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [schemaMissing, setSchemaMissing] = useState(false)
  const requestId = useRef(0)

  const load = useCallback(async (pageToLoad: number) => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchPage(pageToLoad)
      if (id !== requestId.current) return // a newer query superseded this one
      setLogs((prev) => (pageToLoad === 0 ? rows : [...prev, ...rows]))
      setHasMore(rows.length === PAGE_SIZE)
      setPage(pageToLoad)
      setSchemaMissing(false)
    } catch (err) {
      if (id !== requestId.current) return
      if (err instanceof SchemaMissingError) setSchemaMissing(true)
      else setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [fetchPage])

  useEffect(() => { void load(0) }, [load])

  return {
    logs,
    loading,
    hasMore,
    error,
    schemaMissing,
    loadMore: () => load(page + 1),
    refresh: () => load(0),
  }
}
