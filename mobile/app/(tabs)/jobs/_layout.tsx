import { Stack } from "expo-router"

export default function JobsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="customers" options={{ headerShown: false }} />
    </Stack>
  )
}
