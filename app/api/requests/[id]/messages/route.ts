import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { AuthContext } from "@/lib/api/withAuth"
import { withAuth } from "@/lib/api/withAuth"
import type { MessageInsert } from "@/lib/types/message"

type RouteParams = { params: Promise<{ id: string }> }

const DEFAULT_LIMIT = 50

/**
 * GET /api/requests/[id]/messages
 * Get messages for a request (paginated, newest first).
 * Query params: limit, before (cursor for pagination)
 */
export const GET = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ supabase }: AuthContext) => {
    const { id: requestId } = await params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT)), 100)
    const before = searchParams.get("before") // ISO timestamp for cursor pagination

    let query = supabase
      .from("messages")
      .select("id, request_id, sender_id, body, attachment_url, created_at")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt("created_at", before)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Collect unique sender IDs and fetch profiles separately
    const senderIds = Array.from(new Set((data || []).map((m) => m.sender_id)))
    let profilesMap: Record<string, { id: string; full_name: string | null; role: string }> = {}

    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("id", senderIds)

      if (profiles) {
        profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
      }
    }

    // Attach sender info to messages and reverse for oldest-first
    const messages = (data || [])
      .map((m) => ({
        ...m,
        sender: profilesMap[m.sender_id] || null,
      }))
      .reverse()

    return NextResponse.json({
      messages,
      hasMore: data?.length === limit,
    })
  })(request)

/**
 * POST /api/requests/[id]/messages
 * Send a message to a request conversation.
 */
export const POST = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase, request: req }: AuthContext) => {
    const { id: requestId } = await params

    let body: Pick<MessageInsert, "body" | "attachment_url">
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (!body.body?.trim()) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 })
    }

    const insert: MessageInsert = {
      request_id: requestId,
      sender_id: userId,
      body: body.body.trim(),
    }

    if (body.attachment_url) {
      insert.attachment_url = body.attachment_url
    }

    const { data, error } = await supabase
      .from("messages")
      .insert(insert)
      .select("id, request_id, sender_id, body, attachment_url, created_at")
      .single()

    if (error) {
      // RLS will block if user is not a party to the request
      if (error.code === "42501") {
        return NextResponse.json(
          { error: "Not authorized to message on this request" },
          { status: 403 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch sender profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .single()

    return NextResponse.json(
      {
        ...data,
        sender: profile || null,
      },
      { status: 201 }
    )
  })(request)
