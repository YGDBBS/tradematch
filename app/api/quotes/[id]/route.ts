import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { withAuth, type AuthContext } from "@/lib/api/withAuth"
import type { QuoteUpdate } from "@/lib/types/quote"

const ALLOWED_UPDATE_FIELDS: (keyof QuoteUpdate)[] = [
  "status",
  "amount",
  "description",
  "line_items",
  "valid_until",
  "sent_at",
  "responded_at",
]

type RouteParams = { params: Promise<{ id: string }> }

// Helper to verify quote ownership via job
async function verifyQuoteOwnership(
  supabase: AuthContext["supabase"],
  quoteId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("quotes")
    .select("id, job_id, jobs!inner(contractor_id)")
    .eq("id", quoteId)
    .single()

  if (error || !data) return null
  // @ts-expect-error - Supabase join typing
  if (data.jobs?.contractor_id !== userId) return null
  return data
}

export const GET = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

    const quote = await verifyQuoteOwnership(supabase, id, userId)
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const { data, error } = await supabase.from("quotes").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)

export const PATCH = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase, request: req }: AuthContext) => {
    const { id } = await params

    const quote = await verifyQuoteOwnership(supabase, id, userId)
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    let body: QuoteUpdate
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in body) update[key] = body[key]
    }

    // If status is changing to 'sent', set sent_at
    if (body.status === "sent" && !body.sent_at) {
      update.sent_at = new Date().toISOString()
    }

    // If status is changing to 'accepted' or 'declined', set responded_at
    if ((body.status === "accepted" || body.status === "declined") && !body.responded_at) {
      update.responded_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("quotes")
      .update(update)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)

export const DELETE = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

    const quote = await verifyQuoteOwnership(supabase, id, userId)
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const { error } = await supabase.from("quotes").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  })(request)
