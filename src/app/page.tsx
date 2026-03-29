import type { Metadata } from 'next'
import { ManagerDashboardStub } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Manager Dashboard — InVision',
  description: 'Manager dashboard placeholder',
}

export default function DashboardPage() {
  return <ManagerDashboardStub />
}
