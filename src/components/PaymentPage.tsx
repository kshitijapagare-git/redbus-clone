import { useEffect, useMemo, useRef, useState } from 'react'
import { boardingPoints, buses, busesSeats, cities } from '../data'
import { coupons } from '../data/coupons'
import { clearBookingDraft, loadBookingDraft } from '../lib/bookingDraft'
import { addBooking, loadBookings } from '../lib/bookings'
import { validateCoupon } from '../lib/coupons'
import { computeFareWithDiscount } from '../lib/fareCalculation'
import {
  isMockPaymentFailure,
  maskCardNumber,
  validateCardExpiry,
  validateCardNumber,
  validateCvv,
  validateUpiId,
} from '../lib/paymentValidation'
import { generatePnr } from '../lib/pnr'
import { buildBookingUrl, navigateTo } from '../lib/route'
import { parseSelectedSeatIds, sortSeatIds } from '../lib/seatSelection'
import type { Booking, Passenger, PaymentMethodType } from '../types'

export interface PaymentPageProps {
  busId: number
}

const PROCESSING_DELAY_MS = 2000

const NETBANKING_BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank']

/**
 * Mock payment step reached from PassengerDetailsPage's submit. Reads
 * seats/bp/dp/date from its own URL and the passenger/contact draft saved by
 * PassengerDetailsPage (lib/bookingDraft.ts). Applies an optional coupon
 * (lib/coupons.ts) on top of the base fare (lib/fareCalculation.ts), then
 * validates one of three mock payment methods (lib/paymentValidation.ts)
 * before simulating a ~2s processing delay and a success/failure outcome.
 * On success, a Booking is created (lib/bookings.ts) with a freshly
 * generated PNR (lib/pnr.ts) and the page navigates to its e-ticket.
 *
 * Guards against a Back navigation re-triggering payment: if a Confirmed
 * booking already exists in localStorage for this exact
 * busId/seats/bp/dp/date, the page redirects straight to that booking's
 * e-ticket instead of rendering the form (the draft itself is cleared on
 * success, so this is checked against the persisted booking instead).
 */
