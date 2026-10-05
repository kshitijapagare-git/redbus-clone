import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HotelsPage from './HotelsPage'

describe('HotelsPage', () => {
  it('renders the hero headline', () => {
    render(<HotelsPage />)
    expect(screen.getByRole('heading', { name: 'Pocket friendly, Verified stays' })).toBeInTheDocument()
  })

  it('renders the "30000+ affordable stays" line with a building icon', () => {
    render(<HotelsPage />)
    expect(screen.getByText(/30000\+ affordable stays/)).toBeInTheDocument()
    expect(screen.getByText('🏢')).toBeInTheDocument()
  })

  it('does not render the old "coming soon" placeholder text', () => {
    render(<HotelsPage />)
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
  })

  it('renders the hotel search card fields', () => {
    render(<HotelsPage />)
    expect(screen.getByRole('combobox', { name: 'City, area or hotel name' })).toBeInTheDocument()
    expect(screen.getByLabelText('Check in')).toBeInTheDocument()
    expect(screen.getByLabelText('Check out')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no\. of rooms & guests/i })).toBeInTheDocument()
  })
})
