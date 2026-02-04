import { View, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useCustomers } from "@/hooks/useCustomers"
import { semantic, spacing } from "@/constants/theme"
import type { Customer } from "@/lib/types"

function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/jobs/customers/${customer.id}`)}
      activeOpacity={0.7}
    >
      <Text variant="body" numberOfLines={1} style={styles.rowName}>
        {customer.name}
      </Text>
      {customer.phone ? (
        <Text variant="bodySmall" style={styles.rowMeta}>
          {customer.phone}
        </Text>
      ) : null}
    </TouchableOpacity>
  )
}

export default function CustomersListScreen() {
  const { session } = useAuth()
  const { customers, loading, error, refetch } = useCustomers(session?.access_token ?? undefined)

  if (loading && !customers?.length) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={semantic.loading} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <Header title="Customers" onBack={() => router.back()} backLabel="Jobs" />
      <View style={styles.header}>
        <Button
          title="New customer"
          variant="primary"
          onPress={() => router.push("/jobs/customers/new")}
          style={styles.newButton}
        />
      </View>
      {error ? (
        <View style={styles.errorBlock}>
          <Text variant="bodySmall" style={styles.error}>
            {error.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} fullWidth />
        </View>
      ) : (
        <FlatList
          data={customers ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CustomerRow customer={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text variant="body" style={styles.empty}>
              No customers yet. Tap "New customer" to add one.
            </Text>
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
  },
  newButton: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: semantic.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: semantic.border,
  },
  rowName: {
    marginBottom: spacing.xs,
  },
  rowMeta: {
    color: semantic.textSecondary,
  },
  errorBlock: {
    padding: spacing.lg,
  },
  error: {
    color: semantic.error,
    marginBottom: spacing.md,
  },
  empty: {
    color: semantic.textSecondary,
    marginTop: spacing.lg,
  },
})
