import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { Job, JobStatus } from "@/lib/types"

export const jobsQueryKey = ["jobs"] as const

interface JobCreateInput {
  title: string
  customer_id?: string | null
  status?: JobStatus
  due_date?: string | null
  notes?: string | null
}

interface JobUpdateInput {
  title?: string
  customer_id?: string | null
  status?: JobStatus
  due_date?: string | null
  scheduled_at?: string | null
  notes?: string | null
  amount_quoted?: number | null
  amount_invoiced?: number | null
}

export function useJobs(accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: jobsQueryKey,
    queryFn: () => api.get<Job[]>(endpoints.jobs.list, accessToken!),
    enabled: !!accessToken,
  })

  const createJob = useMutation({
    mutationFn: (input: JobCreateInput) => api.post<Job>(endpoints.jobs.list, input, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobsQueryKey }),
  })

  const updateJob = useMutation({
    mutationFn: ({ id, ...input }: JobUpdateInput & { id: string }) =>
      api.patch<Job>(endpoints.jobs.get(id), input, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobsQueryKey }),
  })

  const deleteJob = useMutation({
    mutationFn: (id: string) => api.delete(endpoints.jobs.get(id), accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobsQueryKey }),
  })

  return {
    jobs: query.data ?? null,
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    error: (query.error ?? createJob.error ?? updateJob.error ?? deleteJob.error) as Error | null,
    refetch: query.refetch,
    createJob: createJob.mutateAsync,
    isCreating: createJob.isPending,
    updateJob: updateJob.mutateAsync,
    isUpdating: updateJob.isPending,
    deleteJob: deleteJob.mutateAsync,
    isDeleting: deleteJob.isPending,
  }
}

export function useJob(id: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["job", id],
    queryFn: () => api.get<Job>(endpoints.jobs.get(id!), accessToken!),
    enabled: !!id && !!accessToken,
  })

  const updateJob = useMutation({
    mutationFn: (input: JobUpdateInput) =>
      api.patch<Job>(endpoints.jobs.get(id!), input, accessToken!),
    onSuccess: (data) => {
      queryClient.setQueryData(["job", data.id], data)
      queryClient.invalidateQueries({ queryKey: jobsQueryKey })
    },
  })

  const deleteJob = useMutation({
    mutationFn: () => api.delete(endpoints.jobs.get(id!), accessToken!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["job", id] })
      queryClient.invalidateQueries({ queryKey: jobsQueryKey })
    },
  })

  return {
    job: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ?? updateJob.error ?? deleteJob.error) as Error | null,
    refetch: query.refetch,
    updateJob: updateJob.mutateAsync,
    isUpdating: updateJob.isPending,
    deleteJob: deleteJob.mutateAsync,
    isDeleting: deleteJob.isPending,
  }
}
