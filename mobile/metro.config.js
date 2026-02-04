const { getDefaultConfig } = require("expo/metro-config")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// React Native 0.81 doesn't export jsx-dev-runtime / jsx-runtime; use React's.
const JSX_ALIASES = {
  "react-native/jsx-dev-runtime": "react/jsx-dev-runtime",
  "react-native/jsx-runtime": "react/jsx-runtime",
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolvedName = JSX_ALIASES[moduleName] ?? moduleName
  return context.resolveRequest(context, resolvedName, platform)
}

module.exports = config
