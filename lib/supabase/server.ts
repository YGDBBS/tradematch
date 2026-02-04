import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a Supabase client for API routes that uses the user's JWT from the request.
 * Use for RLS-scoped operations (user sees only their data).
 */
export function createServerClient(request: NextRequest): SupabaseClient {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  return createClient(url, anonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })
}

/**
 * Extract the current user id from the request JWT. Returns null if no valid token.
 */
export async function getSessionUserId(request: NextRequest): Promise<string | null> {
  const supabase = createServerClient(request)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/**
 * Service-role client; bypasses RLS. Use only in API routes for admin or server-only operations.
 */
export function createServiceRoleClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  return createClient(url, serviceKey)
}
