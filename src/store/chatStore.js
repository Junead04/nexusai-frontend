import { create } from 'zustand'
import { chatAPI } from '../utils/api'

export const useChatStore = create((set, get) => ({
  messages: [],
  loading: false,
  totalTokens: 0,
  totalCost: 0,
  queryCount: 0,

  sendMessage: async (query) => {
    const userMsg = { id: Date.now(), role: 'user', content: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    set(s => ({ messages: [...s.messages, userMsg], loading: true }))
    try {
      const { data } = await chatAPI.ask(query)
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        tokens: data.tokens,
        cost: data.cost,
        latency: data.latency,
        blocked: data.blocked,
        modelUsed: data.model_used,
        isComplex: data.is_complex,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      set(s => ({
        messages: [...s.messages, aiMsg],
        loading: false,
        totalTokens: s.totalTokens + data.tokens,
        totalCost: s.totalCost + data.cost,
        queryCount: s.queryCount + 1,
      }))
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1, role: 'assistant',
        content: err.response?.data?.detail || 'Something went wrong. Please try again.',
        sources: [], tokens: 0, cost: 0, latency: 0, blocked: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      set(s => ({ messages: [...s.messages, errMsg], loading: false }))
    }
  },

  clearMessages: () => set({ messages: [] }),
}))
