import { useState } from "react"
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useRequests } from "@/hooks/useRequests"
import { semantic, spacing, borderRadius } from "@/constants/theme"

const TIMELINE_OPTIONS = ["ASAP", "This week", "This month", "Flexible"]

export default function NewRequestScreen() {
  const { session } = useAuth()
  const { createRequest, isCreating } = useRequests(session?.access_token ?? undefined)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [trade, setTrade] = useState("")
  const [postcode, setPostcode] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [timeline, setTimeline] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError("Enter a title for your job")
      return
    }
    try {
      await createRequest({
        title: trimmedTitle,
        description: description.trim() || null,
        trade: trade.trim() || null,
        postcode: postcode.trim() || null,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        timeline: timeline,
        status: "open",
      })
      router.replace("/requests")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <Screen padded={false}>
      <Header title="Post a job" onBack={() => router.back()} backLabel="Back" />
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
          <Text variant="label" style={styles.label}>
            What do you need done?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fix leaking tap in bathroom"
            placeholderTextColor={semantic.input.placeholder}
            value={title}
            onChangeText={setTitle}
            editable={!isCreating}
          />

          <Text variant="label" style={styles.label}>
            Description (optional)
          </Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Tell tradespeople more about the job..."
            placeholderTextColor={semantic.input.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!isCreating}
          />

          <Text variant="label" style={styles.label}>
            Trade required (optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Plumber, Electrician"
            placeholderTextColor={semantic.input.placeholder}
            value={trade}
            onChangeText={setTrade}
            editable={!isCreating}
          />

          <Text variant="label" style={styles.label}>
            Your postcode (optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. SW1A 1AA"
            placeholderTextColor={semantic.input.placeholder}
            value={postcode}
            onChangeText={setPostcode}
            autoCapitalize="characters"
            editable={!isCreating}
          />

          <Text variant="label" style={styles.label}>
            Budget (optional)
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
                editable={!isCreating}
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
                editable={!isCreating}
              />
            </View>
          </View>

          <Text variant="label" style={styles.label}>
            When do you need this done? (optional)
          </Text>
          <View style={styles.timelineRow}>
            {TIMELINE_OPTIONS.map((option) => (
              <Button
                key={option}
                title={option}
                variant={timeline === option ? "primary" : "secondary"}
                onPress={() => setTimeline(timeline === option ? null : option)}
                style={styles.timelineBtn}
              />
            ))}
          </View>

          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            title={isCreating ? "Posting…" : "Post job"}
            variant="primary"
            onPress={handleCreate}
            disabled={isCreating}
            fullWidth
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
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
    marginTop: spacing.lg,
  },
})
