import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { AuthContext } from "@/lib/api/withAuth"
import { withAuth } from "@/lib/api/withAuth"
import type { RequestUpdate } from "@/lib/types/request"

const ALLOWED_UPDATE_FIELDS: (keyof RequestUpdate)[] = [
  "title",
  "description",
  "trade",
  "postcode",
  "budget_min",
  "budget_max",
  "timeline",
  "status",
]

type RouteParams = { params: Promise<{ id: string }> }

export const GET = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .eq("customer_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Request not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)

export const PATCH = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase, request: req }: AuthContext) => {
    const { id } = await params

    let body: RequestUpdate
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in body) update[key] = body[key]
    }

    const { data, error } = await supabase
      .from("requests")
      .update(update)
      .eq("id", id)
      .eq("customer_id", userId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Request not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)

export const DELETE = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

    const { error } = await supabase
      .from("requests")
      .delete()
      .eq("id", id)
      .eq("customer_id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  })(request)
