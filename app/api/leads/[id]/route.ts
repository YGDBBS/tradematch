import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { AuthContext } from "@/lib/api/withAuth"
import { withAuth } from "@/lib/api/withAuth"
import type { RequestMatchUpdate } from "@/lib/types/requestMatch"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/leads/[id]
 * Get a single lead (request match) with full request details.
 */
export const GET = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

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
          customer_id,
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
      .eq("id", id)
      .eq("contractor_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)

/**
 * PATCH /api/leads/[id]
 * Respond to a lead (accept or decline).
 */
export const PATCH = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase, request: req }: AuthContext) => {
    const { id } = await params

    let body: RequestMatchUpdate
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    // Validate status
    if (body.status && !["pending", "accepted", "declined"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Build update object
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.status) {
      update.status = body.status
      // Set responded_at when accepting or declining
      if (body.status === "accepted" || body.status === "declined") {
        update.responded_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from("request_matches")
      .update(update)
      .eq("id", id)
      .eq("contractor_id", userId)
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
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)
