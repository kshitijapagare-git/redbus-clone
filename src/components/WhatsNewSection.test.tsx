import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WhatsNewSection from './WhatsNewSection'
import { whatsNewItems } from '../data'
import { mockCarouselLayout } from '../test-utils/carouselLayout'

describe('WhatsNewSection', () => {
  it('renders a card for each whats-new item from data', () => {
    render(<WhatsNewSection />)

    whatsNewItems.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.description)).toBeInTheDocument()
    })
  })

  it('scrolls through the cards via the carousel controls, hiding Prev at the start and Next at the end', () => {
    const { container } = render(<WhatsNewSection />)
    // One card visible at a time, so it takes (length - 1) steps to reach the end.
    mockCarouselLayout(container, { clientWidth: 100, step: 100 })

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()

    for (let i = 0; i < whatsNewItems.length - 1; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    }

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
  })
})
