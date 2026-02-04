/**
 * API client for TradeMatch backend.
 * All requests use EXPO_PUBLIC_API_URL. Authenticated routes need accessToken.
 */

const BASE = process.env.EXPO_PUBLIC_API_URL ?? ""

async function request<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<T> {
  const { accessToken, ...init } = options
  const url = `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const res = await fetch(url, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? res.statusText ?? "Request failed")
  return data as T
}

export const api = {
  get: <T>(path: string, accessToken?: string) =>
    request<T>(path, { method: "GET", accessToken }),

  post: <T>(path: string, body: unknown, accessToken?: string) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), accessToken }),

  patch: <T>(path: string, body: unknown, accessToken?: string) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), accessToken }),

  delete: <T>(path: string, accessToken?: string) =>
    request<T>(path, { method: "DELETE", accessToken }),
}
