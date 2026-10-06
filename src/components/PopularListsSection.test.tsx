import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PopularListsSection from './PopularListsSection'
import { popularBusOperators, popularBusRoutes, popularCities } from '../data'

describe('PopularListsSection', () => {
  it('renders the three list titles, all collapsed by default', () => {
    render(<PopularListsSection />)

    const routesToggle = screen.getByRole('button', { name: /Popular Bus Routes/ })
    const citiesToggle = screen.getByRole('button', { name: /Popular Cities/ })
    const operatorsToggle = screen.getByRole('button', { name: /Popular Bus Operators/ })

    expect(routesToggle).toHaveAttribute('aria-expanded', 'false')
    expect(citiesToggle).toHaveAttribute('aria-expanded', 'false')
    expect(operatorsToggle).toHaveAttribute('aria-expanded', 'false')

    expect(screen.queryByText(popularBusRoutes[0])).not.toBeInTheDocument()
    expect(screen.queryByText(popularCities[0])).not.toBeInTheDocument()
    expect(screen.queryByText(popularBusOperators[0])).not.toBeInTheDocument()
  })

  it('toggles a list open and closed, showing/hiding its items', () => {
    render(<PopularListsSection />)

    const routesToggle = screen.getByRole('button', { name: /Popular Bus Routes/ })

    fireEvent.click(routesToggle)
    expect(routesToggle).toHaveAttribute('aria-expanded', 'true')
    popularBusRoutes.forEach((route) => {
      expect(screen.getByText(route)).toBeInTheDocument()
    })

    fireEvent.click(routesToggle)
    expect(routesToggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(popularBusRoutes[0])).not.toBeInTheDocument()
  })

  it('toggles each list independently', () => {
    render(<PopularListsSection />)

    const routesToggle = screen.getByRole('button', { name: /Popular Bus Routes/ })
    const citiesToggle = screen.getByRole('button', { name: /Popular Cities/ })

    fireEvent.click(routesToggle)
    expect(routesToggle).toHaveAttribute('aria-expanded', 'true')
    expect(citiesToggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(citiesToggle)
    expect(citiesToggle).toHaveAttribute('aria-expanded', 'true')
    expect(routesToggle).toHaveAttribute('aria-expanded', 'true')
  })
})
