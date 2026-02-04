/**
 * Centralized API endpoint paths.
 * Use these instead of hardcoding paths throughout the app.
 */
export const endpoints = {
  profile: {
    me: "api/profiles/me",
  },
  jobs: {
    list: "api/jobs",
    get: (id: string) => `api/jobs/${id}`,
  },
  customers: {
    list: "api/customers",
    get: (id: string) => `api/customers/${id}`,
  },
} as const
