import { Stack } from "expo-router"

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="role" />
      <Stack.Screen name="contractor-details" />
      <Stack.Screen name="customer-details" />
      <Stack.Screen name="hello" />
    </Stack>
  )
}
