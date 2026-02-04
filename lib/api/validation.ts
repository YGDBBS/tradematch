/**
 * Server-side validation utilities.
 * Returns error message if invalid, null if valid.
 */

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return "Email is required"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) return "Invalid email address"
  return null
}

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i

export function validatePostcode(postcode: string | null | undefined): string | null {
  if (!postcode?.trim()) return null // Optional field
  if (!UK_POSTCODE_REGEX.test(postcode.trim())) {
    return "Invalid UK postcode"
  }
  return null
}

const PHONE_REGEX = /^[\d\s+()-]{10,}$/

export function validatePhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null // Optional field
  const digitsOnly = phone.trim().replace(/[\s+()-]/g, "")
  if (digitsOnly.length < 10 || !PHONE_REGEX.test(phone.trim())) {
    return "Invalid phone number"
  }
  return null
}

export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined) return `${fieldName} is required`
  if (typeof value === "string" && !value.trim()) return `${fieldName} is required`
  return null
}

/**
 * Normalize UK postcode to standard format (uppercase with space).
 */
export function normalizePostcode(postcode: string): string {
  const trimmed = postcode.trim().toUpperCase().replace(/\s+/g, "")
  if (trimmed.length < 5) return trimmed
  return `${trimmed.slice(0, -3)} ${trimmed.slice(-3)}`
}
