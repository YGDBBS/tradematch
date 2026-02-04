import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"
import { validatePostcode, validatePhone, normalizePostcode } from "@/lib/api/validation"
import type { ProfileUpdate } from "@/lib/types/profile"

export const GET = withAuth(async ({ userId, supabase }) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
})

const ALLOWED_FIELDS: (keyof ProfileUpdate)[] = [
  "role",
  "display_name",
  "phone",
  "postcode",
  "trade",
  "radius_km",
  "business_type",
  "employee_count",
  "is_employer",
]

export const PATCH = withAuth(async ({ userId, supabase, request }) => {
  let body: ProfileUpdate
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Validate fields
  if ("postcode" in body && body.postcode) {
    const postcodeError = validatePostcode(body.postcode)
    if (postcodeError) {
      return NextResponse.json({ error: postcodeError }, { status: 400 })
    }
  }
  if ("phone" in body && body.phone) {
    const phoneError = validatePhone(body.phone)
    if (phoneError) {
      return NextResponse.json({ error: phoneError }, { status: 400 })
    }
  }

  const update: ProfileUpdate = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) (update as Record<string, unknown>)[key] = body[key]
  }

  // Normalize postcode if present
  if (update.postcode) {
    update.postcode = normalizePostcode(update.postcode)
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
})
