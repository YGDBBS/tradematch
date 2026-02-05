import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { Quote } from "@/lib/types"

interface QuoteWithJob extends Quote {
  jobs?: {
    title: string
    customer_id: string | null
  }
}

export interface FinancialSummary {
  totalOwed: number
  pendingQuotes: number
  paidThisMonth: number
  overdueAmount: number
}

export interface FinancialActivity {
  id: string
  type: "payment_received" | "quote_accepted" | "quote_sent" | "payment_overdue"
  amount: number
  description: string
  jobTitle: string
  date: string
}

function isOverdue(quote: Quote): boolean {
  if (!quote.valid_until) return false
  const validUntil = new Date(quote.valid_until)
  const now = new Date()
  return validUntil < now && quote.status === "sent"
}

export function useFinancials(accessToken: string | undefined) {
  const query = useQuery({
    queryKey: ["financials", "all-quotes"],
    queryFn: () => api.get<QuoteWithJob[]>(endpoints.quotes.all, accessToken!),
    enabled: !!accessToken,
  })

  const quotes = query.data ?? []

  // Calculate summary
  const summary: FinancialSummary = {
    // Total owed = accepted quotes (work agreed but not yet paid)
    totalOwed: quotes.filter((q) => q.status === "accepted").reduce((sum, q) => sum + q.amount, 0),

    // Pending = sent quotes awaiting response
    pendingQuotes: quotes
      .filter((q) => q.status === "sent" && !isOverdue(q))
      .reduce((sum, q) => sum + q.amount, 0),

    // Paid this month - we don't have payment tracking yet, so this is 0
    // In future, this would come from a payments table
    paidThisMonth: 0,

    // Overdue = sent quotes past valid_until date
    overdueAmount: quotes.filter((q) => isOverdue(q)).reduce((sum, q) => sum + q.amount, 0),
  }

  // Build activity feed from recent quotes
  const recentActivity: FinancialActivity[] = quotes
    .slice(0, 10) // Last 10 quotes
    .map((quote): FinancialActivity | null => {
      const jobTitle = quote.jobs?.title || "Unknown job"

      if (quote.status === "accepted") {
        return {
          id: quote.id,
          type: "quote_accepted",
          amount: quote.amount,
          description: "Quote accepted",
          jobTitle,
          date: quote.responded_at || quote.updated_at,
        }
      }

      if (quote.status === "sent" && isOverdue(quote)) {
        return {
          id: quote.id,
          type: "payment_overdue",
          amount: quote.amount,
          description: "Quote expired",
          jobTitle,
          date: quote.valid_until!,
        }
      }

      if (quote.status === "sent") {
        return {
          id: quote.id,
          type: "quote_sent",
          amount: quote.amount,
          description: "Quote sent",
          jobTitle,
          date: quote.sent_at || quote.updated_at,
        }
      }

      return null
    })
    .filter((a): a is FinancialActivity => a !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return {
    summary,
    recentActivity,
    quotes,
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
