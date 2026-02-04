import { useState } from "react"
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export default function SignupScreen() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError(null)
    if (!email.trim() || !password) {
      setError("Email and password are required")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setLoading(true)
    const { error: err } = await signUp(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    router.replace("/onboarding/role")
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.form}>
          <Text variant="title" style={styles.title}>
            Create account
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Join TradeMatch – qualified leads, payment held by Stripe.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={semantic.input.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={semantic.input.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            editable={!loading}
          />

          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            title={loading ? "Creating account…" : "Sign up"}
            onPress={handleSignUp}
            disabled={loading}
            fullWidth
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            style={styles.linkWrap}
          >
            <Text variant="bodySmall">
              Already have an account? <Text variant="label" color="accent">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  form: {
    width: "100%",
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: semantic.input.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: semantic.input.text,
    backgroundColor: semantic.input.bg,
  },
  error: {
    color: semantic.error,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  linkWrap: {
    alignSelf: "center",
  },
})
