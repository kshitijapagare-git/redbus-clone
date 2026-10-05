import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import TrainsSearchPage from './TrainsSearchPage'

let originalLocation: Location

function setSearch(search: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, search },
  })
}

describe('TrainsSearchPage', () => {
  beforeEach(() => {
    originalLocation = window.location
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('shows the From and To station names resolved from the shared cities data', () => {
    setSearch('?from=1&to=2&date=2026-10-07')
    render(<TrainsSearchPage />)

    expect(screen.getByText(/Pune/)).toBeInTheDocument()
    expect(screen.getByText(/Bengaluru/)).toBeInTheDocument()
  })

  it('shows the date from the date query param', () => {
    setSearch('?from=1&to=2&date=2026-10-07')
    render(<TrainsSearchPage />)

    expect(screen.getByText(/2026-10-07/)).toBeInTheDocument()
  })

  it('indicates free cancellation was requested when freeCancellation=1 is present', () => {
    setSearch('?from=1&to=2&date=2026-10-07&freeCancellation=1')
    render(<TrainsSearchPage />)

    expect(screen.getByText('Free cancellation requested')).toBeInTheDocument()
  })

  it('does not indicate free cancellation when the param is absent', () => {
    setSearch('?from=1&to=2&date=2026-10-07')
    render(<TrainsSearchPage />)

    expect(screen.queryByText('Free cancellation requested')).not.toBeInTheDocument()
  })
})
