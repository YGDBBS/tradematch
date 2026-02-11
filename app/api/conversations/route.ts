import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"

/**
 * GET /api/conversations
 * Get all requests the user can message on (as customer or accepted contractor).
 */
export const GET = withAuth(async ({ userId, supabase }) => {
  // Get requests where user is customer with accepted matches
  const { data: customerRequests, error: customerError } = await supabase
    .from("requests")
    .select(
      `
      id,
      title,
      status,
      created_at,
      customer_id,
      request_matches!inner (
        contractor_id,
        status
      )
    `
    )
    .eq("customer_id", userId)
    .eq("request_matches.status", "accepted")
    .in("status", ["assigned", "in_progress"])

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 })
  }

  // Get requests where user is accepted contractor
  const { data: contractorMatches, error: contractorError } = await supabase
    .from("request_matches")
    .select(
      `
      id,
      request_id,
      status,
      request:requests (
        id,
        title,
        status,
        created_at,
        customer_id
      )
    `
    )
    .eq("contractor_id", userId)
    .eq("status", "accepted")

  if (contractorError) {
    return NextResponse.json({ error: contractorError.message }, { status: 500 })
  }

  // Collect all profile IDs we need to fetch
  const profileIds = new Set<string>()

  // From customer requests, get contractor IDs
  for (const req of customerRequests || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches = req.request_matches as any
    const match = Array.isArray(matches) ? matches[0] : matches
    if (match?.contractor_id) {
      profileIds.add(match.contractor_id)
    }
  }

  // From contractor matches, get customer IDs
  for (const match of contractorMatches || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqData = match.request as any
    const req = Array.isArray(reqData) ? reqData[0] : reqData
    if (req?.customer_id) {
      profileIds.add(req.customer_id)
    }
  }

  // Fetch all needed profiles in one query
  const profileIdArray = Array.from(profileIds)
  let profilesMap: Record<string, { id: string; full_name: string | null; role: string }> = {}

  if (profileIdArray.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", profileIdArray)

    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
    }
  }

  // Format customer conversations
  const customerConversations = (customerRequests || []).map((req) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches = req.request_matches as any
    const match = Array.isArray(matches) ? matches[0] : matches
    const contractor = match?.contractor_id ? profilesMap[match.contractor_id] : null
    return {
      request_id: req.id,
      title: req.title,
      status: req.status,
      created_at: req.created_at,
      other_party: contractor || null,
      role: "customer" as const,
    }
  })

  // Format contractor conversations
  const contractorConversations = (contractorMatches || [])
    .filter((m) => m.request)
    .map((match) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reqData = match.request as any
      const req = Array.isArray(reqData) ? reqData[0] : reqData
      const customer = req?.customer_id ? profilesMap[req.customer_id] : null
      return {
        request_id: req?.id as string,
        title: req?.title as string,
        status: req?.status as string,
        created_at: req?.created_at as string,
        other_party: customer || null,
        role: "contractor" as const,
      }
    })

  // Combine and sort by created_at (newest first)
  const conversations = [...customerConversations, ...contractorConversations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return NextResponse.json(conversations)
})
