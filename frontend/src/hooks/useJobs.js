import { useState, useCallback } from 'react'
import { fetchJobs } from '../services/api'

export function useJobs() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJobs(filters)
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setJobs([])
    setError(null)
  }, [])

  return { jobs, loading, error, load, reset }
}
