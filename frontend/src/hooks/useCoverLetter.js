import { useState, useRef } from 'react'
import { generateCoverLetter } from '../services/api'

export function useCoverLetter() {
  const [text, setText] = useState('')          // streamed + editable text
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  function generate(file, jobDescription) {
    setText('')
    setDone(false)
    setError(null)
    setStreaming(true)

    controllerRef.current = generateCoverLetter(
      file,
      jobDescription,
      (chunk) => setText((prev) => prev + chunk),   // append each token
      () => { setStreaming(false); setDone(true) },  // stream finished
      (err) => { setStreaming(false); setError(err) } // error
    )
  }

  function cancel() {
    controllerRef.current?.abort()
    setStreaming(false)
  }

  function reset() {
    cancel()
    setText('')
    setDone(false)
    setError(null)
  }

  // Allow user to directly edit the generated text
  function updateText(newText) {
    setText(newText)
  }

  return { text, streaming, done, error, generate, cancel, reset, updateText }
}
