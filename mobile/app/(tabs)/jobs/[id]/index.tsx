import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Screen, Text, Button, Header, Card } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useJob } from "@/hooks/useJobs"
import { useQuotes } from "@/hooks/useQuotes"
import { colors, semantic, spacing } from "@/constants/theme"
import type { Quote } from "@/lib/types"

function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`
}

function QuoteRow({ quote, onPress }: { quote: Quote; onPress: () => void }) {
  const statusColors: Record<string, string> = {
    draft: semantic.textSecondary,
    sent: colors.accent,
    accepted: semantic.success,
    declined: semantic.error,
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.quoteCard}>
        <View style={styles.quoteHeader}>
          <Text variant="body" style={styles.quoteAmount}>
            {formatCurrency(quote.amount)}
          </Text>
          <Text
            variant="caption"
            style={[
              styles.quoteStatus,
              { color: statusColors[quote.status] || semantic.textSecondary },
            ]}
          >
            {quote.status.toUpperCase()}
          </Text>
        </View>
        {quote.description ? (
          <Text variant="bodySmall" style={styles.quoteDescription} numberOfLines={2}>
            {quote.description}
          </Text>
        ) : null}
      </Card>
    </TouchableOpacity>
  )
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const accessToken = session?.access_token ?? undefined
  const { job, loading, error, refetch, deleteJob, isDeleting } = useJob(id, accessToken)
  const { quotes, loading: quotesLoading } = useQuotes(id, accessToken)

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
        <Header title="Job" onBack={() => router.back()} backLabel="Jobs" />
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Job Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text variant="label">Status</Text>
            <Text variant="body" style={styles.capitalize}>
              {job.status.replace("_", " ")}
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
        </View>

        {/* Quotes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleSmall">Quotes</Text>
            <Button
              title="+ New"
              variant="ghost"
              onPress={() => router.push(`/jobs/${job.id}/quotes/new`)}
            />
          </View>
          {quotesLoading ? (
            <ActivityIndicator size="small" color={semantic.loading} />
          ) : quotes && quotes.length > 0 ? (
            quotes.map((quote) => (
              <QuoteRow
                key={quote.id}
                quote={quote}
                onPress={() => router.push(`/jobs/${job.id}/quotes/${quote.id}`)}
              />
            ))
          ) : (
            <Text variant="bodySmall" style={styles.emptyText}>
              No quotes yet
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Edit job"
            variant="secondary"
            onPress={() => router.push(`/jobs/${job.id}/edit`)}
            fullWidth
            style={styles.button}
          />
          <Button
            title={isDeleting ? "Deleting…" : "Delete job"}
            variant="destructive"
            onPress={handleDelete}
            disabled={isDeleting}
            fullWidth
            style={styles.button}
          />
        </View>
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
    paddingBottom: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
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
    marginTop: spacing.sm,
  },
  quoteCard: {
    marginBottom: spacing.sm,
  },
  quoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteAmount: {
    fontWeight: "600",
  },
  quoteStatus: {
    fontWeight: "500",
  },
  quoteDescription: {
    marginTop: spacing.xs,
    color: semantic.textSecondary,
  },
  emptyText: {
    color: semantic.textSecondary,
    fontStyle: "italic",
  },
})
