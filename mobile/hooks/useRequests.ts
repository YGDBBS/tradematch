import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { Request, RequestStatus } from "@/lib/types"

export const requestsQueryKey = ["requests"] as const

interface RequestCreateInput {
  title: string
  description?: string | null
  trade?: string | null
  postcode?: string | null
  budget_min?: number | null
  budget_max?: number | null
  timeline?: string | null
  status?: RequestStatus
}

interface RequestUpdateInput {
  title?: string
  description?: string | null
  trade?: string | null
  postcode?: string | null
  budget_min?: number | null
  budget_max?: number | null
  timeline?: string | null
  status?: RequestStatus
}

export function useRequests(accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: requestsQueryKey,
    queryFn: () => api.get<Request[]>(endpoints.requests.list, accessToken!),
    enabled: !!accessToken,
  })

  const createRequest = useMutation({
    mutationFn: (input: RequestCreateInput) =>
      api.post<Request>(endpoints.requests.list, input, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsQueryKey }),
  })

  const updateRequest = useMutation({
    mutationFn: ({ id, ...input }: RequestUpdateInput & { id: string }) =>
      api.patch<Request>(endpoints.requests.get(id), input, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsQueryKey }),
  })

  const deleteRequest = useMutation({
    mutationFn: (id: string) => api.delete(endpoints.requests.get(id), accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsQueryKey }),
  })

  return {
    requests: query.data ?? null,
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    error: (query.error ??
      createRequest.error ??
      updateRequest.error ??
      deleteRequest.error) as Error | null,
    refetch: query.refetch,
    createRequest: createRequest.mutateAsync,
    isCreating: createRequest.isPending,
    updateRequest: updateRequest.mutateAsync,
    isUpdating: updateRequest.isPending,
    deleteRequest: deleteRequest.mutateAsync,
    isDeleting: deleteRequest.isPending,
  }
}

export function useRequest(id: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["request", id],
    queryFn: () => api.get<Request>(endpoints.requests.get(id!), accessToken!),
    enabled: !!id && !!accessToken,
  })

  const updateRequest = useMutation({
    mutationFn: (input: RequestUpdateInput) =>
      api.patch<Request>(endpoints.requests.get(id!), input, accessToken!),
    onSuccess: (data) => {
      queryClient.setQueryData(["request", data.id], data)
      queryClient.invalidateQueries({ queryKey: requestsQueryKey })
    },
  })

  const deleteRequest = useMutation({
    mutationFn: () => api.delete(endpoints.requests.get(id!), accessToken!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["request", id] })
      queryClient.invalidateQueries({ queryKey: requestsQueryKey })
    },
  })

  const matchRequest = useMutation({
    mutationFn: () =>
      api.post<{ matched: number; message: string }>(
        endpoints.requests.match(id!),
        {},
        accessToken!
      ),
  })

  return {
    request: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ??
      updateRequest.error ??
      deleteRequest.error ??
      matchRequest.error) as Error | null,
    refetch: query.refetch,
    updateRequest: updateRequest.mutateAsync,
    isUpdating: updateRequest.isPending,
    deleteRequest: deleteRequest.mutateAsync,
    isDeleting: deleteRequest.isPending,
    matchRequest: matchRequest.mutateAsync,
    isMatching: matchRequest.isPending,
  }
}
