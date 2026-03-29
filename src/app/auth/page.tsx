import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Manager Auth — InVision',
  description: 'Manager authentication page',
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  )
}
