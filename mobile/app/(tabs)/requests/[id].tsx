import { useState, useEffect } from "react"
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useRequest } from "@/hooks/useRequests"
import { semantic, spacing, borderRadius, colors } from "@/constants/theme"
import type { RequestStatus } from "@/lib/types"

const TIMELINE_OPTIONS = ["ASAP", "This week", "This month", "Flexible"]

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { request, loading, updateRequest, isUpdating, deleteRequest, isDeleting } = useRequest(
    id,
    session?.access_token ?? undefined
  )

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [trade, setTrade] = useState("")
  const [postcode, setPostcode] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [timeline, setTimeline] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (request) {
      setTitle(request.title)
      setDescription(request.description ?? "")
      setTrade(request.trade ?? "")
      setPostcode(request.postcode ?? "")
      setBudgetMin(request.budget_min?.toString() ?? "")
      setBudgetMax(request.budget_max?.toString() ?? "")
      setTimeline(request.timeline)
    }
  }, [request])

  const canEdit = request?.status === "draft" || request?.status === "open"

  const handleSave = async () => {
    setError(null)
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError("Enter a title for your job")
      return
    }
    try {
      await updateRequest({
        title: trimmedTitle,
        description: description.trim() || null,
        trade: trade.trim() || null,
        postcode: postcode.trim() || null,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        timeline: timeline,
      })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const handleDelete = () => {
    Alert.alert("Delete request", "Are you sure you want to delete this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRequest()
            router.replace("/requests")
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete")
          }
        },
      },
    ])
  }

  const handleCancel = async () => {
    Alert.alert("Cancel request", "Are you sure you want to cancel this request?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await updateRequest({ status: "cancelled" as RequestStatus })
            router.back()
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to cancel")
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen>
        <Header title="Request" onBack={() => router.back()} backLabel="Back" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  if (!request) {
    return (
      <Screen>
        <Header title="Request" onBack={() => router.back()} backLabel="Back" />
        <View style={styles.centered}>
          <Text variant="body" color="muted">
            Request not found
          </Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen padded={false}>
      <Header
        title={canEdit ? "Edit request" : "Request details"}
        onBack={() => router.back()}
        backLabel="Back"
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.statusRow}>
            <Text variant="label">Status:</Text>
            <Text variant="body" style={styles.statusText}>
              {request.status.replace("_", " ")}
            </Text>
          </View>

          <Text variant="label" style={styles.label}>
            What do you need done?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fix leaking tap in bathroom"
            placeholderTextColor={semantic.input.placeholder}
            value={title}
            onChangeText={setTitle}
            editable={canEdit && !isUpdating}
          />

          <Text variant="label" style={styles.label}>
            Description
          </Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Tell tradespeople more about the job..."
            placeholderTextColor={semantic.input.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={canEdit && !isUpdating}
          />

          <Text variant="label" style={styles.label}>
            Trade required
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Plumber, Electrician"
            placeholderTextColor={semantic.input.placeholder}
            value={trade}
            onChangeText={setTrade}
            editable={canEdit && !isUpdating}
          />

          <Text variant="label" style={styles.label}>
            Your postcode
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. SW1A 1AA"
            placeholderTextColor={semantic.input.placeholder}
            value={postcode}
            onChangeText={setPostcode}
            autoCapitalize="characters"
            editable={canEdit && !isUpdating}
          />

          <Text variant="label" style={styles.label}>
            Budget
          </Text>
          <View style={styles.budgetRow}>
            <View style={styles.budgetField}>
              <Text variant="small" color="muted" style={styles.budgetLabel}>
                Min
              </Text>
              <TextInput
                style={styles.budgetInput}
                placeholder="£"
                placeholderTextColor={semantic.input.placeholder}
                value={budgetMin}
                onChangeText={setBudgetMin}
                keyboardType="numeric"
                editable={canEdit && !isUpdating}
              />
            </View>
            <Text variant="body" color="muted" style={styles.budgetDash}>
              –
            </Text>
            <View style={styles.budgetField}>
              <Text variant="small" color="muted" style={styles.budgetLabel}>
                Max
              </Text>
              <TextInput
                style={styles.budgetInput}
                placeholder="£"
                placeholderTextColor={semantic.input.placeholder}
                value={budgetMax}
                onChangeText={setBudgetMax}
                keyboardType="numeric"
                editable={canEdit && !isUpdating}
              />
            </View>
          </View>

          <Text variant="label" style={styles.label}>
            Timeline
          </Text>
          <View style={styles.timelineRow}>
            {TIMELINE_OPTIONS.map((option) => (
              <Button
                key={option}
                title={option}
                variant={timeline === option ? "primary" : "secondary"}
                onPress={() => canEdit && setTimeline(timeline === option ? null : option)}
                style={styles.timelineBtn}
                disabled={!canEdit}
              />
            ))}
          </View>

          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}

          {canEdit && (
            <Button
              title={isUpdating ? "Saving…" : "Save changes"}
              variant="primary"
              onPress={handleSave}
              disabled={isUpdating}
              fullWidth
              style={styles.button}
            />
          )}

          {request.status === "open" && (
            <Button
              title="Cancel request"
              variant="secondary"
              onPress={handleCancel}
              disabled={isUpdating}
              fullWidth
              style={styles.button}
            />
          )}

          {(request.status === "draft" || request.status === "cancelled") && (
            <Button
              title={isDeleting ? "Deleting…" : "Delete request"}
              variant="destructive"
              onPress={handleDelete}
              disabled={isDeleting}
              fullWidth
              style={styles.button}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusText: {
    textTransform: "capitalize",
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
    marginBottom: spacing.sm,
    fontSize: 16,
    color: semantic.input.text,
    backgroundColor: semantic.input.bg,
  },
  multiline: {
    height: 100,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  budgetField: {
    flex: 1,
  },
  budgetLabel: {
    marginBottom: spacing.xs,
  },
  budgetInput: {
    height: 48,
    borderWidth: 1,
    borderColor: semantic.input.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: semantic.input.text,
    backgroundColor: semantic.input.bg,
  },
  budgetDash: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  timelineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timelineBtn: {
    minWidth: 80,
  },
  error: {
    color: semantic.error,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
})
