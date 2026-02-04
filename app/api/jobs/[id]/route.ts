import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { AuthContext } from "@/lib/api/withAuth"
import { withAuth } from "@/lib/api/withAuth"
import type { JobUpdate } from "@/lib/types/job"

const ALLOWED_UPDATE_FIELDS: (keyof JobUpdate)[] = [
  "title",
  "customer_id",
  "status",
  "due_date",
  "scheduled_at",
  "notes",
  "amount_quoted",
  "amount_invoiced",
]

type RouteParams = { params: Promise<{ id: string }> }

export const GET = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("contractor_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)

export const PATCH = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase, request: req }: AuthContext) => {
    const { id } = await params

    let body: JobUpdate
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
      .from("jobs")
      .update(update)
      .eq("id", id)
      .eq("contractor_id", userId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  })(request)

export const DELETE = (request: NextRequest, { params }: RouteParams) =>
  withAuth(async ({ userId, supabase }: AuthContext) => {
    const { id } = await params

    const { error } = await supabase.from("jobs").delete().eq("id", id).eq("contractor_id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  })(request)
