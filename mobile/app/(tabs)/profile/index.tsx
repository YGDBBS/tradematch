import { View, StyleSheet, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button, ProfileBlock } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { semantic, spacing } from "@/constants/theme"

export default function ProfileScreen() {
  const { session, signOut } = useAuth()
  const { profile, loading, error, refetch } = useProfile(session?.access_token ?? undefined)

  if (loading && !profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={semantic.loading} />
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="bodySmall" style={styles.error}>
            {error.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} fullWidth />
        </View>
      </Screen>
    )
  }

  if (!profile) return null

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title" style={styles.title}>
          Profile
        </Text>
        <ProfileBlock
          profile={profile}
          onEdit={() => router.push("/profile/edit")}
          onSignOut={() => signOut()}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.lg,
  },
  error: {
    marginBottom: spacing.md,
    color: semantic.error,
  },
})
