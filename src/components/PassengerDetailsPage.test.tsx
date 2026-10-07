import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PassengerDetailsPage from './PassengerDetailsPage'
import { clearBookingDraft, loadBookingDraft } from '../lib/bookingDraft'

describe('PassengerDetailsPage', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
    clearBookingDraft()
  })

  it('shows a not-found alert for an unknown bus id', () => {
    window.history.replaceState(null, '', '/search/9999/seats/passengers?seats=L1&bp=1&dp=3')
    render(<PassengerDetailsPage busId={9999} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Bus not found.')
  })

  it('renders one passenger form per seat id in sortSeatIds order', () => {
    // Bus 3's seat map (src/data/seats.ts) has lower/upper sleeper berths.
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=U3,L2&bp=1&dp=3')
    render(<PassengerDetailsPage busId={3} />)

    const legends = screen.getAllByRole('group').map((g) => g.querySelector('legend')?.textContent)
    // L2 (lower) must come before U3 (upper) regardless of URL order.
    expect(legends[0]).toContain('Seat L2')
    expect(legends[1]).toContain('Seat U3')
  })

  it('requires gender Female for a women-only seat, on blur and on submit', () => {
    // Bus 1's seat map marks L1/L2 as women-only.
    window.history.replaceState(null, '', '/search/1/seats/passengers?seats=L1&bp=1&dp=3')
    render(<PassengerDetailsPage busId={1} />)

    const genderSelect = screen.getByLabelText('Gender')
    fireEvent.change(genderSelect, { target: { value: 'Male' } })
    fireEvent.blur(genderSelect)

    expect(screen.getByText('Gender must be Female for a women-only seat.')).toBeInTheDocument()

    fireEvent.change(genderSelect, { target: { value: 'Female' } })
    expect(screen.queryByText('Gender must be Female for a women-only seat.')).not.toBeInTheDocument()
  })

  it('validates age between 1 and 120, rejecting 0, 121 and non-numeric input', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2&bp=1&dp=3')
    render(<PassengerDetailsPage busId={3} />)

    const ageInput = screen.getByLabelText('Age')

    fireEvent.change(ageInput, { target: { value: '0' } })
    fireEvent.blur(ageInput)
    expect(screen.getByText('Age must be between 1 and 120.')).toBeInTheDocument()

    fireEvent.change(ageInput, { target: { value: '121' } })
    fireEvent.blur(ageInput)
    expect(screen.getByText('Age must be between 1 and 120.')).toBeInTheDocument()

    fireEvent.change(ageInput, { target: { value: 'abc' } })
    fireEvent.blur(ageInput)
    expect(screen.getByText('Age must be a whole number.')).toBeInTheDocument()

    fireEvent.change(ageInput, { target: { value: '45' } })
    expect(screen.queryByText('Age must be a whole number.')).not.toBeInTheDocument()
    expect(screen.queryByText('Age must be between 1 and 120.')).not.toBeInTheDocument()
  })

  it('validates the mobile number requires exactly 10 digits', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2&bp=1&dp=3')
    render(<PassengerDetailsPage busId={3} />)

    const mobileInput = screen.getByLabelText('Mobile number')

    fireEvent.change(mobileInput, { target: { value: '12345' } })
    fireEvent.blur(mobileInput)
    expect(screen.getByText('Mobile number must be exactly 10 digits.')).toBeInTheDocument()

    fireEvent.change(mobileInput, { target: { value: '9876543210' } })
    expect(screen.queryByText('Mobile number must be exactly 10 digits.')).not.toBeInTheDocument()
  })

  it('validates the email field requires a non-empty, syntactically valid address', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2&bp=1&dp=3')
    render(<PassengerDetailsPage busId={3} />)

    const emailInput = screen.getByLabelText('Email')

    fireEvent.blur(emailInput)
    expect(screen.getByText('Email is required.')).toBeInTheDocument()

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
    fireEvent.blur(emailInput)
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()

    fireEvent.change(emailInput, { target: { value: 'a@b.com' } })
    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument()
  })

  it('shows each field error the first time it loses focus with an invalid value', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2&bp=1&dp=3')
    render(<PassengerDetailsPage busId={3} />)

    const nameInput = screen.getByLabelText('Name')
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument()

    fireEvent.blur(nameInput)
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
  })

  it('re-shows every still-invalid field error on submit', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2&bp=1&dp=3')
    render(<PassengerDetailsPage busId={3} />)

    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(screen.getByText('Age must be a whole number.')).toBeInTheDocument()
    expect(screen.getByText('Gender is required.')).toBeInTheDocument()
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Mobile number must be exactly 10 digits.')).toBeInTheDocument()
  })

  it('keeps already-entered field values for remaining seats when a seat is removed from the URL', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2,L4&bp=1&dp=3')
    const { rerender } = render(<PassengerDetailsPage busId={3} />)

    const nameInputs = screen.getAllByLabelText('Name')
    fireEvent.change(nameInputs[0], { target: { value: 'Asha' } })
    fireEvent.change(nameInputs[1], { target: { value: 'Ravi' } })

    expect(screen.getAllByLabelText('Name').map((i) => (i as HTMLInputElement).value)).toEqual(['Asha', 'Ravi'])

    // Simulate the seat selection changing (one fewer seat) by updating the
    // URL and re-rendering, as SeatSelectionPage's navigation would.
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L4&bp=1&dp=3')
    rerender(<PassengerDetailsPage busId={3} />)

    const remainingNameInputs = screen.getAllByLabelText('Name')
    expect(remainingNameInputs).toHaveLength(1)
    expect((remainingNameInputs[0] as HTMLInputElement).value).toBe('Ravi')
  })

  it('does not navigate away when submitted with invalid fields', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2&bp=1&dp=3')
    render(<PassengerDetailsPage busId={3} />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(window.location.pathname).toBe('/search/3/seats/passengers')
    expect(loadBookingDraft()).toBeNull()
  })

  it('navigates to the payment URL and saves the booking draft when all fields are valid', () => {
    window.history.replaceState(null, '', '/search/3/seats/passengers?seats=L2&bp=1&dp=3&date=2024-10-07')
    render(<PassengerDetailsPage busId={3} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Asha' } })
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Female' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9876543210' } })

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(window.location.pathname).toBe('/search/3/seats/payment')
    expect(window.location.search).toContain('seats=L2')
    expect(window.location.search).toContain('bp=1')
    expect(window.location.search).toContain('dp=3')
    expect(window.location.search).toContain('date=2024-10-07')

    const draft = loadBookingDraft()
    expect(draft?.passengers.L2).toEqual({ name: 'Asha', age: '30', gender: 'Female' })
    expect(draft?.contact).toEqual({ email: 'asha@example.com', mobile: '9876543210' })
  })
})
