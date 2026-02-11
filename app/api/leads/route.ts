import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"

/**
 * GET /api/leads
 * Returns all request matches for the current contractor, with request details.
 */
export const GET = withAuth(async ({ userId, supabase }) => {
  // Verify user is a contractor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (profile?.role !== "contractor") {
    return NextResponse.json({ error: "Only contractors can view leads" }, { status: 403 })
  }

  // Get all matches for this contractor with request details
  const { data, error } = await supabase
    .from("request_matches")
    .select(
      `
      id,
      request_id,
      contractor_id,
      status,
      responded_at,
      created_at,
      updated_at,
      request:requests (
        id,
        title,
        description,
        trade,
        postcode,
        budget_min,
        budget_max,
        timeline,
        status,
        created_at
      )
    `
    )
    .eq("contractor_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
})
