export type RequestMatchStatus = "pending" | "accepted" | "declined"

export interface RequestMatch {
  id: string
  request_id: string
  contractor_id: string
  status: RequestMatchStatus
  responded_at: string | null
  created_at: string
  updated_at: string
}

export interface RequestMatchWithRequest extends RequestMatch {
  request: {
    id: string
    title: string
    description: string | null
    trade: string | null
    postcode: string | null
    budget_min: number | null
    budget_max: number | null
    timeline: string | null
    status: string
    created_at: string
  }
}

export interface RequestMatchUpdate {
  status?: RequestMatchStatus
}
