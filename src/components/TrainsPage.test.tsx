import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TrainsPage from './TrainsPage'

describe('TrainsPage', () => {
  it('shows the Train Ticket Booking heading', () => {
    render(<TrainsPage />)
    expect(screen.getByRole('heading', { name: 'Train Ticket Booking' })).toBeInTheDocument()
  })

  it('shows the IRCTC Authorised Partner badge', () => {
    render(<TrainsPage />)
    expect(screen.getByText(/IRCTC Authorised Partner/)).toBeInTheDocument()
  })

  it('renders the train illustration as aria-hidden so screen readers skip it', () => {
    render(<TrainsPage />)
    const illustration = document.querySelector('.train-illustration')
    expect(illustration).not.toBeNull()
    expect(illustration).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows the quiz tab banner above the search card', () => {
    render(<TrainsPage />)
    const banner = screen.getByText('Book Ticket, Play Quiz & Win Real Gold!')
    const searchCard = document.querySelector('.train-search-card')
    expect(banner).toBeInTheDocument()
    expect(searchCard).not.toBeNull()
    // eslint-disable-next-line no-bitwise
    expect(banner.compareDocumentPosition(searchCard as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('no longer renders the old "coming soon" placeholder text', () => {
    render(<TrainsPage />)
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Check back shortly to plan your next train journey/i)).not.toBeInTheDocument()
  })

  it('shows the TrainsSearchCard station fields and date chips', () => {
    render(<TrainsPage />)
    expect(screen.getByRole('combobox', { name: 'From' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'To' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Day After' })).toBeInTheDocument()
  })

  it('shows the Offers component content below the search card', () => {
    render(<TrainsPage />)
    expect(screen.getByRole('heading', { name: 'Exciting offers and discounts' })).toBeInTheDocument()
  })
})
