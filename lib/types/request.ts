export type RequestStatus =
  | "draft"
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface Request {
  id: string
  customer_id: string
  title: string
  description: string | null
  trade: string | null
  postcode: string | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  status: RequestStatus
  created_at: string
  updated_at: string
}

export interface RequestInsert {
  customer_id: string
  title: string
  description?: string | null
  trade?: string | null
  postcode?: string | null
  budget_min?: number | null
  budget_max?: number | null
  timeline?: string | null
  status?: RequestStatus
}

export interface RequestUpdate {
  title?: string
  description?: string | null
  trade?: string | null
  postcode?: string | null
  budget_min?: number | null
  budget_max?: number | null
  timeline?: string | null
  status?: RequestStatus
}
