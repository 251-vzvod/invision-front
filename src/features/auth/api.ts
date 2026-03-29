import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/lib/api-client'
import type { AuthResponse, LoginPayload } from './types'

const authQueryKeys = {
  session: ['auth', 'session'] as const,
}

const login = (payload: LoginPayload): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/login', payload)

const logout = (): Promise<AuthResponse> => apiClient.post<AuthResponse>('/api/auth/logout')

const getSession = (): Promise<AuthResponse> => apiClient.get<AuthResponse>('/api/auth/session')

export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      queryClient.setQueryData(authQueryKeys.session, result)
    },
  })
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: (result) => {
      queryClient.setQueryData(authQueryKeys.session, result)
    },
  })
}

export const useAuthSessionQuery = () =>
  useQuery({
    queryKey: authQueryKeys.session,
    queryFn: getSession,
    staleTime: 30_000,
    retry: false,
  })
