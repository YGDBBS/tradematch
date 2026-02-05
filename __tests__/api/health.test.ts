/** @jest-environment node */

import { GET } from "@/app/api/health/route"

describe("GET /api/health", () => {
  it("returns ok status payload", async () => {
    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ status: "ok", service: "tradematch-api" })
  })
})
