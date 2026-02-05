import { useState } from "react"
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Calendar, AlertTriangle, ChevronRight, List } from "lucide-react-native"
import { Screen, Text, Button, Card, WeekCalendar } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { useJobs } from "@/hooks/useJobs"
import { useFinancials } from "@/hooks/useFinancials"
import { colors, spacing, borderRadius, shadows } from "@/constants/theme"
import type { Job } from "@/lib/types"

type ViewMode = "today" | "week"

function StatCard({
  value,
  label,
  color = colors.navy,
  onPress,
}: {
  value: string
  label: string
  color?: string
  onPress?: () => void
}) {
  const content = (
    <View style={styles.statCard}>
      <Text variant="hero" style={{ color }}>
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    )
  }

  return content
}

function formatJobTime(scheduledAt: string): string {
  const date = new Date(scheduledAt)
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function TodayJobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const time = job.scheduled_at ? formatJobTime(job.scheduled_at) : "—"

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.todayJob, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={styles.todayJobTime}>
        <Text variant="label">{time}</Text>
      </View>
      <View style={styles.todayJobContent}>
        <Text variant="body" numberOfLines={1}>
          {job.title}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {job.notes || "No notes"}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </Pressable>
  )
}

function AttentionItem({
  message,
  type = "warning",
  onPress,
}: {
  message: string
  type?: "warning" | "overdue"
  onPress?: () => void
}) {
  const iconColor = type === "overdue" ? colors.error : colors.warning

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.attentionItem, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <AlertTriangle size={18} color={iconColor} strokeWidth={2} />
      <Text variant="bodySmall" style={styles.attentionText} numberOfLines={2}>
        {message}
      </Text>
    </Pressable>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Morning"
  if (hour < 17) return "Afternoon"
  return "Evening"
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("today")

  const {
    profile,
    loading: profileLoading,
    refreshing: profileRefreshing,
    refetch: refetchProfile,
  } = useProfile(session?.access_token ?? undefined)
  const {
    jobs,
    loading: jobsLoading,
    refreshing: jobsRefreshing,
    refetch: refetchJobs,
  } = useJobs(session?.access_token ?? undefined)
  const {
    summary: financialSummary,
    refreshing: financialsRefreshing,
    refetch: refetchFinancials,
  } = useFinancials(session?.access_token ?? undefined)

  const refreshing = profileRefreshing || jobsRefreshing || financialsRefreshing
  const handleRefresh = () => {
    refetchProfile()
    refetchJobs()
    refetchFinancials()
  }

  if ((profileLoading && !profile) || (jobsLoading && !jobs)) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  const firstName = profile?.display_name?.split(" ")[0] || "there"
  const greeting = `${getGreeting()}, ${firstName}`

  // Calculate stats from jobs
  const activeJobs =
    jobs?.filter((j) => j.status === "in_progress" || j.status === "scheduled") || []
  const jobsThisWeek = activeJobs.length

  // Real financial data from quotes
  const moneyOwed = financialSummary.totalOwed
  const hasOverdueQuotes = financialSummary.overdueAmount > 0

  // Today's jobs - filter by scheduled_at matching today
  const today = new Date()
  const todaysJobs = (jobs || [])
    .filter((j) => j.scheduled_at && isSameDay(new Date(j.scheduled_at), today))
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())

  // Attention items from real data
  const attentionItems = [
    ...(hasOverdueQuotes
      ? [
          {
            id: "quote",
            message: `Expired quotes worth £${financialSummary.overdueAmount.toLocaleString()}`,
            type: "warning" as const,
          },
        ]
      : []),
  ]

  const handleJobPress = (job: Job) => {
    router.push(`/jobs/${job.id}`)
  }

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Header with Greeting and View Toggle */}
        <View style={styles.header}>
          <Text variant="hero">{greeting}</Text>
          <View style={styles.viewToggle}>
            <Pressable
              onPress={() => setViewMode("today")}
              style={[styles.toggleButton, viewMode === "today" && styles.toggleButtonActive]}
            >
              <List size={18} color={viewMode === "today" ? colors.white : colors.navy} />
            </Pressable>
            <Pressable
              onPress={() => setViewMode("week")}
              style={[styles.toggleButton, viewMode === "week" && styles.toggleButtonActive]}
            >
              <Calendar size={18} color={viewMode === "week" ? colors.white : colors.navy} />
            </Pressable>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            value={`£${moneyOwed.toLocaleString()}`}
            label="owed to you"
            color={colors.teal}
            onPress={() => router.push("/money")}
          />
          <View style={styles.statsDivider} />
          <StatCard
            value={String(jobsThisWeek)}
            label={jobsThisWeek === 1 ? "active job" : "active jobs"}
            onPress={() => router.push("/jobs")}
          />
        </View>

        {viewMode === "today" ? (
          <>
            {/* Today Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={colors.navy} strokeWidth={2} />
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Today
                </Text>
                {todaysJobs.length > 0 && (
                  <Text variant="caption" color="muted" style={styles.jobCount}>
                    {todaysJobs.length} {todaysJobs.length === 1 ? "job" : "jobs"}
                  </Text>
                )}
              </View>

              {todaysJobs.length > 0 ? (
                <Card style={styles.todayCard}>
                  {todaysJobs.map((job, index) => (
                    <View key={job.id}>
                      {index > 0 && <View style={styles.jobDivider} />}
                      <TodayJobCard job={job} onPress={() => handleJobPress(job)} />
                    </View>
                  ))}
                </Card>
              ) : (
                <Card style={styles.emptyCard}>
                  <Text variant="body" color="muted" align="center">
                    No jobs scheduled for today
                  </Text>
                  <Button
                    title="Add a job"
                    variant="ghost"
                    onPress={() => router.push("/jobs/new")}
                    style={styles.emptyButton}
                  />
                </Card>
              )}
            </View>

            {/* Needs Attention Section */}
            {attentionItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AlertTriangle size={20} color={colors.warning} strokeWidth={2} />
                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    Needs attention
                  </Text>
                </View>

                <Card style={styles.attentionCard}>
                  {attentionItems.map((item, index) => (
                    <View key={item.id}>
                      {index > 0 && <View style={styles.jobDivider} />}
                      <AttentionItem
                        message={item.message}
                        type={item.type}
                        onPress={() => router.push("/money")}
                      />
                    </View>
                  ))}
                </Card>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Button
                title="View all jobs"
                variant="secondary"
                onPress={() => router.push("/jobs")}
                style={styles.quickActionButton}
              />
              <Button
                title="New job"
                variant="primary"
                onPress={() => router.push("/jobs/new")}
                style={styles.quickActionButton}
              />
            </View>
          </>
        ) : (
          /* Week Calendar View */
          <View style={styles.calendarContainer}>
            <WeekCalendar jobs={jobs || []} onJobPress={handleJobPress} />
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.teal,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statsDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  jobCount: {
    marginLeft: spacing.sm,
  },
  todayCard: {
    padding: 0,
    overflow: "hidden",
  },
  todayJob: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  todayJobTime: {
    width: 60,
  },
  todayJobContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  jobDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
  attentionCard: {
    padding: 0,
    overflow: "hidden",
  },
  attentionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  attentionText: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.navy,
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1,
    minHeight: 400,
  },
})
