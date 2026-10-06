import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GovernmentBusesSection from './GovernmentBusesSection'
import { governmentBusOperators } from '../data'
import { mockCarouselLayout } from '../test-utils/carouselLayout'

describe('GovernmentBusesSection', () => {
  it('renders a card for each government bus operator from data', () => {
    render(<GovernmentBusesSection />)

    governmentBusOperators.forEach((operator) => {
      expect(screen.getByRole('heading', { level: 3, name: operator.name })).toBeInTheDocument()
      expect(screen.getByText(operator.localName)).toBeInTheDocument()
      expect(screen.getByText(`★ ${operator.rating}`)).toBeInTheDocument()
      expect(screen.getByText(operator.partnerText)).toBeInTheDocument()
    })

    expect(screen.getAllByText('24*7 customer service (Call or chat)')).toHaveLength(governmentBusOperators.length)
  })

  it('scrolls through the cards via the carousel controls, hiding Prev at the start and Next at the end', () => {
    const { container } = render(<GovernmentBusesSection />)
    // One card visible at a time, so it takes (length - 1) steps to reach the end.
    mockCarouselLayout(container, { clientWidth: 100, step: 100 })

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()

    for (let i = 0; i < governmentBusOperators.length - 1; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    }

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
  })
})
