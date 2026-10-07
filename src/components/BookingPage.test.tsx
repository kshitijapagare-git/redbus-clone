import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BookingPage from './BookingPage'
import { addBooking } from '../lib/bookings'
import type { Booking } from '../types'

const boardingPoint = { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 }
const droppingPoint = {
  id: 3,
  name: 'Majestic',
  address: 'Kempegowda Bus Station',
  landmark: 'Opp. Railway Station',
  cityId: 2,
}

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

describe('BookingPage', () => {
  beforeEach(() => {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  })

  afterEach(() => {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  })

  it('shows "Booking not found" for an unknown PNR', () => {
    render(<BookingPage pnr="NOPE000000" />)
    expect(screen.getByText('Booking not found')).toBeInTheDocument()
  })

  it('shows PNR, status, operator, bus type, route, date, times, points, passengers, fare and contact', () => {
    addBooking(makeBooking())
    render(<BookingPage pnr="ABCD123456" />)

    expect(screen.getByText('ABCD123456')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText(/Orange Travels/)).toBeInTheDocument()
    expect(screen.getByText(/Pune.*Bengaluru/)).toBeInTheDocument()
    expect(screen.getByText('21:00')).toBeInTheDocument()
    expect(screen.getByText('07:00')).toBeInTheDocument()
    expect(screen.getByText(/Shivajinagar/)).toBeInTheDocument()
    expect(screen.getByText(/Majestic/)).toBeInTheDocument()
    expect(screen.getByText(/Asha, 30, Female/)).toBeInTheDocument()
    expect(screen.getByText('₹1200')).toBeInTheDocument()
    expect(screen.getByText('₹60')).toBeInTheDocument()
    expect(screen.getByText('₹1260')).toBeInTheDocument()
    expect(screen.getByText(/asha@example.com/)).toBeInTheDocument()
  })

  it('shows the discount line and coupon code when a discount was applied', () => {
    addBooking(
      makeBooking({
        pnr: 'DISC012345',
        fare: { subtotal: 1200, discount: 300, gst: 45, total: 945 },
        couponCode: 'FESTIVE300',
      }),
    )
    render(<BookingPage pnr="DISC012345" />)

    expect(screen.getByText(/Discount \(FESTIVE300\)/)).toBeInTheDocument()
    expect(screen.getByText('-₹300')).toBeInTheDocument()
    expect(screen.getByText('₹945')).toBeInTheDocument()
  })

  it('still shows the full ticket on a fresh lookup against localStorage (simulating a reload)', () => {
    addBooking(makeBooking({ pnr: 'RELOAD0001' }))
    const { unmount } = render(<BookingPage pnr="RELOAD0001" />)
    unmount()

    render(<BookingPage pnr="RELOAD0001" />)
    expect(screen.getByText('RELOAD0001')).toBeInTheDocument()
  })

  it('calls window.print when "Print ticket" is clicked', () => {
    addBooking(makeBooking({ pnr: 'PRINTME001' }))
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<BookingPage pnr="PRINTME001" />)

    fireEvent.click(screen.getByRole('button', { name: 'Print ticket' }))

    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })
})
