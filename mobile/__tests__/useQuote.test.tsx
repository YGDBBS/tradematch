import React from "react"
import { renderHook, waitFor } from "@testing-library/react-native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useQuote } from "@/hooks/useQuotes"
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

const mockQuote: Quote = {
  id: "q1",
  job_id: "job-1",
  amount: 200,
  status: "draft",
  description: null,
  line_items: null,
  valid_until: null,
  sent_at: null,
  responded_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

describe("useQuote", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("fetches a single quote when id and token are provided", async () => {
    const wrapper = createWrapper()

    mockApi.get.mockResolvedValueOnce(mockQuote)

    const { result } = renderHook(() => useQuote("q1", "token-123"), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.quote).toEqual(mockQuote)
    })

    expect(mockApi.get).toHaveBeenCalledWith("api/quotes/q1", "token-123")
  })

  it("sendQuote marks the quote as sent", async () => {
    const wrapper = createWrapper()

    mockApi.get.mockResolvedValueOnce(mockQuote)

    const sentQuote: Quote = { ...mockQuote, status: "sent" }
    mockApi.patch.mockResolvedValueOnce(sentQuote)

    const { result } = renderHook(() => useQuote("q1", "token-123"), {
      wrapper,
    })

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.quote).not.toBeNull()
    })

    await result.current.sendQuote()

    expect(mockApi.patch).toHaveBeenCalledWith("api/quotes/q1", { status: "sent" }, "token-123")
  })
})
