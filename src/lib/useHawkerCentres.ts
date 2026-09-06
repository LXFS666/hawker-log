import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { HawkerCentre } from '../types'

export function useHawkerCentres() {
  const [centres, setCentres] = useState<HawkerCentre[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCentres() {
      try {
        const { data, error } = await supabase
          .from('hawker_centres')
          .select('id, name, address, lat, lng')
          .order('name')
        if (error) {
          setError(error.message)
          return
        }
        setCentres(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }
    loadCentres()
  }, [])

  return { centres, error }
}
