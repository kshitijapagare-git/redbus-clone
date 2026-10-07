import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BOOKINGS_STORAGE_KEY,
  addBooking,
  bookedSeatIdsForBusAndDate,
  findBookingByPnr,
  loadBookings,
  persistBookings,
} from './bookings'
import type { Booking } from '../types'

const boardingPoint = { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 }
const droppingPoint = { id: 3, name: 'Majestic', address: 'Kempegowda Bus Station', landmark: 'Opp. Railway Station', cityId: 2 }

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    pnr: 'ABCD123456',
    status: 'Confirmed',
    busId: 3,
    operatorName: 'Orange Travels',
    busType: 'AC Sleeper',
    fromCityId: 1,
    toCityId: 2,
    date: '2024-10-07',
    departureTime: '21:00',
    arrivalTime: '07:00',
    seatIds: ['L2'],
    boardingPoint,
    droppingPoint,
    passengers: [{ seatId: 'L2', name: 'Asha', age: 30, gender: 'Female' }],
    contact: { email: 'asha@example.com', mobile: '9876543210' },
    fare: { subtotal: 1200, discount: 0, gst: 60, total: 1260 },
    couponCode: null,
    createdAt: '2024-10-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('loadBookings / persistBookings / addBooking / findBookingByPnr', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns available:false and empty bookings when getItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('boom')
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    expect(loadBookings()).toEqual({ bookings: [], available: false })
  })

  it('persists and loads a booking', () => {
    const booking = makeBooking()
    const ok = persistBookings([booking])
    expect(ok).toBe(true)
    expect(loadBookings()).toEqual({ bookings: [booking], available: true })
  })

  it('addBooking persists to localStorage when available', () => {
    const booking = makeBooking()
    const result = addBooking(booking)
    expect(result.saved).toBe(true)
    expect(JSON.parse(store[BOOKINGS_STORAGE_KEY])).toEqual([booking])
  })

  it('findBookingByPnr returns the saved booking', () => {
    const booking = makeBooking({ pnr: 'FINDME1234' })
    addBooking(booking)
    expect(findBookingByPnr('FINDME1234')).toEqual(booking)
  })

  it('findBookingByPnr returns undefined for a PNR that was never created', () => {
    expect(findBookingByPnr('NOPE000000')).toBeUndefined()
  })

  it('falls back to an in-memory list when localStorage is unavailable, retrievable within the same session', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('boom')
      }),
      setItem: vi.fn(() => {
        throw new Error('boom')
      }),
      removeItem: vi.fn(),
    })

    const booking = makeBooking({ pnr: 'MEMONLY001' })
    const result = addBooking(booking)
    expect(result.saved).toBe(false)
    expect(findBookingByPnr('MEMONLY001')).toEqual(booking)
  })

  it('a fresh loadBookings call does not find an in-memory-only booking (simulating a reload)', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('boom')
      }),
      setItem: vi.fn(() => {
        throw new Error('boom')
      }),
      removeItem: vi.fn(),
    })

    const booking = makeBooking({ pnr: 'MEMONLY002' })
    addBooking(booking)
    expect(loadBookings().bookings).toEqual([])
  })
})

describe('bookedSeatIdsForBusAndDate', () => {
  it('returns the seat ids of Confirmed bookings matching busId and date', () => {
    const bookings = [
      makeBooking({ busId: 3, date: '2024-10-07', seatIds: ['L2', 'L3'] }),
      makeBooking({ busId: 3, date: '2024-10-08', seatIds: ['L9'] }),
      makeBooking({ busId: 4, date: '2024-10-07', seatIds: ['U1'] }),
    ]
    expect(bookedSeatIdsForBusAndDate(bookings, 3, '2024-10-07')).toEqual(['L2', 'L3'])
  })
})
