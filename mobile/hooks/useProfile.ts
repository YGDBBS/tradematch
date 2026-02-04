import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { Profile, ProfileUpdate } from "@/lib/types"

export const profileQueryKey = ["profile"] as const

export function useProfile(accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => api.get<Profile>(endpoints.profile.me, accessToken!),
    enabled: !!accessToken,
  })

  const mutation = useMutation({
    mutationFn: (body: ProfileUpdate) =>
      api.patch<Profile>(endpoints.profile.me, body, accessToken!),
    onSuccess: (data) => {
      queryClient.setQueryData(profileQueryKey, data)
    },
  })

  return {
    profile: accessToken ? (query.data ?? null) : null,
    loading: query.isLoading,
    error: (query.error ?? mutation.error) as Error | null,
    refetch: query.refetch,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
