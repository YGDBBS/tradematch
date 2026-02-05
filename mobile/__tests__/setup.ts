// Jest setup for React Native testing

// Suppress act() warnings from React Query's internal updates
// These are expected in testing-library/react-native with React Query
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act")) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
