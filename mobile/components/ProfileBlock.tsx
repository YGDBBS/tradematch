import React from "react"
import { View, StyleSheet } from "react-native"
import { Card } from "./Card"
import { Text } from "./Text"
import { Button } from "./Button"
import type { Profile } from "@/lib/types"
import { spacing } from "@/constants/theme"

export interface ProfileBlockProps {
  profile: Profile | null
  onEdit?: () => void
  onSignOut?: () => void
}

/**
 * Presentational: displays profile data. Parent passes profile and callbacks.
 * No API calls or auth; fully controlled by parent.
 */
export function ProfileBlock({ profile, onEdit, onSignOut }: ProfileBlockProps) {
  if (!profile) return null

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text variant="label" style={styles.label}>
          Role
        </Text>
        <Text variant="body" style={styles.value}>
          {profile.role}
        </Text>
        <Text variant="label" style={styles.label}>
          Display name
        </Text>
        <Text variant="body" style={styles.value}>
          {profile.display_name ?? "—"}
        </Text>
        {profile.postcode ? (
          <>
            <Text variant="label" style={styles.label}>
              Postcode
            </Text>
            <Text variant="body" style={styles.value}>
              {profile.postcode}
            </Text>
          </>
        ) : null}
        {onEdit && (
          <Button
            title="Edit profile"
            variant="secondary"
            onPress={onEdit}
            fullWidth
            style={styles.button}
          />
        )}
      </Card>
      {onSignOut && (
        <Button
          title="Sign out"
          variant="secondary"
          onPress={onSignOut}
          fullWidth
          style={styles.signOut}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
  },
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  value: {
    marginBottom: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
  },
  signOut: {
    marginTop: spacing.sm,
  },
})
