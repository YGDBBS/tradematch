import { useState } from "react"
import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import type { ProfileRole } from "@/lib/types"
import { semantic, spacing } from "@/constants/theme"

export default function OnboardingRoleScreen() {
  const { session } = useAuth()
  const { profile, updateProfile, isUpdating } = useProfile(session?.access_token ?? undefined)
  const [error, setError] = useState<string | null>(null)

  const chooseRole = async (role: ProfileRole) => {
    setError(null)
    try {
      await updateProfile({ role })
      if (role === "contractor") {
        router.replace("/onboarding/contractor-details")
      } else {
        router.replace("/onboarding/customer-details")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <Screen padded={false}>
      <View style={styles.container}>
        <Text variant="title" style={styles.title}>
          Are you here as…
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          We’ll tailor your experience based on your answer.
        </Text>
        {error ? (
          <Text variant="bodySmall" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Button
          title="I’m looking for a trade (customer)"
          variant="primary"
          onPress={() => chooseRole("customer")}
          disabled={isUpdating}
          fullWidth
          style={styles.button}
        />
        <Button
          title="I’m a trade (contractor)"
          variant="secondary"
          onPress={() => chooseRole("contractor")}
          disabled={isUpdating}
          fullWidth
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  error: {
    color: semantic.error,
    marginBottom: spacing.sm,
  },
  button: {
    marginBottom: spacing.md,
  },
})
