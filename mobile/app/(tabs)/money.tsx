import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PoundSterling, Clock, CheckCircle, AlertTriangle } from "lucide-react-native"
import { Screen, Text, Card, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useFinancials, type FinancialActivity } from "@/hooks/useFinancials"
import { colors, spacing, borderRadius } from "@/constants/theme"

function formatCurrency(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function SummaryCard({
  icon: Icon,
  iconColor,
  value,
  label,
}: {
  icon: typeof PoundSterling
  iconColor: string
  value: string
  label: string
}) {
  return (
    <Card style={styles.summaryCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Icon size={24} color={iconColor} strokeWidth={2} />
      </View>
      <Text variant="titleSmall" style={styles.summaryValue}>
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: FinancialActivity }) {
  const getActivityStyle = () => {
    switch (activity.type) {
      case "payment_received":
        return { dotColor: colors.success, amountColor: "success" as const, prefix: "+" }
      case "quote_accepted":
        return { dotColor: colors.teal, amountColor: "accent" as const, prefix: "" }
      case "quote_sent":
        return { dotColor: colors.warning, amountColor: undefined, prefix: "" }
      case "payment_overdue":
        return { dotColor: colors.error, amountColor: "error" as const, prefix: "" }
      default:
        return { dotColor: colors.textMuted, amountColor: undefined, prefix: "" }
    }
  }

  const style = getActivityStyle()

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityDot, { backgroundColor: style.dotColor }]} />
      <View style={styles.activityContent}>
        <Text variant="body">{activity.description}</Text>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {activity.jobTitle} · {formatDate(activity.date)}
        </Text>
      </View>
      <Text variant="bodyStrong" color={style.amountColor}>
        {style.prefix}
        {formatCurrency(activity.amount)}
      </Text>
    </View>
  )
}

export default function MoneyScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuth()
  const { summary, recentActivity, loading, refreshing, error, refetch } = useFinancials(
    session?.access_token ?? undefined
  )

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen>
        <View style={[styles.errorContainer, { paddingTop: insets.top + spacing.md }]}>
          <Text variant="body" color="error" style={styles.errorText}>
            {error.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} />
        </View>
      </Screen>
    )
  }

  const hasNoData =
    summary.totalOwed === 0 &&
    summary.pendingQuotes === 0 &&
    summary.paidThisMonth === 0 &&
    summary.overdueAmount === 0

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.teal} />
        }
      >
        <Text variant="hero" style={styles.title}>
          Money
        </Text>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            icon={PoundSterling}
            iconColor={colors.teal}
            value={formatCurrency(summary.totalOwed)}
            label="Owed to you"
          />
          <SummaryCard
            icon={Clock}
            iconColor={colors.warning}
            value={formatCurrency(summary.pendingQuotes)}
            label="Pending quotes"
          />
          <SummaryCard
            icon={CheckCircle}
            iconColor={colors.success}
            value={formatCurrency(summary.paidThisMonth)}
            label="Paid this month"
          />
          <SummaryCard
            icon={AlertTriangle}
            iconColor={colors.error}
            value={formatCurrency(summary.overdueAmount)}
            label="Expired quotes"
          />
        </View>

        {/* Empty State */}
        {hasNoData && (
          <Card style={styles.emptyCard}>
            <Text variant="titleSmall" align="center" style={styles.emptyTitle}>
              No financial activity yet
            </Text>
            <Text variant="body" color="muted" align="center">
              Create quotes for your jobs to start tracking money
            </Text>
          </Card>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Recent activity
            </Text>
            <Card style={styles.activityCard}>
              {recentActivity.map((activity, index) => (
                <View key={activity.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <ActivityItem activity={activity} />
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Coming Soon Notice */}
        <Card style={styles.comingSoonCard}>
          <Text variant="bodySmall" color="muted" align="center">
            Full payment tracking, invoicing, and Stripe integration coming soon
          </Text>
        </Card>
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
  errorContainer: {
    padding: spacing.lg,
  },
  errorText: {
    marginBottom: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.lg,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: "48%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  summaryValue: {
    marginBottom: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  activityCard: {
    padding: 0,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  emptyCard: {
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  comingSoonCard: {
    backgroundColor: colors.background,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
})
