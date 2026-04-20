import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('nexus_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexus_token')
      localStorage.removeItem('nexus_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  me: () => api.get('/api/auth/me'),
  demoUsers: () => api.get('/api/auth/demo-users'),
}

export const chatAPI = {
  ask: (query) => api.post('/api/chat/ask', { query }),
}

export const docsAPI = {
  upload: (formData) => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: () => api.get('/api/documents/list'),
  delete: (docId) => api.delete(`/api/documents/${docId}`),
}

export default api

// ── Wake up Render before sending requests ──────────────────────
// Render free tier sleeps after 15min inactivity. This pings it first.
export async function wakeUpBackend() {
  try {
    await api.get('/ping', { timeout: 45000 })
    return true
  } catch {
    return false  // Will try the actual request anyway
  }
}
