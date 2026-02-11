import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { RequestMatchWithRequest, RequestMatchStatus } from "@/lib/types"

export const leadsQueryKey = ["leads"] as const

interface LeadUpdateInput {
  status: RequestMatchStatus
}

export function useLeads(accessToken: string | undefined) {
  const query = useQuery({
    queryKey: leadsQueryKey,
    queryFn: () => api.get<RequestMatchWithRequest[]>(endpoints.leads.list, accessToken!),
    enabled: !!accessToken,
  })

  return {
    leads: query.data ?? null,
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

export function useLead(id: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["lead", id],
    queryFn: () => api.get<RequestMatchWithRequest>(endpoints.leads.get(id!), accessToken!),
    enabled: !!id && !!accessToken,
  })

  const respondToLead = useMutation({
    mutationFn: (input: LeadUpdateInput) =>
      api.patch<RequestMatchWithRequest>(endpoints.leads.get(id!), input, accessToken!),
    onSuccess: (data) => {
      queryClient.setQueryData(["lead", data.id], data)
      queryClient.invalidateQueries({ queryKey: leadsQueryKey })
    },
  })

  return {
    lead: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ?? respondToLead.error) as Error | null,
    refetch: query.refetch,
    respondToLead: respondToLead.mutateAsync,
    isResponding: respondToLead.isPending,
  }
}
