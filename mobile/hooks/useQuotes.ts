import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { Quote, QuoteStatus, QuoteLineItem } from "@/lib/types"

export const quotesQueryKey = (jobId: string) => ["quotes", jobId] as const
export const allQuotesQueryKey = ["financials", "all-quotes"] as const

interface QuoteCreateInput {
  job_id: string
  amount: number
  description?: string | null
  line_items?: QuoteLineItem[] | null
  valid_until?: string | null
}

interface QuoteUpdateInput {
  status?: QuoteStatus
  amount?: number
  description?: string | null
  line_items?: QuoteLineItem[] | null
  valid_until?: string | null
}

export function useQuotes(jobId: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: quotesQueryKey(jobId ?? ""),
    queryFn: () => api.get<Quote[]>(endpoints.quotes.list(jobId!), accessToken!),
    enabled: !!jobId && !!accessToken,
  })

  const createQuote = useMutation({
    mutationFn: (input: Omit<QuoteCreateInput, "job_id">) =>
      api.post<Quote>(endpoints.quotes.create, { ...input, job_id: jobId }, accessToken!),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: quotesQueryKey(jobId) })
      }
      queryClient.invalidateQueries({ queryKey: allQuotesQueryKey })
    },
  })

  const updateQuote = useMutation({
    mutationFn: ({ id, ...input }: QuoteUpdateInput & { id: string }) =>
      api.patch<Quote>(endpoints.quotes.get(id), input, accessToken!),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: quotesQueryKey(jobId) })
      }
      queryClient.invalidateQueries({ queryKey: allQuotesQueryKey })
    },
  })

  const deleteQuote = useMutation({
    mutationFn: (id: string) => api.delete(endpoints.quotes.get(id), accessToken!),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: quotesQueryKey(jobId) })
      }
      queryClient.invalidateQueries({ queryKey: allQuotesQueryKey })
    },
  })

  return {
    quotes: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ??
      createQuote.error ??
      updateQuote.error ??
      deleteQuote.error) as Error | null,
    refetch: query.refetch,
    createQuote: createQuote.mutateAsync,
    isCreating: createQuote.isPending,
    updateQuote: updateQuote.mutateAsync,
    isUpdating: updateQuote.isPending,
    deleteQuote: deleteQuote.mutateAsync,
    isDeleting: deleteQuote.isPending,
  }
}

export function useQuote(id: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["quote", id],
    queryFn: () => api.get<Quote>(endpoints.quotes.get(id!), accessToken!),
    enabled: !!id && !!accessToken,
  })

  const updateQuote = useMutation({
    mutationFn: (input: QuoteUpdateInput) =>
      api.patch<Quote>(endpoints.quotes.get(id!), input, accessToken!),
    onSuccess: (data) => {
      queryClient.setQueryData(["quote", data.id], data)
      // Invalidate the quotes list for this job and the financials
      queryClient.invalidateQueries({ queryKey: quotesQueryKey(data.job_id) })
      queryClient.invalidateQueries({ queryKey: allQuotesQueryKey })
    },
  })

  const deleteQuote = useMutation({
    mutationFn: () => api.delete(endpoints.quotes.get(id!), accessToken!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["quote", id] })
      queryClient.invalidateQueries({ queryKey: allQuotesQueryKey })
    },
  })

  // Helper to mark as sent
  const sendQuote = () => updateQuote.mutateAsync({ status: "sent" })

  return {
    quote: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ?? updateQuote.error ?? deleteQuote.error) as Error | null,
    refetch: query.refetch,
    updateQuote: updateQuote.mutateAsync,
    isUpdating: updateQuote.isPending,
    deleteQuote: deleteQuote.mutateAsync,
    isDeleting: deleteQuote.isPending,
    sendQuote,
  }
}
