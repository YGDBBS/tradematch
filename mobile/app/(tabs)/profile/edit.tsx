import { useState, useEffect } from "react"
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { validatePostcode, normalizePostcode } from "@/lib/validation"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export default function EditProfileScreen() {
  const { session } = useAuth()
  const { profile, updateProfile, isUpdating } = useProfile(session?.access_token ?? undefined)
  const [displayName, setDisplayName] = useState("")
  const [postcode, setPostcode] = useState("")
  const [trade, setTrade] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "")
      setPostcode(profile.postcode ?? "")
      setTrade(profile.trade ?? "")
    }
  }, [profile])

  const handleSave = async () => {
    setError(null)
    const postcodeError = validatePostcode(postcode)
    if (postcodeError) {
      setError(postcodeError)
      return
    }
    try {
      await updateProfile({
        display_name: displayName.trim() || null,
        postcode: postcode.trim() ? normalizePostcode(postcode) : null,
        trade: trade.trim() || null,
      })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  if (!profile) return null

  return (
    <Screen padded={false}>
      <Header title="Edit profile" onBack={() => router.back()} backLabel="Back" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="label" style={styles.label}>
            Display name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Your name or company name"
            placeholderTextColor={semantic.input.placeholder}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Postcode
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. SW1A 1AA"
            placeholderTextColor={semantic.input.placeholder}
            value={postcode}
            onChangeText={setPostcode}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Trade / services
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Plumber, Electrician"
            placeholderTextColor={semantic.input.placeholder}
            value={trade}
            onChangeText={setTrade}
            editable={!isUpdating}
          />
          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Button
            title={isUpdating ? "Saving…" : "Save"}
            variant="primary"
            onPress={handleSave}
            disabled={isUpdating}
            fullWidth
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: semantic.input.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 16,
    color: semantic.input.text,
    backgroundColor: semantic.input.bg,
  },
  error: {
    color: semantic.error,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
})
