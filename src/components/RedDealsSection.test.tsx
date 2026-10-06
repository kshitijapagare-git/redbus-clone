import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RedDealsSection from './RedDealsSection'

describe('RedDealsSection', () => {
  it('renders the headline and stats', () => {
    render(<RedDealsSection />)

    expect(screen.getByText('Unlock Unbeatable Exclusive redDeals! 20% OFF')).toBeInTheDocument()
    expect(screen.getByText('1749 Deals . 1029 Bus Operators . 671941 Routes')).toBeInTheDocument()
  })

  it('scrolls the search card into view when Book now is clicked', () => {
    document.body.innerHTML = '<div id="search-card"></div>'
    const target = document.getElementById('search-card') as HTMLElement
    const scrollIntoView = vi.fn()
    target.scrollIntoView = scrollIntoView

    const { container } = render(<RedDealsSection />, { container: document.body.appendChild(document.createElement('div')) })

    const button = screen.getByRole('button', { name: 'Book now' })
    button.click()

    expect(scrollIntoView).toHaveBeenCalled()
    container.remove()
  })
})
