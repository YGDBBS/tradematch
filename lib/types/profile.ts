export type ProfileRole = "customer" | "contractor"

export type BusinessType = "sole_trader" | "ltd"

export interface Profile {
  id: string
  role: ProfileRole
  display_name: string | null
  phone: string | null
  postcode: string | null
  trade: string | null
  radius_km: number | null
  stripe_account_id: string | null
  business_type: BusinessType | null
  employee_count: number | null
  is_employer: boolean | null
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  role?: ProfileRole
  display_name?: string | null
  phone?: string | null
  postcode?: string | null
  trade?: string | null
  radius_km?: number | null
  business_type?: BusinessType | null
  employee_count?: number | null
  is_employer?: boolean | null
}
