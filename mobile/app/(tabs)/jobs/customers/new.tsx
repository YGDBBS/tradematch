import { useState } from "react"
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useCustomers } from "@/hooks/useCustomers"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export default function NewCustomerScreen() {
  const { session } = useAuth()
  const { createCustomer, isCreating } = useCustomers(session?.access_token ?? undefined)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [postcode, setPostcode] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Enter a name")
      return
    }
    try {
      await createCustomer({
        name: trimmed,
        email: email.trim() || null,
        phone: phone.trim() || null,
        postcode: postcode.trim() || null,
        notes: notes.trim() || null,
      })
      router.replace("/jobs/customers")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <Screen padded={false}>
      <Header title="New customer" onBack={() => router.back()} backLabel="Customers" />
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
            Name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Customer name"
            placeholderTextColor={semantic.input.placeholder}
            value={name}
            onChangeText={setName}
            editable={!isCreating}
          />
          <Text variant="label" style={styles.label}>
            Email (optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor={semantic.input.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isCreating}
          />
          <Text variant="label" style={styles.label}>
            Phone (optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={semantic.input.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isCreating}
          />
          <Text variant="label" style={styles.label}>
            Postcode (optional)
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
            Notes (optional)
          </Text>
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Any notes"
            placeholderTextColor={semantic.input.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            editable={!isCreating}
          />
          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Button
            title={isCreating ? "Creating…" : "Create customer"}
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
  notes: {
    height: 64,
    paddingTop: spacing.sm,
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
