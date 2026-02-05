import React from "react"
import { render, screen } from "@testing-library/react-native"
import JobsListScreen from "@/app/(tabs)/jobs"
import { useJobs } from "@/hooks/useJobs"
import type { Job } from "@/lib/types"

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}))

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ session: { access_token: "test-token" } }),
}))

jest.mock("@/hooks/useJobs", () => ({
  useJobs: jest.fn(),
}))

jest.mock("@/components", () => ({
  Screen: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  Button: ({ title }: { title: string }) => title,
}))

const useJobsMock = jest.mocked(useJobs)

const createMockJob = (overrides: Partial<Job> = {}): Job => ({
  id: "j1",
  title: "Test Job",
  contractor_id: "contractor-1",
  customer_id: null,
  status: "draft",
  due_date: null,
  scheduled_at: null,
  notes: null,
  amount_quoted: null,
  amount_invoiced: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
})

const createMockUseJobsReturn = (overrides = {}) => ({
  jobs: null,
  loading: false,
  refreshing: false,
  error: null,
  refetch: jest.fn(),
  createJob: jest.fn(),
  isCreating: false,
  updateJob: jest.fn(),
  isUpdating: false,
  deleteJob: jest.fn(),
  isDeleting: false,
  ...overrides,
})

// Skip screen tests due to react-native 0.81 / Hermes parser compatibility issue
// These tests fail when rendering components that use FlatList/ScrollView
// Re-enable when jest-expo is updated to handle Flow syntax in RN 0.81
describe.skip("JobsListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows loading spinner when loading and no jobs", () => {
    useJobsMock.mockReturnValue(
      createMockUseJobsReturn({
        jobs: [],
        loading: true,
      })
    )

    render(<JobsListScreen />)

    // We don't assert ActivityIndicator directly due to mocking,
    // but ensure the screen renders without crashing.
    expect(screen.getByText("Jobs")).toBeTruthy()
  })

  it("renders a list of jobs", () => {
    useJobsMock.mockReturnValue(
      createMockUseJobsReturn({
        jobs: [
          createMockJob({ id: "j1", title: "Fix sink", status: "quoted" }),
          createMockJob({ id: "j2", title: "Paint wall", status: "scheduled" }),
        ],
      })
    )

    render(<JobsListScreen />)

    expect(screen.getByText("Jobs")).toBeTruthy()
    expect(screen.getByText("Fix sink")).toBeTruthy()
    expect(screen.getByText("Paint wall")).toBeTruthy()
  })

  it("shows error message and retry button when error", () => {
    const refetch = jest.fn()
    useJobsMock.mockReturnValue(
      createMockUseJobsReturn({
        error: new Error("Failed to load"),
        refetch,
      })
    )

    render(<JobsListScreen />)

    expect(screen.getByText("Failed to load")).toBeTruthy()
    expect(screen.getByText("Retry")).toBeTruthy()
  })
})
