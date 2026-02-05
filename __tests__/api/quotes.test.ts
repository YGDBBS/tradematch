/** @jest-environment node */

import { NextRequest } from "next/server"
import { GET, POST } from "@/app/api/quotes/route"
import type { AuthHandler } from "@/lib/api/withAuth"

// Mock withAuth to bypass real auth
jest.mock("@/lib/api/withAuth", () => {
  return {
    withAuth:
      (handler: AuthHandler) =>
      async (request: NextRequest): Promise<Response> => {
        return handler({
          userId: "test-user-id",
          supabase: {
            from: () => ({
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () => ({ data: { id: "job-1" }, error: null }),
                  }),
                  order: () => ({ data: [], error: null }),
                }),
              }),
              insert: () => ({
                select: () => ({
                  single: () => ({
                    data: {
                      id: "quote-1",
                      job_id: "job-1",
                      amount: 100,
                      status: "draft",
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          },
          request,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
      },
  }
})

function createGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/quotes")
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url, {
    method: "GET",
    headers: { authorization: "Bearer test-token" },
  })
}

function createPostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/quotes", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
    },
  })
}

describe("GET /api/quotes", () => {
  it("returns quotes when job_id is provided", async () => {
    const request = createGetRequest({ job_id: "job-1" })

    const res = await GET(request)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(json)).toBe(true)
  })
})

describe("POST /api/quotes", () => {
  it("returns 400 when JSON is invalid", async () => {
    const request = new NextRequest("http://localhost/api/quotes", {
      method: "POST",
      body: "not-json",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-token",
      },
    })

    const res = await POST(request)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json).toEqual({ error: "Invalid JSON" })
  })

  it("returns 400 when job_id is missing", async () => {
    const request = createPostRequest({ amount: 100 })

    const res = await POST(request)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json).toEqual({ error: "job_id is required" })
  })

  it("returns 400 when amount is missing", async () => {
    const request = createPostRequest({ job_id: "job-1" })

    const res = await POST(request)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json).toEqual({ error: "amount is required" })
  })

  it("returns 201 with valid input", async () => {
    const request = createPostRequest({ job_id: "job-1", amount: 100 })

    const res = await POST(request)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.id).toBe("quote-1")
    expect(json.amount).toBe(100)
  })
})
