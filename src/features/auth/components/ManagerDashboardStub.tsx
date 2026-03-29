'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/shared/stores/auth-store'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useAuthSessionQuery, useLogoutMutation } from '../api'

export function ManagerDashboardStub() {
  const router = useRouter()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const resetAuthStore = useAuthStore((state) => state.reset)

  const { data: sessionData } = useAuthSessionQuery()
  const logoutMutation = useLogoutMutation()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    resetAuthStore()
    router.replace('/auth')
  }

  setAuthenticated(Boolean(sessionData?.authenticated))

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Manager dashboard</CardTitle>
          <CardDescription>
            Temporary manager page. Replace this stub with real dashboard widgets later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-zinc-600">
            You are authenticated and have access to manager routes.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
