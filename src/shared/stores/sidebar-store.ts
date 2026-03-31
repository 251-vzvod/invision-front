'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStoreState {
  isOpen: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useSidebarStore = create<SidebarStoreState>()(
  persist(
    (set) => ({
      isOpen: true,
      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'sidebar-state',
    },
  ),
)
