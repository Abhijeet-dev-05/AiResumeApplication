import { useState, useEffect } from 'react'
import { buildProfile, getMyProfile } from '../services/api'

export function useProfileBuilder() {
  const [profile,   setProfile]   = useState(null)   // existing profile metadata
  const [result,    setResult]    = useState(null)   // freshly generated result
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(true)   // initial load
  const [error,     setError]     = useState(null)

  // Load existing profile on mount
  useEffect(() => {
    getMyProfile()
      .then(({ profile }) => setProfile(profile))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  async function generate(file) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await buildProfile(file)
      setResult(data)
      setProfile(data) // update metadata immediately
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Profile generation failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return { profile, result, loading, fetching, error, generate, reset }
}
