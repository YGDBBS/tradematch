import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createServerClient, getSessionUserId } from "@/lib/supabase/server"

export interface AuthContext {
  userId: string
  supabase: SupabaseClient
  request: NextRequest
}

export type AuthHandler = (ctx: AuthContext) => Promise<NextResponse>

/**
 * Wraps an API route handler with authentication.
 * Validates Bearer token and extracts user ID before calling the handler.
 *
 * @example
 * export const GET = withAuth(async ({ userId, supabase }) => {
 *   const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
 *   return NextResponse.json(data)
 * })
 */
export function withAuth(handler: AuthHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authHeader = request.headers.get("authorization")
    const hasToken = authHeader?.startsWith("Bearer ") && authHeader.length > 10

    if (!hasToken) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })
    }

    const userId = await getSessionUserId(request)
    if (!userId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const supabase = createServerClient(request)

    return handler({ userId, supabase, request })
  }
}
