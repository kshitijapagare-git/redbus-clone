import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SeatMap from './SeatMap'
import type { BusSeatMap } from '../types'

const sleeperSeatMap: BusSeatMap = {
  mode: 'sleeper',
  decks: {
    lower: [
      { id: 'L1', label: '1', deck: 'lower', womenOnly: false },
      { id: 'L2', label: '2', deck: 'lower', womenOnly: true },
      { id: 'L3', label: '3', deck: 'lower', womenOnly: false },
    ],
    upper: [
      { id: 'U1', label: '1', deck: 'upper', womenOnly: false },
      { id: 'U2', label: '2', deck: 'upper', womenOnly: false },
    ],
  },
  booked: ['L3'],
}

const seaterSeatMap: BusSeatMap = {
  mode: 'seater',
  decks: {
    lower: [
      { id: 'L1', label: '1', deck: 'lower', womenOnly: false },
      { id: 'L2', label: '2', deck: 'lower', womenOnly: false },
    ],
  },
  booked: [],
}

describe('SeatMap', () => {
  it('labels each seat with its id, deck and actual state', () => {
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={['L1']}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    expect(screen.getByRole('button', { name: 'Seat L1, lower deck, selected' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Seat L2, lower deck, women-only' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Seat L3, lower deck, booked' })).toBeInTheDocument()
  })

  it('renders a legend listing the four seat states', () => {
    render(
      <SeatMap
        seatMap={seaterSeatMap}
        selectedSeatIds={[]}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Booked')).toBeInTheDocument()
    expect(screen.getByText('Women-only')).toBeInTheDocument()
    expect(screen.getByText('Selected')).toBeInTheDocument()
  })

  it('does not call onSelectSeat for a booked seat on click or Enter/Space', () => {
    const onSelectSeat = vi.fn()
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={[]}
        onSelectSeat={onSelectSeat}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    const bookedSeat = screen.getByRole('button', { name: 'Seat L3, lower deck, booked' })
    fireEvent.click(bookedSeat)
    fireEvent.keyDown(bookedSeat, { key: 'Enter' })
    fireEvent.keyDown(bookedSeat, { key: ' ' })

    expect(onSelectSeat).not.toHaveBeenCalled()
    expect(bookedSeat).toBeDisabled()
  })

  it('displays the parent-supplied limit message without altering the current selection', () => {
    render(
      <SeatMap
        seatMap={seaterSeatMap}
        selectedSeatIds={['L1']}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage="You can select up to 6 seats"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('You can select up to 6 seats')
    expect(screen.getByRole('button', { name: 'Seat L1, lower deck, selected' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Seat L2, lower deck, available' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('shows the women-only tooltip with the fixed text on click when booking-for-women is off', () => {
    const onSelectSeat = vi.fn()
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={[]}
        onSelectSeat={onSelectSeat}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    const womenSeat = screen.getByRole('button', { name: 'Seat L2, lower deck, women-only' })
    fireEvent.click(womenSeat)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent("Women-only seat. Turn on 'Booking for women' to select.")
    expect(womenSeat).toHaveAttribute('aria-describedby', tooltip.id)
    expect(onSelectSeat).not.toHaveBeenCalled()
  })

  it('shows the women-only tooltip on keyboard focus when booking-for-women is off', () => {
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={[]}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    const womenSeat = screen.getByRole('button', { name: 'Seat L2, lower deck, women-only' })
    fireEvent.focus(womenSeat)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent("Women-only seat. Turn on 'Booking for women' to select.")
  })

  it('allows selecting a women-only seat when booking-for-women is enabled', () => {
    const onSelectSeat = vi.fn()
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={[]}
        onSelectSeat={onSelectSeat}
        womenBookingEnabled={true}
        limitMessage={null}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Seat L2, lower deck, women-only' }))

    expect(onSelectSeat).toHaveBeenCalledWith('L2')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('moves focus between seat buttons with arrow keys without changing selection', () => {
    const onSelectSeat = vi.fn()
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={['L1']}
        onSelectSeat={onSelectSeat}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    const l1 = screen.getByRole('button', { name: 'Seat L1, lower deck, selected' })
    const l2 = screen.getByRole('button', { name: 'Seat L2, lower deck, women-only' })
    l1.focus()

    fireEvent.keyDown(l1, { key: 'ArrowRight' })

    expect(l2).toHaveFocus()
    expect(onSelectSeat).not.toHaveBeenCalled()
  })

  it('marks selected seats with aria-pressed="true"', () => {
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={['L1']}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    expect(screen.getByRole('button', { name: 'Seat L1, lower deck, selected' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows Lower/Upper deck tabs only when the seat map has an upper deck', () => {
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={[]}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )
    expect(screen.getByRole('tab', { name: 'Lower' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Upper' })).toBeInTheDocument()
  })

  it('does not show deck tabs for a seater-only bus', () => {
    render(
      <SeatMap
        seatMap={seaterSeatMap}
        selectedSeatIds={[]}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('keeps selected seats on the hidden deck marked selected when switching decks and back', () => {
    render(
      <SeatMap
        seatMap={sleeperSeatMap}
        selectedSeatIds={['L1', 'U1']}
        onSelectSeat={() => {}}
        womenBookingEnabled={false}
        limitMessage={null}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Upper' }))
    expect(screen.getByRole('button', { name: 'Seat U1, upper deck, selected' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Lower' }))
    expect(screen.getByRole('button', { name: 'Seat L1, lower deck, selected' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
