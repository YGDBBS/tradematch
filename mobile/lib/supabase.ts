import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

let _client: SupabaseClient | null = null

if (url && anonKey) {
  _client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
} else {
  if (__DEV__) {
    console.warn(
      "Supabase env missing. Copy mobile/.env.example to mobile/.env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    )
  }
}

export const supabase: SupabaseClient | null = _client

/** True if Supabase is configured and auth can be used. */
export function isSupabaseConfigured(): boolean {
  return _client != null
}
