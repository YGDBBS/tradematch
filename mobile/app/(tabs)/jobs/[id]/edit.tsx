import { useState, useEffect } from "react"
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useJob } from "@/hooks/useJobs"
import { semantic, spacing, borderRadius } from "@/constants/theme"
import type { JobStatus } from "@/lib/types"

const STATUSES: JobStatus[] = ["draft", "quoted", "scheduled", "in_progress", "done", "cancelled"]

export default function EditJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { job, updateJob, isUpdating } = useJob(id, session?.access_token ?? undefined)
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<JobStatus>("draft")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (job) {
      setTitle(job.title)
      setStatus(job.status)
      setDueDate(job.due_date ?? "")
      setNotes(job.notes ?? "")
    }
  }, [job])

  const handleSave = async () => {
    setError(null)
    const trimmed = title.trim()
    if (!trimmed) {
      setError("Enter a job title")
      return
    }
    try {
      await updateJob({
        title: trimmed,
        status,
        due_date: dueDate.trim() || null,
        notes: notes.trim() || null,
      })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  if (!job) return null

  return (
    <Screen padded={false}>
      <Header title="Edit job" onBack={() => router.back()} backLabel="Back" />
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
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Status
          </Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <Button
                key={s}
                title={s.replace("_", " ")}
                variant={status === s ? "primary" : "secondary"}
                onPress={() => setStatus(s)}
                style={styles.statusBtn}
              />
            ))}
          </View>
          <Text variant="label" style={styles.label}>
            Due date (optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={semantic.input.placeholder}
            value={dueDate}
            onChangeText={setDueDate}
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Notes
          </Text>
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Any extra details"
            placeholderTextColor={semantic.input.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
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
  notes: {
    height: 80,
    paddingTop: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusBtn: {
    minWidth: 80,
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
