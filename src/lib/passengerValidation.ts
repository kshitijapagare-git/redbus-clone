/**
 * Validation rules for the per-seat passenger-details form. Each function
 * returns an error message string when the value is invalid, or `null` when
 * it's valid — matching the inline-error convention already used by
 * SearchCard/TrainsSearchCard's `errors` state.
 */

export function validatePassengerName(name: string): string | null {
  if (name.trim() === '') return 'Name is required.'
  return null
}

const WHOLE_NUMBER_PATTERN = /^\d+$/

/** Integer between 1 and 120 inclusive. */
export function validatePassengerAge(age: string): string | null {
  const trimmed = age.trim()
  if (trimmed === '' || !WHOLE_NUMBER_PATTERN.test(trimmed)) return 'Age must be a whole number.'
  const value = Number(trimmed)
  if (value < 1 || value > 120) return 'Age must be between 1 and 120.'
  return null
}

/** A women-only seat's passenger must have gender exactly 'Female'. */
export function validatePassengerGender(gender: string, womenOnly: boolean): string | null {
  const trimmed = gender.trim()
  if (trimmed === '') return 'Gender is required.'
  if (womenOnly && trimmed !== 'Female') return 'Gender must be Female for a women-only seat.'
  return null
}

const MOBILE_PATTERN = /^\d{10}$/

/** Exactly 10 digits. */
export function validateMobileNumber(mobile: string): string | null {
  if (!MOBILE_PATTERN.test(mobile.trim())) return 'Mobile number must be exactly 10 digits.'
  return null
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Non-empty and syntactically valid. */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (trimmed === '') return 'Email is required.'
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.'
  return null
}
