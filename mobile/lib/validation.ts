/**
 * Validation utilities for form inputs.
 * Returns error message if invalid, null if valid.
 */

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return "Email is required"
  // Basic email regex - covers most valid cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address"
  return null
}

export function validatePassword(password: string, minLength = 6): string | null {
  if (!password) return "Password is required"
  if (password.length < minLength) return `Password must be at least ${minLength} characters`
  return null
}

// UK postcode regex - matches formats like "SW1A 1AA", "M1 1AA", "B33 8TH"
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i

export function validatePostcode(postcode: string): string | null {
  const trimmed = postcode.trim()
  if (!trimmed) return null // Optional field
  if (!UK_POSTCODE_REGEX.test(trimmed)) {
    return "Please enter a valid UK postcode (e.g. SW1A 1AA)"
  }
  return null
}

// Basic phone validation - allows various formats
const PHONE_REGEX = /^[\d\s+()-]{10,}$/

export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null // Optional field
  // Remove common formatting characters for length check
  const digitsOnly = trimmed.replace(/[\s+()-]/g, "")
  if (digitsOnly.length < 10) {
    return "Phone number must have at least 10 digits"
  }
  if (!PHONE_REGEX.test(trimmed)) {
    return "Please enter a valid phone number"
  }
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} is required`
  return null
}

/**
 * Normalize UK postcode to standard format (uppercase with space).
 * e.g. "sw1a1aa" -> "SW1A 1AA"
 */
export function normalizePostcode(postcode: string): string {
  const trimmed = postcode.trim().toUpperCase().replace(/\s+/g, "")
  if (trimmed.length < 5) return trimmed
  // Insert space before last 3 characters
  return `${trimmed.slice(0, -3)} ${trimmed.slice(-3)}`
}
