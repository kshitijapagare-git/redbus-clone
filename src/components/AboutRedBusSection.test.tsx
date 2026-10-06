import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AboutRedBusSection from './AboutRedBusSection'
import { aboutRedBusSteps } from '../data'

describe('AboutRedBusSection', () => {
  it('renders the main heading and subsection headings', () => {
    render(<AboutRedBusSection />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: "redBus: India's Leading Online Bus Booking and Train Ticket Booking Platform",
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Why Choose redBus for Bus Booking?' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Why Choose redRail for Train Ticket Booking?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'How to Book Bus Tickets and Train Tickets Online on redBus?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Exclusive Offers on redBus' })).toBeInTheDocument()
  })

  it('renders the steps in order 1 through 7', () => {
    render(<AboutRedBusSection />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(aboutRedBusSteps.length)
    items.forEach((item, index) => {
      expect(item).toHaveTextContent(aboutRedBusSteps[index].text)
    })
  })

  it('renders real links for train ticket booking, PNR status and train running status', () => {
    render(<AboutRedBusSection />)

    const trainLink = screen.getByRole('link', { name: 'train ticket booking' })
    const pnrLink = screen.getByRole('link', { name: 'PNR status' })
    const runningStatusLink = screen.getByRole('link', { name: 'train running status' })

    expect(trainLink).toHaveAttribute('href')
    expect(pnrLink).toHaveAttribute('href')
    expect(runningStatusLink).toHaveAttribute('href')
  })
})
