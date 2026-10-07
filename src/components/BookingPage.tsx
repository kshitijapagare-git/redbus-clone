import { cities } from '../data'
import { findBookingByPnr } from '../lib/bookings'

export interface BookingPageProps {
  pnr: string
}

/**
 * The e-ticket page reached after a successful payment, at `/booking/:pnr`.
 * Looks the booking up fresh on every render via lib/bookings.ts's
 * findBookingByPnr (localStorage-backed, with an in-memory fallback for a
 * booking created this session when localStorage was unavailable), so a
 * reload reflects the real persisted state rather than any route/component
 * state. Shows 'Booking not found' for a PNR that can't be resolved.
 */
function BookingPage({ pnr }: BookingPageProps) {
  const booking = findBookingByPnr(pnr)

  if (!booking) {
    return (
      <main className="booking-ticket-page">
        <div className="container">
          <h1>Booking not found</h1>
          <p role="alert">Booking not found.</p>
        </div>
      </main>
    )
  }

  const fromCity = cities.find((c) => c.id === booking.fromCityId)
  const toCity = cities.find((c) => c.id === booking.toCityId)
  const unsaved = new URLSearchParams(window.location.search).get('unsaved') === '1'

  return (
    <main className="booking-ticket-page">
      <div className="container booking-ticket-page-inner">
        <div className="booking-ticket-head">
          <h1>E-ticket</h1>
          <button type="button" className="booking-ticket-print-btn" onClick={() => window.print()}>
            Print ticket
          </button>
        </div>

        {unsaved && (
          <p role="alert" className="booking-ticket-unsaved-note">
            This booking couldn't be saved on this device, but your ticket is shown below for this visit.
          </p>
        )}

        <section className="booking-ticket-card booking-ticket-print">
          <div className="booking-ticket-row booking-ticket-pnr-row">
            <span className="booking-ticket-label">PNR</span>
            <span className="booking-ticket-value">{booking.pnr}</span>
            <span className="booking-ticket-status">{booking.status}</span>
          </div>

          <p className="booking-ticket-bus">
            {booking.operatorName} · {booking.busType}
          </p>
          <p className="booking-ticket-route">
            {fromCity?.name} → {toCity?.name} · {booking.date}
          </p>

          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Departure</span>
            <span className="booking-ticket-value">{booking.departureTime}</span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Arrival</span>
            <span className="booking-ticket-value">{booking.arrivalTime}</span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Boarding point</span>
            <span className="booking-ticket-value">
              {booking.boardingPoint.name} — {booking.boardingPoint.address}, {booking.boardingPoint.landmark}
            </span>
          </div>
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Dropping point</span>
            <span className="booking-ticket-value">
              {booking.droppingPoint.name} — {booking.droppingPoint.address}, {booking.droppingPoint.landmark}
            </span>
          </div>

          <ul className="booking-ticket-passengers">
            {booking.passengers.map((p) => (
              <li key={p.seatId}>
                Seat {p.seatId}: {p.name}, {p.age}, {p.gender}
              </li>
            ))}
          </ul>

          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Base fare</span>
            <span className="booking-ticket-value">₹{booking.fare.subtotal}</span>
          </div>
          {booking.fare.discount > 0 && (
            <div className="booking-ticket-row booking-ticket-discount">
              <span className="booking-ticket-label">
                Discount{booking.couponCode ? ` (${booking.couponCode})` : ''}
              </span>
              <span className="booking-ticket-value">-₹{booking.fare.discount}</span>
            </div>
          )}
          <div className="booking-ticket-row">
            <span className="booking-ticket-label">GST (5%)</span>
            <span className="booking-ticket-value">₹{booking.fare.gst}</span>
          </div>
          <div className="booking-ticket-row booking-ticket-total">
            <span className="booking-ticket-label">Total</span>
            <span className="booking-ticket-value">₹{booking.fare.total}</span>
          </div>

          <div className="booking-ticket-row">
            <span className="booking-ticket-label">Contact</span>
            <span className="booking-ticket-value">
              {booking.contact.email} · {booking.contact.mobile}
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}

export default BookingPage
