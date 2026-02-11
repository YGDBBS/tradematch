import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { AuthContext } from "@/lib/api/withAuth"
import { withAuth } from "@/lib/api/withAuth"
import { createServiceRoleClient } from "@/lib/supabase/server"

type RouteParams = { params: Promise<{ id: string }> }

const MAX_MATCHES = 5

/**
 * POST /api/requests/[id]/match
 * Triggers matching for a request. Finds contractors by trade and creates matches.
 * Only the request owner (customer) can trigger matching.
 */
export const POST = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

    // 1. Verify the request exists and belongs to this customer
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .eq("customer_id", userId)
      .single()

    if (requestError || !requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // 2. Only match if request is open
    if (requestData.status !== "open") {
      return NextResponse.json(
        { error: "Request must be open to match contractors" },
        { status: 400 }
      )
    }

    // 3. Use service role client to find contractors and create matches
    const adminClient = createServiceRoleClient()

    // Find contractors with matching trade (case-insensitive partial match)
    // In production, you'd also filter by location/radius
    let contractorQuery = adminClient
      .from("profiles")
      .select("id, display_name, trade, postcode, radius_km")
      .eq("role", "contractor")
      .not("trade", "is", null)

    // If request has a trade specified, filter by it
    if (requestData.trade) {
      contractorQuery = contractorQuery.ilike("trade", `%${requestData.trade}%`)
    }

    const { data: contractors, error: contractorsError } = await contractorQuery.limit(MAX_MATCHES)

    if (contractorsError) {
      return NextResponse.json({ error: contractorsError.message }, { status: 500 })
    }

    if (!contractors || contractors.length === 0) {
      return NextResponse.json({ matched: 0, message: "No contractors found for this trade" })
    }

    // 4. Check for existing matches to avoid duplicates
    const { data: existingMatches } = await adminClient
      .from("request_matches")
      .select("contractor_id")
      .eq("request_id", id)

    const existingContractorIds = new Set(existingMatches?.map((m) => m.contractor_id) || [])

    // 5. Create matches for contractors who aren't already matched
    const newMatches = contractors
      .filter((c) => !existingContractorIds.has(c.id))
      .map((contractor) => ({
        request_id: id,
        contractor_id: contractor.id,
        status: "pending",
      }))

    if (newMatches.length === 0) {
      return NextResponse.json({ matched: 0, message: "All found contractors already matched" })
    }

    const { error: insertError } = await adminClient.from("request_matches").insert(newMatches)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      matched: newMatches.length,
      message: `Matched ${newMatches.length} contractor${newMatches.length === 1 ? "" : "s"}`,
    })
  })(request)
