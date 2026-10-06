import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SeatSelectionPage from './SeatSelectionPage'

describe('SeatSelectionPage', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/search/3/seats')
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('shows a not-found alert for an unknown bus id', () => {
    render(<SeatSelectionPage busId={9999} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Bus not found.')
  })

  it('renders the bus summary, seat map and point pickers for a known bus', () => {
    render(<SeatSelectionPage busId={3} />)

    expect(screen.getByText(/Orange Travels/)).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Boarding point' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Dropping point' })).toBeInTheDocument()
  })

  it('restores seats, boarding point and dropping point from the URL on load', () => {
    window.history.replaceState(null, '', '/search/3/seats?seats=L2,U3&bp=1&dp=3')
    render(<SeatSelectionPage busId={3} />)

    expect(screen.getByRole('button', { name: /Seat L2,.*selected/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Seat U3,.*selected/ })).toBeInTheDocument()
    const summaryPanel = screen.getByRole('complementary', { name: 'Booking summary' })
    expect(within(summaryPanel).getByText('Shivajinagar')).toBeInTheDocument()
    expect(within(summaryPanel).getByText('Majestic')).toBeInTheDocument()
  })

  it('silently drops a booked or nonexistent seat id from the URL', () => {
    // Bus 3's seat map (src/data/seats.ts) books L1 and U2; Z9 does not exist.
    window.history.replaceState(null, '', '/search/3/seats?seats=L2,L1,Z9')
    render(<SeatSelectionPage busId={3} />)

    expect(window.location.search).toContain('seats=L2')
    expect(window.location.search).not.toContain('L1')
    expect(window.location.search).not.toContain('Z9')
  })

  it('keeps Continue disabled until a seat, boarding point and dropping point are all chosen', () => {
    render(<SeatSelectionPage busId={3} />)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Seat L2,.*available/ }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    const boardingGroup = screen.getByRole('radiogroup', { name: 'Boarding point' })
    fireEvent.click(boardingGroup.querySelectorAll('[role="radio"]')[0])
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    const droppingGroup = screen.getByRole('radiogroup', { name: 'Dropping point' })
    fireEvent.click(droppingGroup.querySelectorAll('[role="radio"]')[0])
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled()
  })

  it('updates the summary figures live as the seat selection changes', () => {
    render(<SeatSelectionPage busId={3} />)

    fireEvent.click(screen.getByRole('button', { name: /Seat L2,.*available/ }))
    expect(screen.getByText('₹1200')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Seat L4,.*available/ }))
    expect(screen.getByText('₹2400')).toBeInTheDocument()
  })

  it('navigates to the passenger-details route with seats/bp/dp when Continue is clicked', () => {
    render(<SeatSelectionPage busId={3} />)

    fireEvent.click(screen.getByRole('button', { name: /Seat L2,.*available/ }))
    const boardingGroup = screen.getByRole('radiogroup', { name: 'Boarding point' })
    fireEvent.click(boardingGroup.querySelectorAll('[role="radio"]')[0])
    const droppingGroup = screen.getByRole('radiogroup', { name: 'Dropping point' })
    fireEvent.click(droppingGroup.querySelectorAll('[role="radio"]')[0])

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(window.location.pathname).toBe('/search/3/seats/passengers')
    expect(window.location.search).toContain('seats=L2')
    expect(window.location.search).toContain('bp=')
    expect(window.location.search).toContain('dp=')
  })
})
