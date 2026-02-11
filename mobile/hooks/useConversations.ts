import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"

export interface Conversation {
  request_id: string
  title: string
  status: string
  created_at: string
  other_party: {
    id: string
    full_name: string | null
    role: string
  } | null
  role: "customer" | "contractor"
}

export function useConversations(accessToken: string | undefined) {
  const query = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get<Conversation[]>(endpoints.conversations.list, accessToken!),
    enabled: !!accessToken,
  })

  return {
    conversations: query.data ?? [],
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
