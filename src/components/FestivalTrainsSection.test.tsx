import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import FestivalTrainsSection from './FestivalTrainsSection'
import { festivalMonths } from '../data'

describe('FestivalTrainsSection', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('renders the core copy and month cards from data', () => {
    render(<FestivalTrainsSection />)

    expect(screen.getByText('Book now to get confirmed ticket')).toBeInTheDocument()
    expect(screen.getByText('Get ₹60 off using code SUPERB60')).toBeInTheDocument()
    expect(screen.getByText('Authorised IRCTC partner')).toBeInTheDocument()

    festivalMonths.forEach((month) => {
      expect(screen.getByText(month.monthLabel)).toBeInTheDocument()
      expect(screen.getByText(month.festivalName)).toBeInTheDocument()
    })
  })

  it('highlights the clicked month card and un-highlights the other', () => {
    render(<FestivalTrainsSection />)

    const novButton = screen.getByText('Nov').closest('button') as HTMLButtonElement
    const decButton = screen.getByText('Dec').closest('button') as HTMLButtonElement

    expect(novButton).toHaveClass('active')
    expect(decButton).not.toHaveClass('active')

    fireEvent.click(decButton)

    expect(decButton).toHaveClass('active')
    expect(novButton).not.toHaveClass('active')
  })

  it('navigates to /trains when "Book trains now" is clicked', () => {
    render(<FestivalTrainsSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Book trains now' }))

    expect(window.location.pathname).toBe('/trains')
  })
})
