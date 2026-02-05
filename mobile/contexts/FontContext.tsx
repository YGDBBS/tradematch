import React, { createContext, useContext } from "react"
import {
  useFonts,
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from "@expo-google-fonts/work-sans"

interface FontContextValue {
  fontsLoaded: boolean
  fontFamily: string
  fontFamilyMedium: string
  fontFamilySemiBold: string
  fontFamilyBold: string
}

const FontContext = createContext<FontContextValue>({
  fontsLoaded: false,
  fontFamily: "System",
  fontFamilyMedium: "System",
  fontFamilySemiBold: "System",
  fontFamilyBold: "System",
})

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  })

  const value: FontContextValue = {
    fontsLoaded,
    fontFamily: fontsLoaded ? "WorkSans_400Regular" : "System",
    fontFamilyMedium: fontsLoaded ? "WorkSans_500Medium" : "System",
    fontFamilySemiBold: fontsLoaded ? "WorkSans_600SemiBold" : "System",
    fontFamilyBold: fontsLoaded ? "WorkSans_700Bold" : "System",
  }

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>
}

export function useFontContext() {
  return useContext(FontContext)
}