function PaymentPage({ busId }: PaymentPageProps) {
  const bus = buses.find((b) => b.id === busId)
  const seatMap = busesSeats[busId]
  const searchParams = new URLSearchParams(window.location.search)
  const seatIds = sortSeatIds(parseSelectedSeatIds(window.location.search))
  const bpId = Number(searchParams.get('bp'))
  const dpId = Number(searchParams.get('dp'))
  const date = searchParams.get('date')
  const boardingPoint = boardingPoints.find((p) => p.id === bpId) ?? null
  const droppingPoint = boardingPoints.find((p) => p.id === dpId) ?? null
  const draft = loadBookingDraft()

  const [method, setMethod] = useState<PaymentMethodType>('upi')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardNumberMasked, setCardNumberMasked] = useState(false)
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [netbankingBank, setNetbankingBank] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentFailed, setPaymentFailed] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const existingBooking = useMemo(() => {
    if (!bus || boardingPoint === null || droppingPoint === null || seatIds.length === 0) return null
    const { bookings } = loadBookings()
    return (
      bookings.find(
        (b) =>
          b.busId === busId &&
          b.date === (date ?? '') &&
          b.boardingPoint.id === boardingPoint.id &&
          b.droppingPoint.id === droppingPoint.id &&
          b.seatIds.length === seatIds.length &&
          b.seatIds.every((id) => seatIds.includes(id)),
      ) ?? null
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busId, date, boardingPoint, droppingPoint, seatIds.join(',')])

  useEffect(() => {
    if (existingBooking) {
      navigateTo(buildBookingUrl(existingBooking.pnr))
    }
  }, [existingBooking])

  if (existingBooking) {
    return null
  }

  if (!bus || !seatMap || boardingPoint === null || droppingPoint === null || seatIds.length === 0 || !draft) {
    return (
      <main className="payment-page">
        <div className="container">
          <h1>Payment</h1>
          <p role="alert">Booking details not found.</p>
        </div>
      </main>
    )
  }

  const [fromCityIdRaw, toCityIdRaw] = bus.routeId.split('-')
  const fromCity = cities.find((c) => c.id === Number(fromCityIdRaw))
  const toCity = cities.find((c) => c.id === Number(toCityIdRaw))

  const discountAmount = appliedCoupon?.discountAmount ?? 0
  const fareBreakdown = computeFareWithDiscount(bus.fare, seatIds.length, discountAmount)

  const passengerRows = seatIds.map((seatId) => ({
    seatId,
    ...(draft.passengers[seatId] ?? { name: '', age: '', gender: '' }),
  }))

  const getMethodError = (): string | null => {
    if (method === 'upi') return validateUpiId(upiId)
    if (method === 'card') {
      return validateCardNumber(cardNumber) || validateCardExpiry(cardExpiry) || validateCvv(cardCvv)
    }
    return netbankingBank === '' ? 'Select a bank.' : null
  }

  const methodError = getMethodError()
  const canPay = methodError === null && !isProcessing

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponInput, busId, coupons)
    if (!result.valid) {
      setCouponError(result.error)
      setAppliedCoupon(null)
      return
    }
    setCouponError(null)
    setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discountAmount: result.discountAmount })
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
    setCouponInput('')
  }

  const handlePay = () => {
    if (getMethodError() !== null || isProcessing) return

    setPaymentFailed(false)
    setIsProcessing(true)

    timeoutRef.current = setTimeout(() => {
      const details: Record<string, string> =
        method === 'upi'
          ? { id: upiId }
          : method === 'card'
            ? { number: cardNumber, expiry: cardExpiry, cvv: cardCvv }
            : { bank: netbankingBank }

      if (isMockPaymentFailure(method, details)) {
        setIsProcessing(false)
        setPaymentFailed(true)
        return
      }

      const { bookings } = loadBookings()
      const existingPnrs = new Set(bookings.map((b) => b.pnr))
      const pnr = generatePnr(existingPnrs)

      const passengers: Passenger[] = seatIds.map((seatId) => {
        const p = draft.passengers[seatId] ?? { name: '', age: '', gender: '' }
        return { seatId, name: p.name, age: Number(p.age), gender: p.gender }
      })

      const booking: Booking = {
        pnr,
        status: 'Confirmed',
        busId: bus.id,
        operatorName: bus.operatorName,
        busType: bus.busType,
        fromCityId: Number(fromCityIdRaw),
        toCityId: Number(toCityIdRaw),
        date: date ?? '',
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        seatIds,
        boardingPoint,
        droppingPoint,
        passengers,
        contact: draft.contact,
        fare: {
          subtotal: fareBreakdown.subtotal,
          discount: fareBreakdown.discount,
          gst: fareBreakdown.gst,
          total: fareBreakdown.total,
        },
        couponCode: appliedCoupon?.code ?? null,
        createdAt: new Date().toISOString(),
      }

      const { saved } = addBooking(booking)
      clearBookingDraft()
      setIsProcessing(false)
      navigateTo(saved ? buildBookingUrl(pnr) : `${buildBookingUrl(pnr)}?unsaved=1`)
    }, PROCESSING_DELAY_MS)
  }

  return (
    <main className="payment-page">
      <div className="container payment-page-inner">
        <h1>Payment</h1>

        <section className="payment-summary" aria-label="Booking summary">
          <p className="payment-summary-bus">
            {bus.operatorName} · {bus.busType}
          </p>
          <p className="payment-summary-route">
            {fromCity?.name} → {toCity?.name}
            {date ? ` · ${date}` : ''}
          </p>

          <div className="payment-summary-row">
            <span className="payment-summary-label">Seats</span>
            <span className="payment-summary-value">{seatIds.join(', ')}</span>
          </div>
          <div className="payment-summary-row">
            <span className="payment-summary-label">Boarding point</span>
            <span className="payment-summary-value">
              {boardingPoint.name} — {boardingPoint.address}, {boardingPoint.landmark}
            </span>
          </div>
          <div className="payment-summary-row">
            <span className="payment-summary-label">Dropping point</span>
            <span className="payment-summary-value">
              {droppingPoint.name} — {droppingPoint.address}, {droppingPoint.landmark}
            </span>
          </div>

          <ul className="payment-summary-passengers">
            {passengerRows.map((p) => (
              <li key={p.seatId}>
                Seat {p.seatId}: {p.name}, {p.age}, {p.gender}
              </li>
            ))}
          </ul>

          <div className="payment-summary-row">
            <span className="payment-summary-label">
              Base fare ({bus.fare} × {seatIds.length})
            </span>
            <span className="payment-summary-value">₹{fareBreakdown.subtotal}</span>
          </div>
          {appliedCoupon && (
            <div className="payment-summary-row payment-summary-discount">
              <span className="payment-summary-label">Discount ({appliedCoupon.code})</span>
              <span className="payment-summary-value">-₹{fareBreakdown.discount}</span>
            </div>
          )}
          <div className="payment-summary-row">
            <span className="payment-summary-label">GST (5%)</span>
            <span className="payment-summary-value">₹{fareBreakdown.gst}</span>
          </div>
          <div className="payment-summary-row payment-summary-total">
            <span className="payment-summary-label">Total</span>
            <span className="payment-summary-value" aria-live="polite">
              ₹{fareBreakdown.total}
            </span>
          </div>

          <div className="payment-summary-row">
            <span className="payment-summary-label">Contact</span>
            <span className="payment-summary-value">
              {draft.contact.email} · {draft.contact.mobile}
            </span>
          </div>
        </section>

        <section className="payment-coupon" aria-label="Coupon">
          <label htmlFor="coupon-code">Coupon code</label>
          <input
            id="coupon-code"
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            disabled={appliedCoupon !== null}
          />
          {appliedCoupon === null ? (
            <button type="button" onClick={handleApplyCoupon}>
              Apply
            </button>
          ) : (
            <button type="button" onClick={handleRemoveCoupon}>
              Remove
            </button>
          )}
          {couponError && <span className="field-error">{couponError}</span>}
          {appliedCoupon && (
            <p className="payment-coupon-applied">
              Coupon {appliedCoupon.code} applied: -₹{appliedCoupon.discountAmount}
            </p>
          )}
        </section>

        <section className="payment-methods" aria-label="Payment method">
          <div className="payment-method-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={method === 'upi'} onClick={() => setMethod('upi')}>
              UPI
            </button>
            <button type="button" role="tab" aria-selected={method === 'card'} onClick={() => setMethod('card')}>
              Card
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === 'netbanking'}
              onClick={() => setMethod('netbanking')}
            >
              Net Banking
            </button>
          </div>

          {method === 'upi' && (
            <div className="payment-field">
              <label htmlFor="upi-id">UPI ID</label>
              <input id="upi-id" type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </div>
          )}

          {method === 'card' && (
            <>
              <div className="payment-field">
                <label htmlFor="card-number">Card number</label>
                <input
                  id="card-number"
                  type="text"
                  value={cardNumberMasked ? maskCardNumber(cardNumber) : cardNumber}
                  onChange={(e) => {
                    setCardNumber(e.target.value)
                    setCardNumberMasked(false)
                  }}
                  onFocus={() => setCardNumberMasked(false)}
                  onBlur={() => setCardNumberMasked(true)}
                />
              </div>
              <div className="payment-field">
                <label htmlFor="card-expiry">Expiry (MM/YY)</label>
                <input
                  id="card-expiry"
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              </div>
              <div className="payment-field">
                <label htmlFor="card-cvv">CVV</label>
                <input id="card-cvv" type="text" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
              </div>
            </>
          )}

          {method === 'netbanking' && (
            <div className="payment-field">
              <label htmlFor="netbanking-bank">Bank</label>
              <select
                id="netbanking-bank"
                value={netbankingBank}
                onChange={(e) => setNetbankingBank(e.target.value)}
              >
                <option value="">Select a bank</option>
                {NETBANKING_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {paymentFailed && (
          <div className="payment-failure" role="alert">
            <p>Payment failed. You have not been charged.</p>
            <button type="button" className="payment-retry-btn" onClick={() => setPaymentFailed(false)}>
              Retry
            </button>
          </div>
        )}

        <button type="button" className="payment-pay-btn" disabled={!canPay} onClick={handlePay}>
          {isProcessing ? 'Processing…' : `Pay ₹${fareBreakdown.total}`}
        </button>
      </div>
    </main>
  )
}

export default PaymentPage
