import { useState } from 'react'
import type { FormEvent } from 'react'
import { buses, busesSeats } from '../data'
import { parseSelectedSeatIds, sortSeatIds } from '../lib/seatSelection'
import {
  validateEmail,
  validateMobileNumber,
  validatePassengerAge,
  validatePassengerGender,
  validatePassengerName,
} from '../lib/passengerValidation'
import type { BusSeatMap } from '../types'

export interface PassengerDetailsPageProps {
  busId: number
}

interface PassengerFormValues {
  name: string
  age: string
  gender: string
}

const EMPTY_PASSENGER: PassengerFormValues = { name: '', age: '', gender: '' }

function seatWomenOnly(seatMap: BusSeatMap, seatId: string): boolean {
  const allSeats = [...seatMap.decks.lower, ...(seatMap.decks.upper ?? [])]
  return allSeats.find((s) => s.id === seatId)?.womenOnly ?? false
}

/**
 * The passenger-details step reached from SeatSelectionPage's Continue
 * action: one form per seat id in the URL's `seats` param (in
 * `sortSeatIds` order), plus a single shared contact email/mobile. Seat ids
 * are re-read from `window.location.search` on every render rather than
 * stored in local state, so adding/removing a seat (by navigating back and
 * changing the selection, then returning here) updates the list of forms
 * without discarding already-entered values for seats that remain — those
 * values live in `passengers`, keyed by seat id.
 */
function PassengerDetailsPage({ busId }: PassengerDetailsPageProps) {
  const bus = buses.find((b) => b.id === busId)
  const seatMap = busesSeats[busId]

  const [passengers, setPassengers] = useState<Record<string, PassengerFormValues>>({})
  const [contact, setContact] = useState({ email: '', mobile: '' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!bus || !seatMap) {
    return (
      <main className="passenger-details-page">
        <div className="container">
          <h1>Passenger details</h1>
          <p role="alert">Bus not found.</p>
        </div>
      </main>
    )
  }

  const seatIds = sortSeatIds(parseSelectedSeatIds(window.location.search))

  const getPassenger = (seatId: string): PassengerFormValues => passengers[seatId] ?? EMPTY_PASSENGER

  const updatePassengerField = (seatId: string, field: keyof PassengerFormValues, value: string) => {
    setPassengers((prev) => ({ ...prev, [seatId]: { ...getPassenger(seatId), [field]: value } }))
  }

  const markTouched = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const shouldShowError = (key: string) => touched[key] || submitted

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="passenger-details-page">
      <div className="container passenger-details-page-inner">
        <h1>Passenger details</h1>
        <p className="passenger-details-bus-summary">
          {bus.operatorName} · {bus.busType}
        </p>

        <form className="passenger-form" onSubmit={handleSubmit} noValidate>
          <div className="passenger-form-grid">
            {seatIds.map((seatId) => {
              const womenOnly = seatWomenOnly(seatMap, seatId)
              const passenger = getPassenger(seatId)

              const nameKey = `${seatId}-name`
              const ageKey = `${seatId}-age`
              const genderKey = `${seatId}-gender`

              const nameError = validatePassengerName(passenger.name)
              const ageError = validatePassengerAge(passenger.age)
              const genderError = validatePassengerGender(passenger.gender, womenOnly)

              return (
                <fieldset key={seatId} className="passenger-seat-card">
                  <legend>
                    Seat {seatId}
                    {womenOnly ? ' (women-only)' : ''}
                  </legend>

                  <div className="passenger-field">
                    <label htmlFor={`passenger-${seatId}-name`}>Name</label>
                    <input
                      id={`passenger-${seatId}-name`}
                      type="text"
                      value={passenger.name}
                      onChange={(e) => updatePassengerField(seatId, 'name', e.target.value)}
                      onBlur={() => markTouched(nameKey)}
                    />
                    {shouldShowError(nameKey) && nameError && <span className="field-error">{nameError}</span>}
                  </div>

                  <div className="passenger-field">
                    <label htmlFor={`passenger-${seatId}-age`}>Age</label>
                    <input
                      id={`passenger-${seatId}-age`}
                      type="text"
                      inputMode="numeric"
                      value={passenger.age}
                      onChange={(e) => updatePassengerField(seatId, 'age', e.target.value)}
                      onBlur={() => markTouched(ageKey)}
                    />
                    {shouldShowError(ageKey) && ageError && <span className="field-error">{ageError}</span>}
                  </div>

                  <div className="passenger-field">
                    <label htmlFor={`passenger-${seatId}-gender`}>Gender</label>
                    <select
                      id={`passenger-${seatId}-gender`}
                      value={passenger.gender}
                      onChange={(e) => updatePassengerField(seatId, 'gender', e.target.value)}
                      onBlur={() => markTouched(genderKey)}
                    >
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                    {shouldShowError(genderKey) && genderError && (
                      <span className="field-error">{genderError}</span>
                    )}
                  </div>
                </fieldset>
              )
            })}
          </div>

          <fieldset className="passenger-contact-card">
            <legend>Contact details</legend>

            <div className="passenger-field">
              <label htmlFor="passenger-contact-email">Email</label>
              <input
                id="passenger-contact-email"
                type="text"
                value={contact.email}
                onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                onBlur={() => markTouched('contact-email')}
              />
              {shouldShowError('contact-email') && validateEmail(contact.email) && (
                <span className="field-error">{validateEmail(contact.email)}</span>
              )}
            </div>

            <div className="passenger-field">
              <label htmlFor="passenger-contact-mobile">Mobile number</label>
              <input
                id="passenger-contact-mobile"
                type="text"
                inputMode="numeric"
                value={contact.mobile}
                onChange={(e) => setContact((prev) => ({ ...prev, mobile: e.target.value }))}
                onBlur={() => markTouched('contact-mobile')}
              />
              {shouldShowError('contact-mobile') && validateMobileNumber(contact.mobile) && (
                <span className="field-error">{validateMobileNumber(contact.mobile)}</span>
              )}
            </div>
          </fieldset>

          <button type="submit" className="passenger-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </main>
  )
}

export default PassengerDetailsPage
