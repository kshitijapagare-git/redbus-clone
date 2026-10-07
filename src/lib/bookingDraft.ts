export const BOOKING_DRAFT_STORAGE_KEY = 'redbus:bookingDraft'

export interface BookingDraftPassenger {
  name: string
  age: string
  gender: string
}

export interface BookingDraftContact {
  email: string
  mobile: string
}

export interface BookingDraft {
  passengers: Record<string, BookingDraftPassenger>
  contact: BookingDraftContact
}

function isValidPassenger(value: unknown): value is BookingDraftPassenger {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.name === 'string' && typeof candidate.age === 'string' && typeof candidate.gender === 'string'
  )
}

function isValidShape(value: unknown): value is BookingDraft {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.passengers !== 'object' || candidate.passengers === null) return false
  if (!Object.values(candidate.passengers as Record<string, unknown>).every(isValidPassenger)) return false
  const contact = candidate.contact as Record<string, unknown> | undefined
  if (typeof contact !== 'object' || contact === null) return false
  return typeof contact.email === 'string' && typeof contact.mobile === 'string'
}

/**
 * Persists the per-seat passenger details and shared contact details for the
 * current booking session, so the payment page can read them back. Uses
 * sessionStorage (rather than localStorage) since this draft is only
 * relevant for the current in-progress booking. Never throws; returns false
 * on failure, mirroring womenToggle.ts's persist convention.
 */
export function saveBookingDraft(draft: BookingDraft): boolean {
  try {
    sessionStorage.setItem(BOOKING_DRAFT_STORAGE_KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

/**
 * Loads the persisted booking draft from sessionStorage. Never throws.
 * Returns null when nothing has been saved yet, or when the stored value is
 * structurally invalid/unreadable.
 */
export function loadBookingDraft(): BookingDraft | null {
  let raw: string | null
  try {
    raw = sessionStorage.getItem(BOOKING_DRAFT_STORAGE_KEY)
  } catch {
    return null
  }

  if (raw === null) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isValidShape(parsed)) return null

  return parsed
}

/** Clears the persisted booking draft. Never throws. */
export function clearBookingDraft(): void {
  try {
    sessionStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY)
  } catch {
    // ignore
  }
}
