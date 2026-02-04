import { View, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { semantic, spacing } from "@/constants/theme"
import type { Job } from "@/lib/types"
import { useJobs } from "@/hooks/useJobs"

function JobRow({ job }: { job: Job }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/jobs/${job.id}`)}
      activeOpacity={0.7}
    >
      <Text variant="body" numberOfLines={1} style={styles.rowTitle}>
        {job.title}
      </Text>
      <Text variant="bodySmall" style={styles.rowStatus}>
        {job.status}
      </Text>
    </TouchableOpacity>
  )
}

export default function JobsListScreen() {
  const { session } = useAuth()
  const { jobs, loading, error, refetch } = useJobs(session?.access_token ?? undefined)

  if (loading && !jobs?.length) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={semantic.loading} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title" style={styles.title}>
          Jobs
        </Text>
        <Button
          title="New job"
          variant="primary"
          onPress={() => router.push("/jobs/new")}
          style={styles.newButton}
        />
        <Button
          title="Customers"
          variant="secondary"
          onPress={() => router.push("/jobs/customers")}
          style={styles.customersButton}
        />
      </View>
      {error ? (
        <View style={styles.errorBlock}>
          <Text variant="bodySmall" style={styles.error}>
            {error.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} fullWidth />
        </View>
      ) : (
        <FlatList
          data={jobs ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JobRow job={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text variant="body" style={styles.empty}>
              No jobs yet. Tap "New job" to add one.
            </Text>
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
  newButton: {
    marginBottom: spacing.sm,
  },
  customersButton: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: semantic.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semantic.border,
  },
  rowTitle: {
    marginBottom: spacing.xs,
  },
  rowStatus: {
    color: semantic.textSecondary,
    textTransform: "capitalize",
  },
  errorBlock: {
    padding: spacing.lg,
  },
  error: {
    color: semantic.error,
    marginBottom: spacing.md,
  },
  empty: {
    color: semantic.textSecondary,
    marginTop: spacing.lg,
  },
})
