import { useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import type { BusinessType } from "@/lib/types"
import { semantic, spacing, borderRadius } from "@/constants/theme"

const BUSINESS_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "sole_trader", label: "Sole trader" },
  { value: "ltd", label: "Limited company" },
]

const EMPLOYEE_OPTIONS = [
  { value: 0, label: "Just me" },
  { value: 2, label: "1–5" },
  { value: 6, label: "6+" },
]

export default function OnboardingContractorDetailsScreen() {
  const { session } = useAuth()
  const { profile, updateProfile, isUpdating } = useProfile(session?.access_token ?? undefined)
  const [businessType, setBusinessType] = useState<BusinessType | null>(
    profile?.business_type ?? null
  )
  const [employeeCount, setEmployeeCount] = useState<number | null>(profile?.employee_count ?? null)
  const [isEmployer, setIsEmployer] = useState<boolean | null>(profile?.is_employer ?? null)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    setError(null)
    if (businessType === null) {
      setError("Please select your business type.")
      return
    }
    if (employeeCount === null) {
      setError("Please select how many employees.")
      return
    }
    if (isEmployer === null) {
      setError("Please select employer or employee.")
      return
    }
    try {
      await updateProfile({
        business_type: businessType,
        employee_count: employeeCount,
        is_employer: isEmployer,
      })
      router.replace("/onboarding/hello")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title" style={styles.title}>
          About your business
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Sole trader or limited company?
        </Text>
        <View style={styles.optionsRow}>
          {BUSINESS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setBusinessType(opt.value)}
              style={[styles.option, businessType === opt.value && styles.optionSelected]}
            >
              <Text
                variant="body"
                style={businessType === opt.value ? styles.optionTextSelected : undefined}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text variant="bodySmall" style={styles.label}>
          How many employees?
        </Text>
        <View style={styles.optionsRow}>
          {EMPLOYEE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setEmployeeCount(opt.value)}
              style={[styles.option, employeeCount === opt.value && styles.optionSelected]}
            >
              <Text
                variant="body"
                style={employeeCount === opt.value ? styles.optionTextSelected : undefined}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text variant="bodySmall" style={styles.label}>
          Are you an employer or employee?
        </Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            onPress={() => setIsEmployer(true)}
            style={[styles.option, isEmployer === true && styles.optionSelected]}
          >
            <Text
              variant="body"
              style={isEmployer === true ? styles.optionTextSelected : undefined}
            >
              Employer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsEmployer(false)}
            style={[styles.option, isEmployer === false && styles.optionSelected]}
          >
            <Text
              variant="body"
              style={isEmployer === false ? styles.optionTextSelected : undefined}
            >
              Employee
            </Text>
          </TouchableOpacity>
        </View>
        {error ? (
          <Text variant="bodySmall" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Button
          title="Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={isUpdating}
          fullWidth
          style={styles.button}
        />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.md },
  label: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: semantic.input.border,
    backgroundColor: semantic.input.bg,
  },
  optionSelected: {
    borderColor: semantic.buttonPrimary.bg,
    backgroundColor: semantic.screen.background,
  },
  optionTextSelected: {
    color: semantic.buttonPrimary.bg,
    fontWeight: "600",
  },
  error: {
    color: semantic.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
})
