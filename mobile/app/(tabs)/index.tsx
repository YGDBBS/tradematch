import { useMemo } from "react"
import { View, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native"
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
import type { ProfileCompletionItem } from "@/components"
import { semantic, spacing } from "@/constants/theme"

function buildProfileCompletionItems(
  profile: { trade: string | null } | null
): ProfileCompletionItem[] {
  const goToEdit = () => router.push("/profile/edit")
  const comingSoon = (title: string) => () =>
    Alert.alert("Coming soon", `${title} will be available in a future update.`)
  const hasTrade = Boolean(profile?.trade?.trim())
  return [
    {
      id: "logo",
      label: "Upload company logo",
      completed: false,
      onPress: comingSoon("Company logo"),
    },
    {
      id: "cover",
      label: "Upload cover photo",
      completed: false,
      onPress: comingSoon("Cover photo"),
    },
    { id: "services", label: "Add services you offer", completed: hasTrade, onPress: goToEdit },
    { id: "review", label: "Get a review", completed: false, onPress: comingSoon("Reviews") },
    {
      id: "photos",
      label: "Create photo album and add photos",
      completed: false,
      onPress: comingSoon("Photo album"),
    },
  ]
}

const VALUE_PROP_BODY =
  "Qualified leads. Payment held by Stripe until work is done. Get seen and chosen by local customers."

export default function HomeScreen() {
  const { session, signOut } = useAuth()
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch,
  } = useProfile(session?.access_token ?? undefined)

  const profileCompletionItems = useMemo(() => buildProfileCompletionItems(profile), [profile])

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

  if (!profile) return null

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
        {profile.role === "contractor" ? (
          <Button
            title="Manage your jobs"
            variant="primary"
            onPress={() => router.push("/jobs")}
            style={styles.card}
          />
        ) : null}
        <ProfileCompletionCard items={profileCompletionItems} style={styles.card} />
        <ValuePropCard body={VALUE_PROP_BODY} style={styles.card} />
        <ProfileBlock
          profile={profile}
          onEdit={() => router.push("/profile/edit")}
          onSignOut={() => signOut()}
        />
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
  content: { padding: spacing.lg },
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
