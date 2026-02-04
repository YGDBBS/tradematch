import { useEffect } from "react"
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native"
import { router } from "expo-router"
import {
  Screen,
  Text,
  Button,
  ProfileBlock,
  ProfileCompletionCard,
  ValuePropCard,
} from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { semantic, spacing } from "@/constants/theme"

const PROFILE_COMPLETION_ITEMS = [
  { id: "logo", label: "Upload company logo", completed: false, onPress: undefined },
  { id: "cover", label: "Upload cover photo", completed: false, onPress: undefined },
  { id: "services", label: "Add services you offer", completed: false, onPress: undefined },
  { id: "review", label: "Get a review", completed: false, onPress: undefined },
  { id: "photos", label: "Create photo album and add photos", completed: false, onPress: undefined },
]

const VALUE_PROP_BODY =
  "Qualified leads. Payment held by Stripe until work is done. Get seen and chosen by local customers."

export default function HomeScreen() {
  const { session, loading: authLoading, signOut } = useAuth()
  const { profile, loading: profileLoading, error: profileError, refetch } = useProfile(
    session?.access_token ?? undefined
  )

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/welcome")
    }
  }, [authLoading, session])

  useEffect(() => {
    if (session && profile && profile.role === "contractor" && profile.business_type == null) {
      router.replace("/onboarding/contractor-details")
    }
  }, [session, profile])

  if (authLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={semantic.loading} />
        </View>
      </Screen>
    )
  }

  if (!session) return null

  if (profileLoading && !profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={semantic.loading} />
        </View>
      </Screen>
    )
  }

  if (profileError) {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="bodySmall" style={styles.error}>
            {profileError.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} fullWidth />
        </View>
      </Screen>
    )
  }

  const greetingName = profile.display_name?.trim() || profile.postcode || "there"

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title" style={styles.greeting}>
          Hello, {greetingName}
        </Text>
        <ProfileCompletionCard
          items={PROFILE_COMPLETION_ITEMS}
          style={styles.card}
        />
        <ValuePropCard body={VALUE_PROP_BODY} style={styles.card} />
        <ProfileBlock profile={profile} onSignOut={() => signOut()} />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  error: {
    marginBottom: 16,
    color: semantic.error,
  },
})
