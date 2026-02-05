/* global module */
module.exports = function (api) {
  const isTest = api.env("test")
  api.cache(true)

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "react" }]],
    // Reanimated's Babel plugin is not needed in Jest and currently
    // pulls in a worklets plugin that breaks tests, so skip it in test env.
    plugins: isTest ? [] : ["react-native-reanimated/plugin"],
  }
}
