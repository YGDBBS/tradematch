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
import { useCustomer } from "@/hooks/useCustomers"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const {
    customer,
    loading,
    error,
    refetch,
    updateCustomer,
    isUpdating,
    deleteCustomer,
    isDeleting,
  } = useCustomer(id, session?.access_token ?? undefined)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [postcode, setPostcode] = useState("")
  const [notes, setNotes] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setEmail(customer.email ?? "")
      setPhone(customer.phone ?? "")
      setPostcode(customer.postcode ?? "")
      setNotes(customer.notes ?? "")
    }
  }, [customer])

  const handleSave = async () => {
    setSaveError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setSaveError("Enter a name")
      return
    }
    try {
      await updateCustomer({
        name: trimmed,
        email: email.trim() || null,
        phone: phone.trim() || null,
        postcode: postcode.trim() || null,
        notes: notes.trim() || null,
      })
      router.back()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete customer",
      "Are you sure? Jobs linked to this customer will keep the link until you change them.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomer()
              router.replace("/jobs/customers")
            } catch (_e) {
              // Error surfaced by hook
            }
          },
        },
      ]
    )
  }

  if (loading && !customer) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text variant="body">Loading…</Text>
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="bodySmall" style={styles.error}>
            {error.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} fullWidth />
        </View>
      </Screen>
    )
  }

  if (!customer) return null

  return (
    <Screen padded={false}>
      <Header title={customer.name} onBack={() => router.back()} backLabel="Customers" />
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
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Email
          </Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor={semantic.input.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Phone
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={semantic.input.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Postcode
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. SW1A 1AA"
            placeholderTextColor={semantic.input.placeholder}
            value={postcode}
            onChangeText={setPostcode}
            autoCapitalize="characters"
            editable={!isUpdating}
          />
          <Text variant="label" style={styles.label}>
            Notes
          </Text>
          <TextInput
            style={[styles.input, styles.notes]}
            placeholder="Any notes"
            placeholderTextColor={semantic.input.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
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
            title={isDeleting ? "Deleting…" : "Delete customer"}
            variant="destructive"
            onPress={handleDelete}
            disabled={isDeleting}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
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
