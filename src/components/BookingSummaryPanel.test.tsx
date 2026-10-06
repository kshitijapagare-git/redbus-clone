import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BookingSummaryPanel from './BookingSummaryPanel'
import type { BoardingPoint } from '../types'

const boardingPoint: BoardingPoint = {
  id: 1,
  name: 'Shivajinagar',
  address: 'FC Road',
  landmark: 'Near Modern Cafe',
  cityId: 1,
}

const droppingPoint: BoardingPoint = {
  id: 7,
  name: 'Majestic',
  address: 'Kempegowda Bus Station',
  landmark: 'Opp. Railway Station',
  cityId: 2,
}

describe('BookingSummaryPanel', () => {
  it('shows the selected seat numbers in canonical order', () => {
    render(
      <BookingSummaryPanel
        seatIds={['U1', 'L2']}
        boardingPoint={null}
        droppingPoint={null}
        fare={800}
        onContinue={() => {}}
      />,
    )

    expect(screen.getByText('L2, U1')).toBeInTheDocument()
  })

  it('shows "None selected" when no seats are chosen', () => {
    render(
      <BookingSummaryPanel seatIds={[]} boardingPoint={null} droppingPoint={null} fare={800} onContinue={() => {}} />,
    )

    expect(screen.getByText('None selected')).toBeInTheDocument()
  })

  it('shows the boarding and dropping point names when chosen', () => {
    render(
      <BookingSummaryPanel
        seatIds={['L1']}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        fare={800}
        onContinue={() => {}}
      />,
    )

    expect(screen.getByText('Shivajinagar')).toBeInTheDocument()
    expect(screen.getByText('Majestic')).toBeInTheDocument()
  })

  it('computes base fare, GST and total via computeFare', () => {
    render(
      <BookingSummaryPanel
        seatIds={['L1', 'L2']}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        fare={800}
        onContinue={() => {}}
      />,
    )

    expect(screen.getByText('₹1600')).toBeInTheDocument()
    expect(screen.getByText('₹80')).toBeInTheDocument()
    expect(screen.getByText('₹1680')).toBeInTheDocument()
  })

  it('disables Continue until seats, boarding point and dropping point are all chosen', () => {
    const { rerender } = render(
      <BookingSummaryPanel seatIds={[]} boardingPoint={null} droppingPoint={null} fare={800} onContinue={() => {}} />,
    )

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    rerender(
      <BookingSummaryPanel
        seatIds={['L1']}
        boardingPoint={boardingPoint}
        droppingPoint={null}
        fare={800}
        onContinue={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    rerender(
      <BookingSummaryPanel
        seatIds={['L1']}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        fare={800}
        onContinue={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled()
  })

  it('calls onContinue when enabled and clicked', () => {
    const onContinue = vi.fn()
    render(
      <BookingSummaryPanel
        seatIds={['L1']}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        fare={800}
        onContinue={onContinue}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onContinue).toHaveBeenCalled()
  })

  it('updates the total aria-live text when the figures change', () => {
    const { rerender } = render(
      <BookingSummaryPanel
        seatIds={['L1']}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        fare={800}
        onContinue={() => {}}
      />,
    )

    expect(screen.getByText('₹840')).toBeInTheDocument()

    rerender(
      <BookingSummaryPanel
        seatIds={['L1', 'L2']}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        fare={800}
        onContinue={() => {}}
      />,
    )

    expect(screen.getByText('₹1680')).toBeInTheDocument()
  })
})
