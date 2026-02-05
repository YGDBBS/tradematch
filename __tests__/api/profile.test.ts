/** @jest-environment node */

import { NextRequest } from "next/server"
import { PATCH } from "@/app/api/profiles/me/route"
import type { AuthHandler, AuthContext } from "@/lib/api/withAuth"

jest.mock("@/lib/api/withAuth", () => {
  return {
    withAuth:
      (handler: AuthHandler) =>
      async (request: NextRequest): Promise<Response> => {
        return handler({
          userId: "test-user-id",
          supabase: {
            from: () => ({
              update: () => ({
                eq: () => ({
                  select: () => ({
                    single: async () => ({ data: { id: "test-user-id" }, error: null }),
                  }),
                }),
              }),
            }),
          } as AuthContext["supabase"],
          request,
        })
      },
  }
})

function createJsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/profiles/me", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
    },
  })
}

describe("PATCH /api/profiles/me", () => {
  it("returns 400 for invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/profiles/me", {
      method: "PATCH",
      body: "not-json",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-token",
      },
    })

    const res = await PATCH(request)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json).toEqual({ error: "Invalid JSON" })
  })

  it("returns 400 for invalid phone", async () => {
    const req = createJsonRequest({ phone: "not-a-phone" })

    const res = await PATCH(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json).toHaveProperty("error")
  })
})
