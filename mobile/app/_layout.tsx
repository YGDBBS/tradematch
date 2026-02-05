import { useEffect } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { AuthProvider } from "@/contexts/AuthContext"
import { QueryProvider } from "@/contexts/QueryProvider"
import { FontProvider, useFontContext } from "@/contexts/FontContext"
import { colors } from "@/constants/theme"

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync()

function RootLayoutInner() {
  const { fontsLoaded } = useFontContext()

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    )
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </AuthProvider>
  )
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <FontProvider>
        <RootLayoutInner />
      </FontProvider>
    </QueryProvider>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
})
