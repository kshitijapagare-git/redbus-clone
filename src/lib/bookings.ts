import type { Booking } from '../types'

export const BOOKINGS_STORAGE_KEY = 'redbus:bookings'

/**
 * Bookings created during the current session when localStorage is
 * unavailable. Never written anywhere durable, so this is lost on reload —
 * see the module doc below for the overall persistence contract.
 */
let inMemoryBookings: Booking[] = []

function isValidShape(value: unknown): value is Booking {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.pnr === 'string' && typeof candidate.status === 'string' && typeof candidate.busId === 'number'
}

function safeParseJsonArray(raw: string | null): unknown[] | null {
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(parsed)) return null
  return parsed
}

/**
 * Loads bookings from localStorage. Never throws.
 *
 * Mirrors loadRecentSearches's corruption handling: any structural
 * corruption (unreadable storage, invalid JSON, non-array data, or entries
 * missing required fields) is treated as fully broken — `available` is
 * false and `bookings` is empty. This does NOT consult the in-memory
 * fallback; that's intentional, since loadBookings is used to simulate a
 * fresh reload (see findBookingByPnr for the combined lookup).
 */
export function loadBookings(): { bookings: Booking[]; available: boolean } {
  let raw: string | null
  try {
    raw = localStorage.getItem(BOOKINGS_STORAGE_KEY)
  } catch {
    return { bookings: [], available: false }
  }

  const parsed = safeParseJsonArray(raw)
  if (parsed === null) {
    return { bookings: [], available: false }
  }

  if (!parsed.every(isValidShape)) {
    return { bookings: [], available: false }
  }

  return { bookings: parsed as Booking[], available: true }
}

/** Persists the given list to localStorage. Never throws; returns false on failure. */
export function persistBookings(bookings: Booking[]): boolean {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings))
    return true
  } catch {
    return false
  }
}

/**
 * Adds `booking` to persisted storage. When localStorage is available, the
 * booking is appended to the existing list and persisted. When it is not
 * (either `loadBookings` or `persistBookings` fails), the booking is kept in
 * an in-memory, module-level list instead so `findBookingByPnr` can still
 * find it for the rest of this session; that fallback is never written
 * anywhere durable.
 */
export function addBooking(booking: Booking): { saved: boolean } {
  const { bookings, available } = loadBookings()
  if (available) {
    const saved = persistBookings([...bookings, booking])
    if (saved) {
      return { saved: true }
    }
  }
  inMemoryBookings = [...inMemoryBookings, booking]
  return { saved: false }
}

/**
 * Finds a booking by PNR, checking the localStorage-backed list first and
 * falling back to the in-memory, current-session-only list added by
 * addBooking when localStorage was unavailable.
 */
export function findBookingByPnr(pnr: string): Booking | undefined {
  const { bookings } = loadBookings()
  const fromStorage = bookings.find((b) => b.pnr === pnr)
  if (fromStorage) return fromStorage
  return inMemoryBookings.find((b) => b.pnr === pnr)
}

/** Returns the seat ids of all Confirmed bookings matching the given busId and date. */
export function bookedSeatIdsForBusAndDate(bookings: Booking[], busId: number, date: string): string[] {
  return bookings
    .filter((b) => b.status === 'Confirmed' && b.busId === busId && b.date === date)
    .flatMap((b) => b.seatIds)
}
