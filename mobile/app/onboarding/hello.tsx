import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { spacing } from "@/constants/theme"

export default function OnboardingHelloScreen() {
  const { session } = useAuth()
  const { profile } = useProfile(session?.access_token ?? undefined)
  const displayName = profile?.display_name?.trim() || profile?.postcode || "there"

  const goHome = () => router.replace("/")

  return (
    <Screen padded={false}>
      <View style={styles.container}>
        <Text variant="title" style={styles.title}>
          Hello, {displayName}
        </Text>
        <Text variant="body" style={styles.subtitle}>
          You’re all set. Complete your profile to get the most from TradeMatch.
        </Text>
        <Button
          title="Go to home"
          variant="primary"
          onPress={goHome}
          fullWidth
          style={styles.button}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: { marginBottom: spacing.md },
  subtitle: { marginBottom: spacing.xl },
  button: {},
})
