import { View, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useJob } from "@/hooks/useJobs"
import { semantic, spacing } from "@/constants/theme"

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { job, loading, error, refetch, deleteJob, isDeleting } = useJob(
    id,
    session?.access_token ?? undefined
  )

  const handleDelete = () => {
    Alert.alert("Delete job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteJob()
            router.replace("/jobs")
          } catch (_e) {
            // Error surfaced by hook
          }
        },
      },
    ])
  }

  if (loading && !job) {
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

  if (!job) return null

  return (
    <Screen>
      <Header title={job.title} onBack={() => router.back()} backLabel="Jobs" />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text variant="label">Status</Text>
          <Text variant="body" style={styles.capitalize}>
            {job.status}
          </Text>
        </View>
        {job.due_date ? (
          <View style={styles.row}>
            <Text variant="label">Due date</Text>
            <Text variant="body">{job.due_date}</Text>
          </View>
        ) : null}
        {job.notes ? (
          <View style={styles.row}>
            <Text variant="label">Notes</Text>
            <Text variant="body">{job.notes}</Text>
          </View>
        ) : null}
        <Button
          title="Edit job"
          variant="secondary"
          onPress={() => router.push(`/jobs/${job.id}/edit`)}
          style={styles.button}
        />
        <Button
          title={isDeleting ? "Deleting…" : "Delete job"}
          variant="destructive"
          onPress={handleDelete}
          disabled={isDeleting}
          style={styles.button}
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
    padding: spacing.lg,
  },
  row: {
    marginBottom: spacing.md,
  },
  capitalize: {
    textTransform: "capitalize",
  },
  error: {
    color: semantic.error,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
})
