import { useState } from 'react'
import { analyzeResume } from '../services/api'

export function useResumeChecker() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function analyze(file) {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const result = await analyzeResume(file)
      setData(result)
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setData(null)
    setError(null)
    setLoading(false)
  }

  return { data, loading, error, analyze, reset }
}
