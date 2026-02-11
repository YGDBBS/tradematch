import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { MessageWithSender } from "@/lib/types"

interface MessagesResponse {
  messages: MessageWithSender[]
  hasMore: boolean
}

export function useMessages(requestId: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = ["messages", requestId]

  const query = useQuery({
    queryKey,
    queryFn: () => api.get<MessagesResponse>(endpoints.requests.messages(requestId!), accessToken!),
    enabled: !!requestId && !!accessToken,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  })

  const sendMessage = useMutation({
    mutationFn: (body: string) =>
      api.post<MessageWithSender>(endpoints.requests.messages(requestId!), { body }, accessToken!),
    onSuccess: (newMessage) => {
      // Optimistically add the new message to the cache
      queryClient.setQueryData<MessagesResponse>(queryKey, (old) => {
        if (!old) return { messages: [newMessage], hasMore: false }
        return {
          ...old,
          messages: [...old.messages, newMessage],
        }
      })
    },
  })

  return {
    messages: query.data?.messages ?? [],
    loading: query.isLoading,
    error: (query.error ?? sendMessage.error) as Error | null,
    refetch: query.refetch,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  }
}
