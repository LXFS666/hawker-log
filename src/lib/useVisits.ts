import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { VisitWithStall } from '../types'

export function useVisits() {
  const [visits, setVisits] = useState<VisitWithStall[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reloadIndex, setReloadIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadVisits() {
      try {
        const { data, error } = await supabase
          .from('visits')
          .select('id, rating, dish, would_reorder, visited_on, notes, stall:stalls(id, name, centre_id)')
        if (cancelled) return
        if (error) {
          setError(error.message)
          return
        }
        setVisits((data ?? []) as unknown as VisitWithStall[])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }
    }

    loadVisits()
    return () => {
      cancelled = true
    }
  }, [reloadIndex])

  function refetch() {
    setReloadIndex((index) => index + 1)
  }

  return { visits, error, refetch }
}
