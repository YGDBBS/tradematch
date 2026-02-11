import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import type { RequestInsert } from "@/lib/types/request"

const MAX_MATCHES = 5

const ALLOWED_INSERT_FIELDS: (keyof Omit<RequestInsert, "customer_id">)[] = [
  "title",
  "description",
  "trade",
  "postcode",
  "budget_min",
  "budget_max",
  "timeline",
  "status",
]

export const GET = withAuth(async ({ userId, supabase }) => {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
})

export const POST = withAuth(async ({ userId, supabase, request }) => {
  let body: Partial<RequestInsert>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const insert: Record<string, unknown> = { customer_id: userId }
  for (const key of ALLOWED_INSERT_FIELDS) {
    if (key in body) insert[key] = body[key]
  }

  const { data, error } = await supabase.from("requests").insert(insert).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-trigger matching if request is open
  if (data.status === "open") {
    try {
      const adminClient = createServiceRoleClient()

      // Find contractors with matching trade
      let contractorQuery = adminClient
        .from("profiles")
        .select("id")
        .eq("role", "contractor")
        .not("trade", "is", null)

      if (data.trade) {
        contractorQuery = contractorQuery.ilike("trade", `%${data.trade}%`)
      }

      const { data: contractors } = await contractorQuery.limit(MAX_MATCHES)

      if (contractors && contractors.length > 0) {
        const matches = contractors.map((c) => ({
          request_id: data.id,
          contractor_id: c.id,
          status: "pending",
        }))
        await adminClient.from("request_matches").insert(matches)
      }
    } catch {
      // Matching failure shouldn't fail the request creation
      console.error("Failed to auto-match request")
    }
  }

  return NextResponse.json(data, { status: 201 })
})
