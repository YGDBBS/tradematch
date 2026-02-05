import { useState, useEffect } from "react"
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useQuote, quotesQueryKey } from "@/hooks/useQuotes"
import { useQueryClient } from "@tanstack/react-query"
import { colors, semantic, spacing, borderRadius } from "@/constants/theme"

function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`
}

export default function QuoteDetailScreen() {
  const { id: jobId, quoteId } = useLocalSearchParams<{ id: string; quoteId: string }>()
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const { quote, loading, error, updateQuote, isUpdating, deleteQuote, isDeleting, sendQuote } =
    useQuote(quoteId, session?.access_token ?? undefined)

  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (quote) {
      setAmount(quote.amount.toString())
      setDescription(quote.description ?? "")
    }
  }, [quote])

  const handleSave = async () => {
    setSaveError(null)
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSaveError("Please enter a valid amount")
      return
    }
    try {
      await updateQuote({
        amount: parsedAmount,
        description: description.trim() || null,
      })
      setIsEditing(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const handleSend = async () => {
    Alert.alert("Send quote", "Mark this quote as sent?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: async () => {
          try {
            await sendQuote()
          } catch (_e) {
            // Error surfaced by hook
          }
        },
      },
    ])
  }

  const handleDelete = () => {
    Alert.alert("Delete quote", "Are you sure you want to delete this quote?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteQuote()
            // Invalidate the quotes list
            if (jobId) {
              queryClient.invalidateQueries({ queryKey: quotesQueryKey(jobId) })
            }
            router.back()
          } catch (_e) {
            // Error surfaced by hook
          }
        },
      },
    ])
  }

  const statusColor = quote
    ? {
        draft: semantic.textSecondary,
        sent: colors.accent,
        accepted: semantic.success,
        declined: semantic.error,
      }[quote.status]
    : semantic.textSecondary

  if (loading && !quote) {
    return (
      <Screen padded={false}>
        <Header title="Quote" onBack={() => router.back()} backLabel="Back" />
        <View style={styles.centered}>
          <Text variant="body">Loading…</Text>
        </View>
      </Screen>
    )
  }

  if (error || !quote) {
    return (
      <Screen padded={false}>
        <Header title="Quote" onBack={() => router.back()} backLabel="Back" />
        <View style={styles.content}>
          <Text variant="bodySmall" style={styles.error}>
            {error?.message ?? "Quote not found"}
          </Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen padded={false}>
      <Header title="Quote" onBack={() => router.back()} backLabel="Back" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status Badge */}
          <View style={styles.statusRow}>
            <Text variant="caption" style={[styles.statusBadge, { color: statusColor }]}>
              {quote.status.toUpperCase()}
            </Text>
            {quote.sent_at ? (
              <Text variant="caption" style={styles.sentDate}>
                Sent {new Date(quote.sent_at).toLocaleDateString()}
              </Text>
            ) : null}
          </View>

          {isEditing ? (
            <>
              {/* Edit Mode */}
              <Text variant="label" style={styles.label}>
                Amount (£)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={semantic.input.placeholder}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!isUpdating}
              />

              <Text variant="label" style={styles.label}>
                Description
              </Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Quote details, terms, etc."
                placeholderTextColor={semantic.input.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isUpdating}
              />

              {saveError ? (
                <Text variant="bodySmall" style={styles.error}>
                  {saveError}
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
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setAmount(quote.amount.toString())
                  setDescription(quote.description ?? "")
                  setIsEditing(false)
                }}
                disabled={isUpdating}
                fullWidth
                style={styles.button}
              />
            </>
          ) : (
            <>
              {/* View Mode */}
              <Text variant="title" style={styles.amount}>
                {formatCurrency(quote.amount)}
              </Text>

              {quote.description ? (
                <View style={styles.section}>
                  <Text variant="label">Description</Text>
                  <Text variant="body">{quote.description}</Text>
                </View>
              ) : null}

              {quote.valid_until ? (
                <View style={styles.section}>
                  <Text variant="label">Valid until</Text>
                  <Text variant="body">{new Date(quote.valid_until).toLocaleDateString()}</Text>
                </View>
              ) : null}

              {/* Actions */}
              {quote.status === "draft" ? (
                <>
                  <Button
                    title="Send quote"
                    variant="primary"
                    onPress={handleSend}
                    fullWidth
                    style={styles.button}
                  />
                  <Button
                    title="Edit"
                    variant="secondary"
                    onPress={() => setIsEditing(true)}
                    fullWidth
                    style={styles.button}
                  />
                </>
              ) : (
                <Button
                  title="Edit"
                  variant="secondary"
                  onPress={() => setIsEditing(true)}
                  fullWidth
                  style={styles.button}
                />
              )}

              <Button
                title={isDeleting ? "Deleting…" : "Delete quote"}
                variant="destructive"
                onPress={handleDelete}
                disabled={isDeleting}
                fullWidth
                style={styles.button}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: spacing.lg,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statusBadge: {
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  sentDate: {
    color: semantic.textSecondary,
  },
  amount: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
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
    fontSize: 16,
    color: semantic.input.text,
    backgroundColor: semantic.input.bg,
  },
  multiline: {
    height: 120,
    paddingTop: spacing.md,
  },
  error: {
    color: semantic.error,
    marginTop: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
})
