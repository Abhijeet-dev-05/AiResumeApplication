import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
export function useAuth() { return useContext(AuthContext) }

const BASE_URL = import.meta.env.VITE_API_URL || '/'

const api = axios.create({ baseURL: BASE_URL })

// ── Attach access token to every request ──────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auto-refresh on 401 ───────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('no refresh token')
        const { data } = await axios.post(`${BASE_URL}auth/refresh`, { refresh_token: refresh })
        localStorage.setItem('access_token',  data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.reload()
      }
    }
    return Promise.reject(err)
  }
)

export { api }

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)   // initial auth check

  // ── Restore session on mount ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Register ───────────────────────────────────────────
  const register = useCallback(async (full_name, email, password, confirm_password) => {
    const { data } = await api.post('/auth/register', {
      full_name, email, password, confirm_password,
    })
    return data
  }, [])

  // ── Login ──────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token',  data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }, [])

  // ── Logout ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
