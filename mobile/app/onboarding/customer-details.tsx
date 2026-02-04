import { useState } from "react"
import { StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export default function OnboardingCustomerDetailsScreen() {
  const { session } = useAuth()
  const { profile, updateProfile, isUpdating } = useProfile(session?.access_token ?? undefined)
  const [postcode, setPostcode] = useState(profile?.postcode ?? "")
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    setError(null)
    try {
      await updateProfile({ postcode: postcode.trim() || null })
      router.replace("/onboarding/hello")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <Text variant="title" style={styles.title}>
          Where are you based?
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          We’ll use this to find tradespeople near you. You can skip and add it later.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Postcode"
          placeholderTextColor={semantic.input.placeholder}
          value={postcode}
          onChangeText={setPostcode}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isUpdating}
        />
        {error ? (
          <Text variant="bodySmall" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Button
          title="Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={isUpdating}
          fullWidth
          style={styles.button}
        />
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: semantic.input.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: semantic.input.text,
    backgroundColor: semantic.input.bg,
  },
  error: {
    color: semantic.error,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
})
