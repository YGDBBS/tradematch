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
import { ChevronRight } from "lucide-react-native"
import { Screen, Text, Card, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useRequests } from "@/hooks/useRequests"
import { colors, spacing, borderRadius } from "@/constants/theme"
import type { Request } from "@/lib/types"

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: `${colors.textMuted}20`, text: colors.textMuted },
  open: { bg: `${colors.teal}20`, text: colors.teal },
  assigned: { bg: `${colors.warning}20`, text: colors.warning },
  in_progress: { bg: `${colors.orange}20`, text: colors.orange },
  completed: { bg: `${colors.success}20`, text: colors.success },
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

function RequestCard({ request, onPress }: { request: Request; onPress: () => void }) {
  const budgetText =
    request.budget_min && request.budget_max
      ? `£${request.budget_min} - £${request.budget_max}`
      : request.budget_max
        ? `Up to £${request.budget_max}`
        : null

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.requestTitle}>
            {request.title}
          </Text>
          <StatusBadge status={request.status} />
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
        <View style={styles.requestFooter}>
          <View style={styles.footerInfo}>
            {budgetText && (
              <Text variant="small" color="muted">
                {budgetText}
              </Text>
            )}
            {request.timeline && (
              <Text variant="small" color="muted">
                {request.timeline}
              </Text>
            )}
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  )
}

export default function RequestsListScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuth()
  const { requests, loading, refreshing, error, refetch } = useRequests(
    session?.access_token ?? undefined
  )

  if (loading && !requests?.length) {
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
        <Text variant="hero">My requests</Text>
        <Button
          title="Post a job"
          variant="primary"
          onPress={() => router.push("/requests/new")}
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
          data={requests ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard request={item} onPress={() => router.push(`/requests/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.teal} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleSmall" align="center" style={styles.emptyTitle}>
                No requests yet
              </Text>
              <Text variant="body" color="muted" align="center">
                Post a job to find local tradespeople
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
  newButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  requestCard: {
    marginBottom: spacing.sm,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  requestTitle: {
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
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    flexDirection: "row",
    gap: spacing.md,
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
