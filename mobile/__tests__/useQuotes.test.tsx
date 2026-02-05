import React from "react"
import { renderHook, waitFor } from "@testing-library/react-native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useQuotes } from "@/hooks/useQuotes"
import { api } from "@/lib/api"
import type { Quote } from "@/lib/types"

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    quotes: {
      list: (jobId: string) => `api/quotes?job_id=${jobId}`,
      create: "api/quotes",
      get: (id: string) => `api/quotes/${id}`,
    },
  },
}))

const mockApi = jest.mocked(api)

function createWrapper() {
  const queryClient = new QueryClient()
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockQuotes: Quote[] = [
  {
    id: "q1",
    job_id: "job-1",
    amount: 100,
    status: "draft",
    description: null,
    line_items: null,
    valid_until: null,
    sent_at: null,
    responded_at: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

describe("useQuotes", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("does not fetch when jobId or token is missing", () => {
    const wrapper = createWrapper()

    renderHook(() => useQuotes(undefined, undefined), { wrapper })

    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it("fetches quotes for given job when token is provided", async () => {
    const wrapper = createWrapper()

    mockApi.get.mockResolvedValueOnce(mockQuotes)

    const { result } = renderHook(() => useQuotes("job-1", "token-123"), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.quotes).toEqual(mockQuotes)
    })

    expect(mockApi.get).toHaveBeenCalledWith("api/quotes?job_id=job-1", "token-123")
  })
})
