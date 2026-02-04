import { useState } from "react"
import { View, StyleSheet, Alert } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import type { ProfileRole } from "@/lib/types"
import { semantic, spacing } from "@/constants/theme"

function getErrorMessage(e: unknown): string {
  let message: string
  if (e instanceof Error) {
    message = e.message
  } else if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    message = (e as { message: string }).message
  } else if (
    e &&
    typeof e === "object" &&
    "error" in e &&
    typeof (e as { error: unknown }).error === "string"
  ) {
    message = (e as { error: string }).error
  } else if (typeof e === "string") {
    message = e
  } else {
    message = e != null ? String(e) : "Something went wrong"
  }
  if (message === "Network request failed") {
    return "Can't reach the API. Check mobile/.env has EXPO_PUBLIC_API_URL set to your Vercel URL (https://...), then restart Expo: npx expo start --clear"
  }
  return message
}

export default function OnboardingRoleScreen() {
  const { session } = useAuth()
  const { updateProfile, isUpdating } = useProfile(session?.access_token ?? undefined)
  const [error, setError] = useState<string | null>(null)

  const chooseRole = async (role: ProfileRole) => {
    setError(null)
    if (!session?.access_token) {
      Alert.alert("Not signed in", "Please sign in again and try again.")
      return
    }
    try {
      await updateProfile({ role })
      if (role === "contractor") {
        router.push("/onboarding/contractor-details")
      } else {
        router.push("/onboarding/customer-details")
      }
    } catch (e) {
      const message = getErrorMessage(e)
      const displayMessage = (message && message.trim()) || "Something went wrong."
      setError(displayMessage)
      Alert.alert("Error", displayMessage)
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
          title={isUpdating ? "Updating…" : "I’m looking for a trade (customer)"}
          variant="primary"
          onPress={() => chooseRole("customer")}
          disabled={isUpdating}
          fullWidth
          style={styles.button}
        />
        <Button
          title={isUpdating ? "Updating…" : "I’m a trade (contractor)"}
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
