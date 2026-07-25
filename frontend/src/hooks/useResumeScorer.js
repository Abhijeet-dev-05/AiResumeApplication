import { useState } from 'react'
import { scoreResume } from '../services/api'

export function useResumeScorer() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function score(file, jobDescription) {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await scoreResume(file, jobDescription)
      setData(result)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setData(null)
    setError(null)
    setLoading(false)
  }

  return { data, loading, error, score, reset }
}
