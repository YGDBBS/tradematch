import { NextRequest, NextResponse } from "next/server"
import { createServerClient, getSessionUserId } from "@/lib/supabase/server"
import type { ProfileUpdate } from "@/lib/types/profile"

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerClient(request)
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const userId = await getSessionUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: ProfileUpdate
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const allowed: (keyof ProfileUpdate)[] = [
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
  const update: ProfileUpdate = {}
  for (const key of allowed) {
    if (key in body) (update as Record<string, unknown>)[key] = body[key]
  }

  const supabase = createServerClient(request)
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
