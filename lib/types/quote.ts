export type QuoteStatus = "draft" | "sent" | "accepted" | "declined"

export interface QuoteLineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Quote {
  id: string
  job_id: string
  status: QuoteStatus
  amount: number
  description: string | null
  line_items: QuoteLineItem[] | null
  valid_until: string | null
  sent_at: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

export interface QuoteInsert {
  job_id: string
  status?: QuoteStatus
  amount: number
  description?: string | null
  line_items?: QuoteLineItem[] | null
  valid_until?: string | null
}

export interface QuoteUpdate {
  status?: QuoteStatus
  amount?: number
  description?: string | null
  line_items?: QuoteLineItem[] | null
  valid_until?: string | null
  sent_at?: string | null
  responded_at?: string | null
}
