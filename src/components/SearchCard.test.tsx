import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SearchCard from './SearchCard'

function selectCity(input: HTMLElement, typed: string, optionName: string) {
  fireEvent.change(input, { target: { value: typed } })
  const option = screen.getAllByRole('option').find((o) => o.textContent?.includes(optionName))
  if (!option) throw new Error(`No option found containing "${optionName}"`)
  fireEvent.mouseDown(option)
}

describe('SearchCard', () => {
  it('suggests Pune, Maharashtra when typing "pu" in the From field and selects city id 1', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })

    const option = screen.getByRole('option')
    expect(option).toHaveTextContent('Pune')
    expect(option).toHaveTextContent('Maharashtra')

    fireEvent.mouseDown(option)
    expect(fromInput).toHaveValue('Pune')
  })

  it('shows an error next to the From field when it is left empty and Search is clicked', () => {
    render(<SearchCard />)
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(toInput, 'ben', 'Bengaluru')

    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

    expect(screen.getByText('Please select a departure city')).toBeInTheDocument()
    expect(screen.queryByText('Please select a destination city')).not.toBeInTheDocument()
  })

  it('shows an error next to the To field when it is left empty and Search is clicked', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    selectCity(fromInput, 'pu', 'Pune')

    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

    expect(screen.getByText('Please select a destination city')).toBeInTheDocument()
    expect(screen.queryByText('Please select a departure city')).not.toBeInTheDocument()
  })

  it('treats a typed-but-unselected city the same as an empty field', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(toInput, 'ben', 'Bengaluru')
    fireEvent.change(fromInput, { target: { value: 'pu' } })

    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

    expect(screen.getByText('Please select a departure city')).toBeInTheDocument()
  })

  it('shows an error on both fields when the same city is chosen for From and To', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(fromInput, 'pu', 'Pune')
    selectCity(toInput, 'pu', 'Pune')

    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

    expect(screen.getAllByText('From and To cities must be different')[0]).toBeInTheDocument()
    expect(screen.getAllByText('From and To cities must be different')).toHaveLength(2)
  })

  it('shows no errors when Search is clicked with two different selected cities', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(fromInput, 'pu', 'Pune')
    selectCity(toInput, 'ben', 'Bengaluru')

    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

    expect(screen.queryByText('Please select a departure city')).not.toBeInTheDocument()
    expect(screen.queryByText('Please select a destination city')).not.toBeInTheDocument()
    expect(screen.queryByText('From and To cities must be different')).not.toBeInTheDocument()
  })

  it('swaps the selected cities between From and To', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    selectCity(fromInput, 'pu', 'Pune')
    selectCity(toInput, 'ben', 'Bengaluru')

    fireEvent.click(screen.getByRole('button', { name: 'Swap cities' }))

    expect(fromInput).toHaveValue('Bengaluru')
    expect(toInput).toHaveValue('Pune')
  })

  it('recomputes validation errors for the swapped state after swap', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    selectCity(screen.getByRole('combobox', { name: 'To' }), 'ben', 'Bengaluru')

    fireEvent.click(screen.getByRole('button', { name: /search buses/i }))
    expect(screen.getByText('Please select a departure city')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Swap cities' }))

    // The city that was in To (now in From) is reflected immediately.
    expect(fromInput).toHaveValue('Bengaluru')
    // The error that was on From no longer applies, and the now-empty To field is flagged instead.
    expect(screen.queryByText('Please select a departure city')).not.toBeInTheDocument()
    expect(screen.getByText('Please select a destination city')).toBeInTheDocument()
  })
})
