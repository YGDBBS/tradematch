import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"
import type { QuoteInsert } from "@/lib/types/quote"

const ALLOWED_INSERT_FIELDS: (keyof QuoteInsert)[] = [
  "job_id",
  "status",
  "amount",
  "description",
  "line_items",
  "valid_until",
]

// GET /api/quotes?job_id=xxx - List quotes for a job
export const GET = withAuth(async ({ userId, supabase, request }) => {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("job_id")

  if (!jobId) {
    return NextResponse.json({ error: "job_id is required" }, { status: 400 })
  }

  // Verify the job belongs to this contractor
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("contractor_id", userId)
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
})

// POST /api/quotes - Create a new quote
export const POST = withAuth(async ({ userId, supabase, request }) => {
  let body: Partial<QuoteInsert>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.job_id) {
    return NextResponse.json({ error: "job_id is required" }, { status: 400 })
  }

  if (body.amount === undefined || body.amount === null) {
    return NextResponse.json({ error: "amount is required" }, { status: 400 })
  }

  // Verify the job belongs to this contractor
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", body.job_id)
    .eq("contractor_id", userId)
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  const insert: Record<string, unknown> = {}
  for (const key of ALLOWED_INSERT_FIELDS) {
    if (key in body) insert[key] = body[key]
  }

  const { data, error } = await supabase.from("quotes").insert(insert).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
})
