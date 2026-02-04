import { useState } from "react"
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useJobs } from "@/hooks/useJobs"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export default function NewJobScreen() {
  const { session } = useAuth()
  const { createJob, isCreating } = useJobs(session?.access_token ?? undefined)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    const trimmed = title.trim()
    if (!trimmed) {
      setError("Enter a job title")
      return
    }
    try {
      await createJob({ title: trimmed, notes: notes.trim() || null })
      router.replace("/jobs")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <Screen padded={false}>
      <Header title="New job" onBack={() => router.back()} backLabel="Back" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="label" style={styles.label}>
            Job title
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kitchen tap repair"
            placeholderTextColor={semantic.input.placeholder}
            value={title}
            onChangeText={setTitle}
            editable={!isCreating}
          />
          <Text variant="label" style={styles.label}>
            Notes (optional)
          </Text>
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Any extra details"
            placeholderTextColor={semantic.input.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            editable={!isCreating}
          />
          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Button
            title={isCreating ? "Creating…" : "Create job"}
            variant="primary"
            onPress={handleCreate}
            disabled={isCreating}
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
  notes: {
    height: 80,
    paddingTop: spacing.sm,
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
