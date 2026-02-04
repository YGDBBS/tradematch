/**
 * API client for TradeMatch backend.
 * All requests use EXPO_PUBLIC_API_URL. Authenticated routes need accessToken.
 */

const BASE = process.env.EXPO_PUBLIC_API_URL ?? ""

function getBaseUrl(): string {
  if (!BASE || BASE.trim() === "") {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Add it to mobile/.env (e.g. your Vercel URL), then restart Expo with: npx expo start --clear"
    )
  }
  return BASE.replace(/\/$/, "")
}

async function request<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<T> {
  const { accessToken, ...init } = options
  const url = `${getBaseUrl()}/${path.replace(/^\//, "")}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const res = await fetch(url, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      (typeof data?.error === "string" && data.error.trim()) ||
      res.statusText ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data as T
}

export const api = {
  get: <T>(path: string, accessToken?: string) => request<T>(path, { method: "GET", accessToken }),

  post: <T>(path: string, body: unknown, accessToken?: string) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), accessToken }),

  patch: <T>(path: string, body: unknown, accessToken?: string) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), accessToken }),

  delete: <T>(path: string, accessToken?: string) =>
    request<T>(path, { method: "DELETE", accessToken }),
}
