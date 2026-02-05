import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight, Users } from "lucide-react-native"
import { Screen, Text, Card, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useJobs } from "@/hooks/useJobs"
import { colors, spacing, borderRadius } from "@/constants/theme"
import type { Job } from "@/lib/types"

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: `${colors.textMuted}20`, text: colors.textMuted },
  quoted: { bg: `${colors.teal}20`, text: colors.teal },
  scheduled: { bg: `${colors.warning}20`, text: colors.warning },
  in_progress: { bg: `${colors.orange}20`, text: colors.orange },
  done: { bg: `${colors.success}20`, text: colors.success },
  cancelled: { bg: `${colors.textMuted}20`, text: colors.textMuted },
}

function StatusBadge({ status }: { status: string }) {
  const colorScheme = statusColors[status] || statusColors.draft
  return (
    <View style={[styles.badge, { backgroundColor: colorScheme.bg }]}>
      <Text variant="small" style={{ color: colorScheme.text }}>
        {status.replace("_", " ")}
      </Text>
    </View>
  )
}

function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.jobTitle}>
            {job.title}
          </Text>
          <StatusBadge status={job.status} />
        </View>
        {job.notes && (
          <Text variant="caption" color="muted" numberOfLines={2} style={styles.jobNotes}>
            {job.notes}
          </Text>
        )}
        <View style={styles.jobFooter}>
          {job.due_date && (
            <Text variant="small" color="muted">
              Due: {job.due_date}
            </Text>
          )}
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  )
}

export default function JobsListScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuth()
  const { jobs, loading, refreshing, error, refetch } = useJobs(session?.access_token ?? undefined)

  if (loading && !jobs?.length) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <Text variant="hero">Jobs</Text>
          <Pressable
            onPress={() => router.push("/jobs/customers")}
            style={({ pressed }) => [styles.customersButton, pressed && styles.pressed]}
            accessibilityLabel="View customers"
          >
            <Users size={22} color={colors.navy} />
          </Pressable>
        </View>
        <Button
          title="New job"
          variant="primary"
          onPress={() => router.push("/jobs/new")}
          fullWidth
          style={styles.newButton}
        />
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Text variant="body" color="error" style={styles.errorText}>
            {error.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={jobs ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={() => router.push(`/jobs/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.teal} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleSmall" align="center" style={styles.emptyTitle}>
                No jobs yet
              </Text>
              <Text variant="body" color="muted" align="center">
                Tap "New job" above to add your first job
              </Text>
            </View>
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
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  customersButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  newButton: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  jobCard: {
    marginBottom: spacing.sm,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  jobTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  jobNotes: {
    marginBottom: spacing.sm,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  errorBlock: {
    padding: spacing.lg,
    alignItems: "center",
  },
  errorText: {
    marginBottom: spacing.md,
  },
  emptyState: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
})
