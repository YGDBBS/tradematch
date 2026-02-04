export type JobStatus = "draft" | "quoted" | "scheduled" | "in_progress" | "done" | "cancelled"

export interface Job {
  id: string
  contractor_id: string
  customer_id: string | null
  title: string
  status: JobStatus
  due_date: string | null
  scheduled_at: string | null
  notes: string | null
  amount_quoted: number | null
  amount_invoiced: number | null
  created_at: string
  updated_at: string
}

export interface JobInsert {
  contractor_id: string
  customer_id?: string | null
  title: string
  status?: JobStatus
  due_date?: string | null
  scheduled_at?: string | null
  notes?: string | null
  amount_quoted?: number | null
  amount_invoiced?: number | null
}

export interface JobUpdate {
  customer_id?: string | null
  title?: string
  status?: JobStatus
  due_date?: string | null
  scheduled_at?: string | null
  notes?: string | null
  amount_quoted?: number | null
  amount_invoiced?: number | null
}
