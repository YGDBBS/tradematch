import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"

/**
 * GET /api/conversations
 * Get all requests the user can message on (as customer or accepted contractor).
 * Returns requests with the other party's info and last message preview.
 */
export const GET = withAuth(async ({ userId, supabase }) => {
  // Get requests where user is customer
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
        status,
        contractor:profiles!contractor_id (
          id,
          full_name,
          role
        )
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
        customer_id,
        customer:profiles!customer_id (
          id,
          full_name,
          role
        )
      )
    `
    )
    .eq("contractor_id", userId)
    .eq("status", "accepted")

  if (contractorError) {
    return NextResponse.json({ error: contractorError.message }, { status: 500 })
  }

  // Format customer conversations
  const customerConversations = (customerRequests || []).map((req) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches = req.request_matches as any
    const match = Array.isArray(matches) ? matches[0] : matches
    const contractor = Array.isArray(match?.contractor) ? match.contractor[0] : match?.contractor
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
      // Supabase may return as array or single object depending on relationship
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reqData = match.request as any
      const req = Array.isArray(reqData) ? reqData[0] : reqData
      const customer = Array.isArray(req?.customer) ? req.customer[0] : req?.customer
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
