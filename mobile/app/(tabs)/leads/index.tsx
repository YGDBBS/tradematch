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
import { ChevronRight, MapPin, Clock, Banknote } from "lucide-react-native"
import { Screen, Text, Card } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useLeads } from "@/hooks/useLeads"
import { colors, spacing, borderRadius } from "@/constants/theme"
import type { RequestMatchWithRequest } from "@/lib/types"

const matchStatusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: `${colors.warning}20`, text: colors.warning },
  accepted: { bg: `${colors.success}20`, text: colors.success },
  declined: { bg: `${colors.textMuted}20`, text: colors.textMuted },
}

function MatchStatusBadge({ status }: { status: string }) {
  const colorScheme = matchStatusColors[status] || matchStatusColors.pending
  return (
    <View style={[styles.badge, { backgroundColor: colorScheme.bg }]}>
      <Text variant="small" style={{ color: colorScheme.text }}>
        {status}
      </Text>
    </View>
  )
}

function LeadCard({ lead, onPress }: { lead: RequestMatchWithRequest; onPress: () => void }) {
  const request = lead.request
  const budgetText =
    request.budget_min && request.budget_max
      ? `£${request.budget_min} - £${request.budget_max}`
      : request.budget_max
        ? `Up to £${request.budget_max}`
        : null

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.leadCard}>
        <View style={styles.leadHeader}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.leadTitle}>
            {request.title}
          </Text>
          <MatchStatusBadge status={lead.status} />
        </View>

        {request.trade && (
          <Text variant="caption" color="accent" style={styles.trade}>
            {request.trade}
          </Text>
        )}

        {request.description && (
          <Text variant="caption" color="muted" numberOfLines={2} style={styles.description}>
            {request.description}
          </Text>
        )}

        <View style={styles.leadDetails}>
          {request.postcode && (
            <View style={styles.detailItem}>
              <MapPin size={14} color={colors.textMuted} />
              <Text variant="small" color="muted">
                {request.postcode}
              </Text>
            </View>
          )}
          {request.timeline && (
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textMuted} />
              <Text variant="small" color="muted">
                {request.timeline}
              </Text>
            </View>
          )}
          {budgetText && (
            <View style={styles.detailItem}>
              <Banknote size={14} color={colors.textMuted} />
              <Text variant="small" color="muted">
                {budgetText}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.leadFooter}>
          <Text variant="small" color="muted">
            {new Date(lead.created_at).toLocaleDateString()}
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  )
}

export default function LeadsListScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuth()
  const { leads, loading, refreshing, error, refetch } = useLeads(
    session?.access_token ?? undefined
  )

  if (loading && !leads?.length) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  // Filter to show pending leads first, then others
  const sortedLeads = [...(leads || [])].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1
    if (a.status !== "pending" && b.status === "pending") return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const pendingCount = leads?.filter((l) => l.status === "pending").length || 0

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text variant="hero">Leads</Text>
        {pendingCount > 0 && (
          <Text variant="body" color="accent">
            {pendingCount} new {pendingCount === 1 ? "lead" : "leads"}
          </Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Text variant="body" color="error" style={styles.errorText}>
            {error.message}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedLeads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeadCard lead={item} onPress={() => router.push(`/leads/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.teal} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleSmall" align="center" style={styles.emptyTitle}>
                No leads yet
              </Text>
              <Text variant="body" color="muted" align="center">
                When customers post jobs matching your trade, they'll appear here
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  leadCard: {
    marginBottom: spacing.sm,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  leadTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  trade: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.sm,
  },
  leadDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  leadFooter: {
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
