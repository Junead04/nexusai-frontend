import { create } from 'zustand'
import { authAPI } from '../utils/api'

const stored = localStorage.getItem('nexus_user')

export const useAuthStore = create((set, get) => ({
  user: stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('nexus_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.login(email, password)
      localStorage.setItem('nexus_token', data.access_token)
      localStorage.setItem('nexus_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.access_token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Login failed', loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
    set({ user: null, token: null })
  },

  hasFeature: (feature) => {
    const { user } = get()
    return user?.features?.includes(feature) ?? false
  },
}))
