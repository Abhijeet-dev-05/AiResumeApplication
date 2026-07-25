// All requests go through the authenticated axios instance from AuthContext.
// The interceptor in AuthContext auto-attaches Bearer token + handles refresh.
import { api } from '../context/AuthContext'

// ── Resume Checker ─────────────────────────────────────────
export async function analyzeResume(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return response.data
}

// ── Resume Scorer ──────────────────────────────────────────
export async function scoreResume(file, jobDescription) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('job_description', jobDescription)
  const response = await api.post('/score-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return response.data
}

// ── Interview Questions ────────────────────────────────────
export async function generateInterviewQuestions(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/interview-questions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return response.data
}

// ── Profile Builder ────────────────────────────────────────
export async function buildProfile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/build-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000, // 3 min — large HTML generation
  })
  return response.data
}

export async function getMyProfile() {
  const response = await api.get('/my-profile')
  return response.data
}

// ── Cover Letter (streaming) ───────────────────────────────
export function generateCoverLetter(file, jobDescription, onChunk, onDone, onError) {
  const controller = new AbortController()
  const formData   = new FormData()
  formData.append('file', file)
  formData.append('job_description', jobDescription)

  const token = localStorage.getItem('access_token')

  fetch('/cover-letter', {
    method:  'POST',
    body:    formData,
    signal:  controller.signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(err.detail || 'Request failed')
      }
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      async function read() {
        const { done, value } = await reader.read()
        if (done) { onDone(); return }
        onChunk(decoder.decode(value, { stream: true }))
        await read()
      }
      await read()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError(err.message || 'Something went wrong')
    })

  return controller
}

// ── Career Coach ───────────────────────────────────────────
export async function initCareerCoach(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/career-coach/init', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return response.data
}

export function streamCareerCoachChat(context, history, message, onChunk, onDone, onError) {
  const controller = new AbortController()
  const token = localStorage.getItem('access_token')

  fetch('/career-coach/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ context, history, message }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(err.detail || 'Request failed')
      }
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      async function read() {
        const { done, value } = await reader.read()
        if (done) { onDone(); return }
        onChunk(decoder.decode(value, { stream: true }))
        await read()
      }
      await read()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError(err.message || 'Something went wrong')
    })

  return controller
}
