import React from "react"
import { render, screen } from "@testing-library/react-native"
import QuoteDetailScreen from "@/app/(tabs)/jobs/[id]/quotes/[quoteId]"
import { useQuote } from "@/hooks/useQuotes"
import type { Quote } from "@/lib/types"

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: "job-1", quoteId: "quote-1" }),
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ session: { access_token: "test-token" } }),
}))

jest.mock("@/hooks/useQuotes", () => {
  return {
    useQuote: jest.fn(),
    quotesQueryKey: (jobId: string) => ["quotes", jobId] as const,
  }
})

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}))

jest.mock("@/components", () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  Button: ({ title }: { title: string }) => title,
  Header: ({ title }: { title: string }) => title,
}))

const useQuoteMock = jest.mocked(useQuote)

const createMockQuote = (overrides: Partial<Quote> = {}): Quote => ({
  id: "quote-1",
  job_id: "job-1",
  status: "draft",
  amount: 100,
  description: null,
  line_items: null,
  valid_until: null,
  sent_at: null,
  responded_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
})

const createMockUseQuoteReturn = (overrides = {}) => ({
  quote: null,
  loading: false,
  error: null,
  refetch: jest.fn(),
  updateQuote: jest.fn(),
  isUpdating: false,
  deleteQuote: jest.fn(),
  isDeleting: false,
  sendQuote: jest.fn(),
  ...overrides,
})

// Skip screen tests due to react-native 0.81 / Hermes parser compatibility issue
// These tests fail when rendering components that use FlatList/ScrollView
// Re-enable when jest-expo is updated to handle Flow syntax in RN 0.81
describe.skip("QuoteDetailScreen", () => {
  it("shows loading state", () => {
    useQuoteMock.mockReturnValue(
      createMockUseQuoteReturn({
        loading: true,
      })
    )

    render(<QuoteDetailScreen />)

    expect(screen.getByText("Loading…")).toBeTruthy()
  })

  it("shows error when quote is missing", () => {
    useQuoteMock.mockReturnValue(
      createMockUseQuoteReturn({
        error: new Error("Boom"),
      })
    )

    render(<QuoteDetailScreen />)

    expect(screen.getByText("Boom")).toBeTruthy()
  })

  it("renders quote amount when loaded", () => {
    useQuoteMock.mockReturnValue(
      createMockUseQuoteReturn({
        quote: createMockQuote({
          amount: 123.45,
          description: "Test quote",
        }),
      })
    )

    render(<QuoteDetailScreen />)

    expect(screen.getByText("£123.45")).toBeTruthy()
    expect(screen.getByText("Test quote")).toBeTruthy()
  })
})
