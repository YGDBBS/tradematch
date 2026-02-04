import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api/withAuth"
import type { CustomerInsert } from "@/lib/types/customer"

const ALLOWED_INSERT_FIELDS: (keyof Omit<CustomerInsert, "contractor_id">)[] = [
  "name",
  "email",
  "phone",
  "postcode",
  "notes",
]

export const GET = withAuth(async ({ userId, supabase }) => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("contractor_id", userId)
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
})

export const POST = withAuth(async ({ userId, supabase, request }) => {
  let body: Partial<CustomerInsert>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const insert: Record<string, unknown> = { contractor_id: userId }
  for (const key of ALLOWED_INSERT_FIELDS) {
    if (key in body) insert[key] = body[key]
  }

  const { data, error } = await supabase.from("customers").insert(insert).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
})
