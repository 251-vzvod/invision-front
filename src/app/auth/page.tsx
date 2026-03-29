import type { Metadata } from 'next'
import { AuthForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Manager Auth — InVision',
  description: 'Manager authentication page',
}

export default function AuthPage() {
  return <AuthForm />
}
