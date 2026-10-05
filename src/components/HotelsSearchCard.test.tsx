import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HotelsSearchCard from './HotelsSearchCard'
import { addDays, formatHotelDate } from '../lib/hotelDates'

function selectCity(input: HTMLElement, typed: string, optionName: string) {
  fireEvent.change(input, { target: { value: typed } })
  const option = screen.getAllByRole('option').find((o) => o.textContent?.includes(optionName))
  if (!option) throw new Error(`No option found containing "${optionName}"`)
  fireEvent.mouseDown(option)
}

describe('HotelsSearchCard', () => {
  it('selects a city via the autocomplete and shows its name in the field', () => {
    render(<HotelsSearchCard />)
    const cityInput = screen.getByRole('combobox', { name: 'City, area or hotel name' })
    selectCity(cityInput, 'pu', 'Pune')
    expect(cityInput).toHaveValue('Pune')
  })

  it('defaults check-in to today and check-out to the day after check-in', () => {
    render(<HotelsSearchCard />)
    const today = new Date()
    const tomorrow = addDays(today, 1)
    expect(screen.getByText(formatHotelDate(today))).toBeInTheDocument()
    expect(screen.getByText(formatHotelDate(tomorrow))).toBeInTheDocument()
  })

  it('moves check-out to the day after check-in when check-in changes to on/after the current check-out', () => {
    render(<HotelsSearchCard />)
    const checkInInput = screen.getByLabelText('Check in')
    const today = new Date()
    const newCheckIn = addDays(today, 5)
    const newCheckInKey = `${newCheckIn.getFullYear()}-${String(newCheckIn.getMonth() + 1).padStart(2, '0')}-${String(newCheckIn.getDate()).padStart(2, '0')}`

    fireEvent.change(checkInInput, { target: { value: newCheckInKey } })

    expect(screen.getByText(formatHotelDate(newCheckIn))).toBeInTheDocument()
    expect(screen.getByText(formatHotelDate(addDays(newCheckIn, 1)))).toBeInTheDocument()
  })

  it('does not change check-in when a past date is submitted', () => {
    render(<HotelsSearchCard />)
    const checkInInput = screen.getByLabelText('Check in')
    const today = new Date()
    const yesterday = addDays(today, -1)
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    fireEvent.change(checkInInput, { target: { value: yesterdayKey } })

    expect(screen.getByText(formatHotelDate(today))).toBeInTheDocument()
    expect(screen.queryByText(formatHotelDate(yesterday))).not.toBeInTheDocument()
  })

  it('updates the rooms & guests summary when the steppers are used', () => {
    render(<HotelsSearchCard />)
    expect(screen.getByText('1 Room · 2 Adults')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /no\. of rooms & guests/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase rooms' }))
    fireEvent.click(screen.getByRole('button', { name: 'Increase adults' }))

    expect(screen.getByText('2 Rooms · 3 Adults')).toBeInTheDocument()
  })

  it('shows an inline error next to the city field and focuses it when Search hotels is clicked without a city', () => {
    render(<HotelsSearchCard />)
    fireEvent.click(screen.getByRole('button', { name: /search hotels/i }))

    const cityInput = screen.getByRole('combobox', { name: 'City, area or hotel name' })
    expect(screen.getByText('Please select a city, area or hotel')).toBeInTheDocument()
    expect(cityInput).toHaveFocus()
  })
})
