import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BusCard from './BusCard'
import type { Bus } from '../types'

const bus: Bus = {
  id: 1,
  routeId: '1-2',
  operatorName: 'VRL Travels',
  busType: 'AC Seater',
  departureTime: '05:30',
  arrivalTime: '14:00',
  durationMins: 510,
  fare: 800,
  seatsAvailable: 20,
  rating: 4.2,
  isWomenFriendly: true,
}

describe('BusCard', () => {
  it('renders the operator name, bus type, departure, arrival, duration, rating, fare and seats available', () => {
    render(
      <ul>
        <BusCard bus={bus} />
      </ul>,
    )

    expect(screen.getByText('VRL Travels')).toBeInTheDocument()
    expect(screen.getByText('AC Seater')).toBeInTheDocument()
    expect(screen.getByText('05:30')).toBeInTheDocument()
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.getByText('510 mins')).toBeInTheDocument()
    expect(screen.getByText('★ 4.2')).toBeInTheDocument()
    expect(screen.getByText('₹800')).toBeInTheDocument()
    expect(screen.getByText('20 seats left')).toBeInTheDocument()
  })
})
