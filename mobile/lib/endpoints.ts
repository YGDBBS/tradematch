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
  requests: {
    list: "api/requests",
    get: (id: string) => `api/requests/${id}`,
    match: (id: string) => `api/requests/${id}/match`,
    messages: (id: string) => `api/requests/${id}/messages`,
  },
  leads: {
    list: "api/leads",
    get: (id: string) => `api/leads/${id}`,
  },
  conversations: {
    list: "api/conversations",
  },
} as const
