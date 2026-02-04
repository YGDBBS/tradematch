export interface Customer {
  id: string
  contractor_id: string
  name: string
  email: string | null
  phone: string | null
  postcode: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CustomerInsert {
  contractor_id: string
  name: string
  email?: string | null
  phone?: string | null
  postcode?: string | null
  notes?: string | null
}

export interface CustomerUpdate {
  name?: string
  email?: string | null
  phone?: string | null
  postcode?: string | null
  notes?: string | null
}
