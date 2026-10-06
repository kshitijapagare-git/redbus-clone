import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GetawaysSection from './GetawaysSection'
import { getaways } from '../data'

describe('GetawaysSection', () => {
  it('renders the headings', () => {
    render(<GetawaysSection />)

    expect(screen.getByRole('heading', { name: 'Introducing Getaways' })).toBeInTheDocument()
    expect(screen.getByText('Hey, ready for a weekend getaway?')).toBeInTheDocument()
    expect(screen.getByText('Handpicked destinations for you')).toBeInTheDocument()
  })

  it('renders a photo card for each getaway from data', () => {
    render(<GetawaysSection />)

    getaways.forEach((getaway) => {
      expect(screen.getByRole('heading', { name: getaway.name })).toBeInTheDocument()
    })
  })

  it('renders an Explore all button', () => {
    render(<GetawaysSection />)

    expect(screen.getByRole('button', { name: 'Explore all' })).toBeInTheDocument()
  })
})
