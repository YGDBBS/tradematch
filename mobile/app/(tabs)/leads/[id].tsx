import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { MapPin, Clock, Banknote, Calendar } from "lucide-react-native"
import { Screen, Text, Button, Header, Card } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useLead } from "@/hooks/useLeads"
import { colors, spacing, borderRadius } from "@/constants/theme"

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { lead, loading, error, respondToLead, isResponding } = useLead(
    id,
    session?.access_token ?? undefined
  )

  const handleAccept = async () => {
    try {
      await respondToLead({ status: "accepted" })
      router.back()
    } catch {
      // Error is handled by the hook
    }
  }

  const handleDecline = async () => {
    try {
      await respondToLead({ status: "declined" })
      router.back()
    } catch {
      // Error is handled by the hook
    }
  }

  if (loading) {
    return (
      <Screen>
        <Header title="Lead" onBack={() => router.back()} backLabel="Back" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  if (!lead || !lead.request) {
    return (
      <Screen>
        <Header title="Lead" onBack={() => router.back()} backLabel="Back" />
        <View style={styles.centered}>
          <Text variant="body" color="muted">
            Lead not found
          </Text>
        </View>
      </Screen>
    )
  }

  const request = lead.request
  const budgetText =
    request.budget_min && request.budget_max
      ? `£${request.budget_min} - £${request.budget_max}`
      : request.budget_max
        ? `Up to £${request.budget_max}`
        : "Not specified"

  const isPending = lead.status === "pending"
  const isAccepted = lead.status === "accepted"

  return (
    <Screen padded={false}>
      <Header title="Lead details" onBack={() => router.back()} backLabel="Back" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        {!isPending && (
          <View
            style={[
              styles.statusBanner,
              isAccepted ? styles.statusAccepted : styles.statusDeclined,
            ]}
          >
            <Text variant="bodyStrong" style={styles.statusText}>
              {isAccepted ? "You accepted this lead" : "You declined this lead"}
            </Text>
          </View>
        )}

        {/* Main Info Card */}
        <Card style={styles.mainCard}>
          <Text variant="title" style={styles.title}>
            {request.title}
          </Text>

          {request.trade && (
            <View style={styles.tradeTag}>
              <Text variant="bodySmall" color="accent">
                {request.trade}
              </Text>
            </View>
          )}

          {request.description && (
            <Text variant="body" color="muted" style={styles.description}>
              {request.description}
            </Text>
          )}
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text variant="label" style={styles.sectionTitle}>
            Job details
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MapPin size={20} color={colors.teal} />
            </View>
            <View style={styles.detailContent}>
              <Text variant="caption" color="muted">
                Location
              </Text>
              <Text variant="body">{request.postcode || "Not specified"}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock size={20} color={colors.teal} />
            </View>
            <View style={styles.detailContent}>
              <Text variant="caption" color="muted">
                Timeline
              </Text>
              <Text variant="body">{request.timeline || "Not specified"}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Banknote size={20} color={colors.teal} />
            </View>
            <View style={styles.detailContent}>
              <Text variant="caption" color="muted">
                Budget
              </Text>
              <Text variant="body">{budgetText}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color={colors.teal} />
            </View>
            <View style={styles.detailContent}>
              <Text variant="caption" color="muted">
                Posted
              </Text>
              <Text variant="body">{new Date(request.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        </Card>

        {error && (
          <Text variant="bodySmall" color="error" style={styles.error}>
            {error.message}
          </Text>
        )}

        {/* Action Buttons */}
        {isPending && (
          <View style={styles.actions}>
            <Button
              title={isResponding ? "Accepting…" : "Accept lead"}
              variant="primary"
              onPress={handleAccept}
              disabled={isResponding}
              fullWidth
              style={styles.acceptButton}
            />
            <Button
              title={isResponding ? "Declining…" : "Decline"}
              variant="secondary"
              onPress={handleDecline}
              disabled={isResponding}
              fullWidth
            />
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  statusBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  statusAccepted: {
    backgroundColor: `${colors.success}20`,
  },
  statusDeclined: {
    backgroundColor: `${colors.textMuted}20`,
  },
  statusText: {
    color: colors.navy,
  },
  mainCard: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  tradeTag: {
    alignSelf: "flex-start",
    backgroundColor: `${colors.teal}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  description: {
    marginTop: spacing.sm,
  },
  detailsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.teal}10`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  actions: {
    gap: spacing.sm,
  },
  acceptButton: {
    marginBottom: spacing.xs,
  },
})
