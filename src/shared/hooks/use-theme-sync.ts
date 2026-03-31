'use client'

import { useEffect } from 'react'
import { useThemeStore } from '../stores/theme-store'

export function useThemeSync() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])
}
