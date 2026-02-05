import { useState } from "react"
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Screen, Text, Button, Input } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { spacing } from "@/constants/theme"

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setError(null)
    if (!email.trim() || !password) {
      setError("Email and password are required")
      return
    }
    setLoading(true)
    const { error: err } = await signIn(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    router.replace("/")
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="hero" style={styles.title}>
              Welcome back
            </Text>
            <Text variant="body" color="muted">
              Sign in to your TradeMatch account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
              error={error && !email.trim() ? "Required" : undefined}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
              error={error && !password ? "Required" : undefined}
            />

            {error && email.trim() && password ? (
              <Text variant="bodySmall" color="error" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Button
              title={loading ? "Signing in…" : "Sign in"}
              onPress={handleSignIn}
              disabled={loading}
              fullWidth
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="body" color="muted">
              Don't have an account?
            </Text>
            <Pressable
              onPress={() => router.push("/signup")}
              disabled={loading}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="bodyStrong" color="accent" style={styles.linkText}>
                Sign up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  form: {
    marginBottom: spacing.xl,
  },
  error: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  linkText: {
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
})
