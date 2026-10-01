import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CityAutocomplete from './CityAutocomplete'
import type { City } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
  { id: 3, name: 'Purnia', state: 'Bihar' },
]

function ControlledCityAutocomplete() {
  const [value, setValue] = useState<City['id'] | null>(null)
  return <CityAutocomplete id="from" label="From" cities={cities} value={value} onChange={setValue} />
}

describe('CityAutocomplete', () => {
  it('does not show the listbox when the input is empty', () => {
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={() => {}} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows matching suggestions with the city name and state as secondary text', () => {
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('Pune')
    expect(options[0]).toHaveTextContent('Maharashtra')
    expect(options[1]).toHaveTextContent('Purnia')
    expect(options[1]).toHaveTextContent('Bihar')
  })

  it('does not render the listbox when there are zero matches', () => {
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'zzz' } })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('moves the highlighted suggestion with ArrowDown/ArrowUp', () => {
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    let options = screen.getAllByRole('option')
    expect(options[1]).toHaveClass('active')
    expect(input).toHaveAttribute('aria-activedescendant', options[1].id)

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    options = screen.getAllByRole('option')
    expect(options[0]).toHaveClass('active')
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id)
  })

  it('selects the highlighted suggestion on Enter, storing the city id and closing the list', () => {
    render(<ControlledCityAutocomplete />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('Purnia')
  })

  it('calls onChange with the city id, not the typed text, when a suggestion is selected', () => {
    const handleChange = vi.fn()
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={handleChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(handleChange).toHaveBeenCalledWith(1)
  })

  it('closes the list on Escape without changing the selection', () => {
    const handleChange = vi.fn()
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={handleChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(handleChange).not.toHaveBeenCalledWith(1)
  })

  it('selects a suggestion on click', () => {
    const handleChange = vi.fn()
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={handleChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'ben' } })

    const option = screen.getByRole('option')
    fireEvent.mouseDown(option)

    expect(handleChange).toHaveBeenCalledWith(2)
    expect(input).toHaveValue('Bengaluru')
  })

  it('exposes the ARIA combobox pattern roles', () => {
    render(<CityAutocomplete id="from" label="From" cities={cities} value={null} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })
})
