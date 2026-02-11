import { useEffect, useRef } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { Stack, router, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { QueryProvider } from "@/contexts/QueryProvider"
import { FontProvider, useFontContext } from "@/contexts/FontContext"
import { colors } from "@/constants/theme"

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync()

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const segments = useSegments()
  const hasNavigated = useRef(false)

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === "(tabs)"
    const inPublicGroup =
      segments[0] === "welcome" || segments[0] === "login" || segments[0] === "signup"

    // If signed out and on a protected route, go to welcome
    if (!session && inAuthGroup) {
      router.replace("/welcome")
      hasNavigated.current = true
    }
    // If signed in and on public route (after initial load), go to tabs
    else if (session && inPublicGroup && hasNavigated.current) {
      router.replace("/(tabs)")
    }
  }, [session, loading, segments])

  return <>{children}</>
}

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
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>
      </AuthGate>
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
