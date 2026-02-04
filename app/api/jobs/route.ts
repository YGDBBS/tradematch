import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"
import type { JobInsert } from "@/lib/types/job"

const ALLOWED_INSERT_FIELDS: (keyof Omit<JobInsert, "contractor_id">)[] = [
  "title",
  "customer_id",
  "status",
  "due_date",
  "scheduled_at",
  "notes",
  "amount_quoted",
  "amount_invoiced",
]

export const GET = withAuth(async ({ userId, supabase }) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("contractor_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
})

export const POST = withAuth(async ({ userId, supabase, request }) => {
  let body: Partial<JobInsert>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const insert: Record<string, unknown> = { contractor_id: userId }
  for (const key of ALLOWED_INSERT_FIELDS) {
    if (key in body) insert[key] = body[key]
  }

  const { data, error } = await supabase.from("jobs").insert(insert).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
})
