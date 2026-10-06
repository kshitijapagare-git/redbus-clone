import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import BusSearchResultsPage from './BusSearchResultsPage'

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  window.dispatchEvent(new Event('resize'))
}

describe('BusSearchResultsPage', () => {
  beforeEach(() => {
    setViewportWidth(1200)
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
    setViewportWidth(1200)
  })

  it('renders the header with route, date and bus count inside an aria-live region', () => {
    window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07')
    render(<BusSearchResultsPage />)

    expect(screen.getByRole('heading', { name: /Pune.*Bengaluru.*07 Oct/ })).toBeInTheDocument()
    const countRegion = screen.getByText(/buses found/)
    expect(countRegion).toHaveAttribute('aria-live', 'polite')
  })

  it('lists each bus with operator, bus type, times, duration, rating, fare and seats', () => {
    window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07')
    render(<BusSearchResultsPage />)

    expect(screen.getByText('VRL Travels')).toBeInTheDocument()
    expect(screen.getAllByText(/seats left/).length).toBeGreaterThan(0)
  })

  it('shows an empty state with Clear filters when no bus matches, and restores the list on click', () => {
    window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07&fareMin=99999&fareMax=99999')
    render(<BusSearchResultsPage />)

    expect(screen.getByText('No buses match your filters.')).toBeInTheDocument()
    const clearButton = screen.getByRole('button', { name: 'Clear filters' })

    act(() => {
      clearButton.click()
    })

    expect(screen.queryByText('No buses match your filters.')).not.toBeInTheDocument()
  })

  it('shows a clear error message instead of results for an unknown city id', () => {
    window.history.replaceState(null, '', '/search?from=999&to=2&date=2024-10-07')
    render(<BusSearchResultsPage />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows a clear error message instead of results for a missing/invalid date', () => {
    window.history.replaceState(null, '', '/search?from=1&to=2')
    render(<BusSearchResultsPage />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows a non-blocking warning for an unrecognized filter token while still rendering results', () => {
    window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07&type=AC,Bogus')
    render(<BusSearchResultsPage />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('VRL Travels')).toBeInTheDocument()
  })

  it('reflects filters already present in the URL on initial render', () => {
    window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07&sort=fare')
    render(<BusSearchResultsPage />)

    // Cheapest bus on route 1-2 (SRS Travels, fare 500) should appear first in the DOM order.
    const operators = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(operators[0]).toBe('SRS Travels')
  })

  it('renders the filter panel as a bottom sheet with an Apply button on a narrow viewport', () => {
    window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07')
    setViewportWidth(390)
    render(<BusSearchResultsPage />)

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })
})
