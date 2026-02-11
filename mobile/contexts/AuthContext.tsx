import React, { createContext, useContext, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { queryClient } from "./QueryProvider"

interface AuthState {
  session: Session | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true })

  useEffect(() => {
    const client = supabase
    if (!client) {
      setState({ session: null, loading: false })
      return
    }
    client.auth
      .getSession()
      .then(({ data: { session } }) => {
        setState({ session, loading: false })
      })
      .catch(() => {
        setState({ session: null, loading: false })
      })

    let previousUserId: string | undefined

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      const currentUserId = session?.user?.id

      // Clear cache when user signs out or switches to a different account
      if (event === "SIGNED_OUT") {
        queryClient.clear()
      } else if (event === "SIGNED_IN" && previousUserId && previousUserId !== currentUserId) {
        // Different user signed in - clear previous user's cached data
        queryClient.clear()
      }

      previousUserId = currentUserId
      setState((prev) => ({ ...prev, session }))
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const client = supabase
    if (!client) return { error: new Error("Supabase not configured") as Error }
    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }

  const signUp = async (email: string, password: string) => {
    const client = supabase
    if (!client) return { error: new Error("Supabase not configured") as Error }
    const { error } = await client.auth.signUp({ email, password })
    return { error: error ?? null }
  }

  const signOut = async () => {
    const client = supabase
    if (client) {
      await client.auth.signOut()
      // Clear all cached data from previous user
      queryClient.clear()
    }
  }

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
