import { toDateKey } from './recentSearches'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Returns a new Date exactly `days` calendar days after `date`. Does not
 * mutate the input Date.
 */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

/** Formats a Date as 'D MMM, Ddd', e.g. '5 Oct, Mon'. */
export function formatHotelDate(date: Date): string {
  const day = date.getDate()
  const month = MONTH_LABELS[date.getMonth()]
  const weekday = WEEKDAY_LABELS[date.getDay()]
  return `${day} ${month}, ${weekday}`
}

/**
 * Returns `checkOut` unchanged when it falls strictly after `checkIn`
 * (compared by calendar date, not time-of-day). Otherwise returns
 * `checkIn` + 1 day, covering both the initial default (checkOut =
 * checkIn + 1) and the "check-in moved to or past check-out" auto-correct
 * rule.
 */
export function correctCheckOut(checkIn: Date, checkOut: Date): Date {
  const checkInKey = toDateKey(checkIn)
  const checkOutKey = toDateKey(checkOut)
  if (checkOutKey > checkInKey) {
    return checkOut
  }
  return addDays(checkIn, 1)
}
