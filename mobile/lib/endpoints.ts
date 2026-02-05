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
  quotes: {
    all: "api/quotes",
    list: (jobId: string) => `api/quotes?job_id=${jobId}`,
    create: "api/quotes",
    get: (id: string) => `api/quotes/${id}`,
  },
} as const
