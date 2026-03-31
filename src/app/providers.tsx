'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/shared/lib/query-client'
import { useThemeSync } from '@/shared/hooks/use-theme-sync'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  useThemeSync()

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
