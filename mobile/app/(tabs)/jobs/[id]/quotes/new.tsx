import { useState } from "react"
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useQuotes } from "@/hooks/useQuotes"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export default function NewQuoteScreen() {
  const { id: jobId } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { createQuote, isCreating } = useQuotes(jobId, session?.access_token ?? undefined)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    try {
      await createQuote({
        amount: parsedAmount,
        description: description.trim() || null,
      })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <Screen padded={false}>
      <Header title="New quote" onBack={() => router.back()} backLabel="Back" />
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
            Amount (£)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={semantic.input.placeholder}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!isCreating}
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
            editable={!isCreating}
          />

          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            title={isCreating ? "Creating…" : "Create quote"}
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
    marginTop: spacing.lg,
  },
})
