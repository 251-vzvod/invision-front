import type { Metadata } from 'next'
import { HomeLanding } from '@/features/home'

export const metadata: Metadata = {
  title: 'InVision — Admission Intelligence',
  description: 'Landing page for applicants and admissions managers',
}

export default function DashboardPage() {
  return <HomeLanding />
}
