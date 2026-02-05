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
import { validateEmail, validatePassword } from "@/lib/validation"
import { spacing } from "@/constants/theme"

export default function SignupScreen() {
  const insets = useSafeAreaInsets()
  const { signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setEmailError(null)
    setPasswordError(null)
    setGeneralError(null)

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)

    if (emailErr) setEmailError(emailErr)
    if (passwordErr) setPasswordError(passwordErr)
    if (emailErr || passwordErr) return

    setLoading(true)
    const { error: err } = await signUp(email.trim(), password)
    setLoading(false)

    if (err) {
      setGeneralError(err.message)
      return
    }
    router.replace("/onboarding/role")
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
              Create account
            </Text>
            <Text variant="body" color="muted">
              Join TradeMatch and start getting quality leads
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setEmailError(null)
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
              error={emailError || undefined}
            />

            <Input
              label="Password"
              placeholder="Min 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setPasswordError(null)
              }}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
              error={passwordError || undefined}
              helper="At least 6 characters"
            />

            {generalError ? (
              <Text variant="bodySmall" color="error" style={styles.error}>
                {generalError}
              </Text>
            ) : null}

            <Button
              title={loading ? "Creating account…" : "Create account"}
              onPress={handleSignUp}
              disabled={loading}
              fullWidth
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="body" color="muted">
              Already have an account?
            </Text>
            <Pressable
              onPress={() => router.back()}
              disabled={loading}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="bodyStrong" color="accent" style={styles.linkText}>
                Sign in
              </Text>
            </Pressable>
          </View>

          {/* Terms */}
          <Text variant="small" color="muted" align="center" style={styles.terms}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
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
    marginBottom: spacing.lg,
  },
  linkText: {
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  terms: {
    paddingHorizontal: spacing.lg,
  },
})
