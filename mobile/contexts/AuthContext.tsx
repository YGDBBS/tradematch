import React, { createContext, useContext, useEffect, useState } from "react"
import { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

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
    client.auth.getSession().then(({ data: { session } }) => {
      setState({ session, loading: false })
    }).catch(() => {
      setState({ session: null, loading: false })
    })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
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
    if (client) await client.auth.signOut()
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
