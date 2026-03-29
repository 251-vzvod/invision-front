'use client'

import { create } from 'zustand'

interface AuthStoreState {
  isAuthenticated: boolean
  setAuthenticated: (isAuthenticated: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  isAuthenticated: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  reset: () => set({ isAuthenticated: false }),
}))
