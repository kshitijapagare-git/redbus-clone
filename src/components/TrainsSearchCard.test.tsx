import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import TrainsSearchCard from './TrainsSearchCard'
import { addDays } from '../lib/hotelDates'
import { toDateKey } from '../lib/recentSearches'
import { formatTrainDate } from '../lib/trainDates'

let originalLocation: Location

function selectCity(input: HTMLElement, typed: string, optionName: string) {
  fireEvent.change(input, { target: { value: typed } })
  const option = screen.getAllByRole('option').find((o) => o.textContent?.includes(optionName))
  if (!option) throw new Error(`No option found containing "${optionName}"`)
  fireEvent.mouseDown(option)
}

describe('TrainsSearchCard', () => {
  beforeEach(() => {
    originalLocation = window.location
    // jsdom doesn't implement real navigation, and assigning to
    // window.location.href directly logs a "not implemented" error. Replace
    // location with a plain writable object so the component's navigation
    // assignment can be observed without triggering that.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: originalLocation.href },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('suggests Pune when typing "pu" in the From field and selects it', () => {
    render(<TrainsSearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })

    const option = screen.getByRole('option')
    expect(option).toHaveTextContent('Pune')

    fireEvent.mouseDown(option)
    expect(fromInput).toHaveValue('Pune')
  })

  it('shows an error next to the From field when it is left empty and Search Trains is clicked', () => {
    render(<TrainsSearchCard />)
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(toInput, 'ben', 'Bengaluru')

    fireEvent.click(screen.getByRole('button', { name: /search trains/i }))

    expect(screen.getByText('Please select a departure station')).toBeInTheDocument()
  })

  it('shows an error next to the To field when it is left empty and Search Trains is clicked', () => {
    render(<TrainsSearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    selectCity(fromInput, 'pu', 'Pune')

    fireEvent.click(screen.getByRole('button', { name: /search trains/i }))

    expect(screen.getByText('Please select a destination station')).toBeInTheDocument()
  })

  it('shows an error on both fields when the same station is chosen for From and To', () => {
    render(<TrainsSearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(fromInput, 'pu', 'Pune')
    selectCity(toInput, 'pu', 'Pune')

    fireEvent.click(screen.getByRole('button', { name: /search trains/i }))

    expect(screen.getAllByText('From and To stations must be different')).toHaveLength(2)
  })

  it('defaults Date of Journey to today formatted as DD MMM, YYYY', () => {
    render(<TrainsSearchCard />)
    expect(screen.getByText(formatTrainDate(new Date()))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveClass('chip-active')
  })

  it('updates the displayed date and highlights the chip when Tomorrow is clicked', () => {
    render(<TrainsSearchCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Tomorrow' }))

    expect(screen.getByText(formatTrainDate(addDays(new Date(), 1)))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveClass('chip-active')
  })

  it('updates the displayed date and highlights the chip when Day After is clicked, crossing a month boundary', () => {
    render(<TrainsSearchCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Day After' }))

    expect(screen.getByText(formatTrainDate(addDays(new Date(), 2)))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Day After' })).toHaveClass('chip-active')
  })

  it('defaults the Free Cancellation toggle to off and shows the fee text', () => {
    render(<TrainsSearchCard />)
    const toggle = screen.getByRole('switch', { name: 'Free Cancellation' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('₹0 cancellation fee')).toBeInTheDocument()
  })

  it('toggles aria-checked when the Free Cancellation switch is clicked', () => {
    render(<TrainsSearchCard />)
    const toggle = screen.getByRole('switch', { name: 'Free Cancellation' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('navigates to /trains/search with from, to and date when valid, without freeCancellation when off', () => {
    render(<TrainsSearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(fromInput, 'pu', 'Pune')
    selectCity(toInput, 'ben', 'Bengaluru')

    fireEvent.click(screen.getByRole('button', { name: /search trains/i }))

    expect(window.location.href).toContain(`/trains/search?from=1&to=2&date=${toDateKey(new Date())}`)
    expect(window.location.href).not.toContain('freeCancellation')
  })

  it('appends freeCancellation=1 when the toggle is on at submit time', () => {
    render(<TrainsSearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(fromInput, 'pu', 'Pune')
    selectCity(toInput, 'ben', 'Bengaluru')
    fireEvent.click(screen.getByRole('switch', { name: 'Free Cancellation' }))

    fireEvent.click(screen.getByRole('button', { name: /search trains/i }))

    expect(window.location.href).toContain('freeCancellation=1')
  })
})
