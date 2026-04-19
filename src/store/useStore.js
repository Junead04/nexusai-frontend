import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Chat store (NOT persisted — clears on page refresh / account switch) ──
const chatInitial = { messages: [], totalTokens: 0, totalCost: 0, queryCount: 0 }

export const useChatStore = create(set => ({
  ...chatInitial,
  addMessage:   (msg)          => set(s => ({ messages: [...s.messages, msg] })),
  updateStats:  (tokens, cost) => set(s => ({
    totalTokens: s.totalTokens + (tokens||0),
    totalCost:   s.totalCost   + (cost||0),
    queryCount:  s.queryCount  + 1,
  })),
  clearAll: () => set({ ...chatInitial }),
}))

export const useAuditStore = create(set => ({
  logs: [],
  addLog:   (entry) => set(s => ({ logs: [entry, ...s.logs].slice(0, 200) })),
  clearAll: ()      => set({ logs: [] }),
}))

// ── Auth store ──────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, token: null, isAuthenticated: false, _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (user, token) => {
        // ★ Clear previous user's chat/audit before storing new user
        useChatStore.getState().clearAll()
        useAuditStore.getState().clearAll()
        localStorage.setItem('nexus_token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        // ★ Clear chat/audit on logout too
        useChatStore.getState().clearAll()
        useAuditStore.getState().clearAll()
        localStorage.removeItem('nexus_token')
        localStorage.removeItem('nexus-auth')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'nexus-auth',
      partialize: s => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => { if (state) state.setHasHydrated(true) },
    }
  )
)

export const useLangStore = create(
  persist(
    (set) => ({ lang: 'en', setLang: (lang) => set({ lang }) }),
    { name: 'nexus-lang' }
  )
)
