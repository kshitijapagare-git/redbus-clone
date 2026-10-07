import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentPage from './PaymentPage'
import { clearBookingDraft, saveBookingDraft } from '../lib/bookingDraft'
import { addBooking } from '../lib/bookings'
import type { Booking } from '../types'

const PAYMENT_URL = '/search/3/seats/payment?seats=L2&bp=1&dp=3&date=2024-10-07'

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
    pnr: 'EXISTING01',
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

function renderPayment() {
  return render(<PaymentPage busId={3} />)
}

function fillCardFields(number: string, expiry = '12/30', cvv = '123') {
  fireEvent.change(screen.getByLabelText('Card number'), { target: { value: number } })
  fireEvent.change(screen.getByLabelText('Expiry (MM/YY)'), { target: { value: expiry } })
  fireEvent.change(screen.getByLabelText('CVV'), { target: { value: cvv } })
}

describe('PaymentPage', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', PAYMENT_URL)
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
    saveBookingDraft({
      passengers: { L2: { name: 'Asha', age: '30', gender: 'Female' } },
      contact: { email: 'asha@example.com', mobile: '9876543210' },
    })
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
    clearBookingDraft()
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
    vi.useRealTimers()
  })

  it('renders the bus, route, date, seats, boarding/dropping points and passenger details matching the fare calculation', () => {
    renderPayment()

    expect(screen.getByText(/Orange Travels/)).toBeInTheDocument()
    expect(screen.getByText(/Pune.*Bengaluru/)).toBeInTheDocument()
    expect(screen.getByText('L2')).toBeInTheDocument()
    expect(screen.getByText(/Shivajinagar/)).toBeInTheDocument()
    expect(screen.getByText(/Majestic/)).toBeInTheDocument()
    expect(screen.getByText(/Asha, 30, Female/)).toBeInTheDocument()
    // bus 3 fare is 1200, 1 seat: subtotal 1200, gst 60, total 1260
    expect(screen.getByText('₹1200')).toBeInTheDocument()
    expect(screen.getByText('₹60')).toBeInTheDocument()
    expect(screen.getByText('₹1260')).toBeInTheDocument()
  })

  it('applies a valid coupon and shows the discounted total', () => {
    renderPayment()

    fireEvent.change(screen.getByLabelText('Coupon code'), { target: { value: 'FESTIVE300' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByText(/Coupon FESTIVE300 applied/)).toBeInTheDocument()
    // subtotal 1200, discount 300 -> discounted subtotal 900, gst 45, total 945
    expect(screen.getByText('₹945')).toBeInTheDocument()
  })

  it('shows an inline error for an unrecognized/non-bus coupon code and applies no discount', () => {
    renderPayment()

    fireEvent.change(screen.getByLabelText('Coupon code'), { target: { value: 'TRAIN150' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByText('Invalid coupon code.')).toBeInTheDocument()
    expect(screen.getByText('₹1260')).toBeInTheDocument()
  })

  it('allows removing an applied coupon, restoring the pre-discount total', () => {
    renderPayment()

    fireEvent.change(screen.getByLabelText('Coupon code'), { target: { value: 'FESTIVE300' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(screen.getByText('₹945')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.queryByText(/Coupon FESTIVE300 applied/)).not.toBeInTheDocument()
    expect(screen.getByText('₹1260')).toBeInTheDocument()
  })

  it('keeps Pay disabled until the UPI id is valid', () => {
    renderPayment()

    expect(screen.getByRole('button', { name: /Pay/ })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('UPI ID'), { target: { value: 'john@okbank' } })

    expect(screen.getByRole('button', { name: /Pay/ })).not.toBeDisabled()
  })

  it('keeps Pay disabled until card number, expiry and CVV are all valid', () => {
    renderPayment()

    fireEvent.click(screen.getByRole('tab', { name: 'Card' }))
    expect(screen.getByRole('button', { name: /Pay/ })).toBeDisabled()

    fillCardFields('4242424242424242')

    expect(screen.getByRole('button', { name: /Pay/ })).not.toBeDisabled()
  })

  it('masks the card number once the field loses focus', () => {
    renderPayment()

    fireEvent.click(screen.getByRole('tab', { name: 'Card' }))
    const cardInput = screen.getByLabelText('Card number') as HTMLInputElement
    fireEvent.change(cardInput, { target: { value: '4111111111111234' } })
    fireEvent.blur(cardInput)

    expect(cardInput.value).toBe('•••• 1234')
  })

  it('requires a bank selection for net banking', () => {
    renderPayment()

    fireEvent.click(screen.getByRole('tab', { name: 'Net Banking' }))
    expect(screen.getByRole('button', { name: /Pay/ })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Bank'), { target: { value: 'HDFC Bank' } })

    expect(screen.getByRole('button', { name: /Pay/ })).not.toBeDisabled()
  })

  it('shows Processing… and blocks double-submit while the mock payment resolves', () => {
    vi.useFakeTimers()
    renderPayment()

    fireEvent.change(screen.getByLabelText('UPI ID'), { target: { value: 'john@okbank' } })
    const payButton = screen.getByRole('button', { name: /Pay/ })
    fireEvent.click(payButton)

    expect(screen.getByRole('button', { name: 'Processing…' })).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(window.location.pathname).toMatch(/^\/booking\//)
  })

  it('shows a failure message and Retry button for the mock-failure card, preserving entered values', () => {
    vi.useFakeTimers()
    renderPayment()

    fireEvent.click(screen.getByRole('tab', { name: 'Card' }))
    fillCardFields('4000000000000002')
    fireEvent.click(screen.getByRole('button', { name: /Pay/ }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed. You have not been charged.')
    const retryButton = screen.getByRole('button', { name: 'Retry' })
    expect(retryButton).toBeInTheDocument()

    expect((screen.getByLabelText('Card number') as HTMLInputElement).value).toBe('4000000000000002')

    fireEvent.click(retryButton)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect((screen.getByLabelText('Card number') as HTMLInputElement).value).toBe('4000000000000002')
  })

  it('shows a failure message for the mock-failure UPI id', () => {
    vi.useFakeTimers()
    renderPayment()

    fireEvent.change(screen.getByLabelText('UPI ID'), { target: { value: 'fail@bank' } })
    fireEvent.click(screen.getByRole('button', { name: /Pay/ }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed. You have not been charged.')
  })

  it('creates a Confirmed booking with a 10-character PNR and navigates to its e-ticket on success', () => {
    vi.useFakeTimers()
    renderPayment()

    fireEvent.change(screen.getByLabelText('UPI ID'), { target: { value: 'john@okbank' } })
    fireEvent.click(screen.getByRole('button', { name: /Pay/ }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    const match = /^\/booking\/([A-Z0-9]{10})$/.exec(window.location.pathname)
    expect(match).not.toBeNull()

    const stored = JSON.parse(localStorage.getItem('redbus:bookings') ?? '[]') as Booking[]
    expect(stored).toHaveLength(1)
    expect(stored[0].status).toBe('Confirmed')
    expect(stored[0].pnr).toBe(match?.[1])
  })

  it('redirects to the existing e-ticket instead of re-showing the form for an already-completed booking', () => {
    addBooking(makeBooking({ seatIds: ['L2'], date: '2024-10-07' }))
    renderPayment()

    expect(window.location.pathname).toBe('/booking/EXISTING01')
  })
})
