/** @jest-environment node */

import { NextRequest } from "next/server"
import { POST } from "@/app/api/jobs/route"
import type { AuthHandler, AuthContext } from "@/lib/api/withAuth"

jest.mock("@/lib/api/withAuth", () => {
  return {
    withAuth:
      (handler: AuthHandler) =>
      async (request: NextRequest): Promise<Response> => {
        // Minimal auth wrapper for tests: bypass real auth and Supabase
        return handler({
          userId: "test-user-id",
          supabase: {} as AuthContext["supabase"],
          request,
        })
      },
  }
})

function createJsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/jobs", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
    },
  })
}

describe("POST /api/jobs", () => {
  it("returns 400 when JSON is invalid", async () => {
    const request = new NextRequest("http://localhost/api/jobs", {
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

  it("returns 400 when title is missing", async () => {
    const req = createJsonRequest({ customer_id: "c1" })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json).toEqual({ error: "Title is required" })
  })
})
