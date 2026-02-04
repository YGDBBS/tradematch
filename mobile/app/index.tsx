import { useEffect } from "react"
import { View, StyleSheet, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { semantic } from "@/constants/theme"

/** Entry: redirect to welcome, onboarding, or (tabs) based on auth and profile. */
export default function IndexScreen() {
  const { session, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile(session?.access_token ?? undefined)

  useEffect(() => {
    if (authLoading) return
    if (!session) {
      router.replace("/welcome")
      return
    }
    if (profileLoading && !profile) return
    if (profile?.role === "contractor" && profile?.business_type == null) {
      router.replace("/onboarding/contractor-details")
      return
    }
    router.replace("/(tabs)")
  }, [authLoading, session, profileLoading, profile])

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={semantic.loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
