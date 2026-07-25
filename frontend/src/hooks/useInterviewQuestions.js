import { useState } from 'react'
import { generateInterviewQuestions } from '../services/api'

export function useInterviewQuestions() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function generate(file) {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await generateInterviewQuestions(file)
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

  return { data, loading, error, generate, reset }
}
