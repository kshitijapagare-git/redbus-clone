import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SearchCard from './SearchCard'
import { RECENT_SEARCHES_STORAGE_KEY, formatRecentSearchDate, toDateKey } from '../lib/recentSearches'

function selectCity(input: HTMLElement, typed: string, optionName: string) {
  fireEvent.change(input, { target: { value: typed } })
  const option = screen.getAllByRole('option').find((o) => o.textContent?.includes(optionName))
  if (!option) throw new Error(`No option found containing "${optionName}"`)
  fireEvent.mouseDown(option)
}

describe('SearchCard', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    localStorage.clear()
    window.history.replaceState(null, '', '/')
  })

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

  describe('recent searches', () => {
    it('persists a valid search and shows it in the Recent searches row on re-render', () => {
      const { unmount } = render(<SearchCard />)
      const fromInput = screen.getByRole('combobox', { name: 'From' })
      const toInput = screen.getByRole('combobox', { name: 'To' })
      selectCity(fromInput, 'pu', 'Pune')
      selectCity(toInput, 'ben', 'Bengaluru')

      fireEvent.click(screen.getByRole('button', { name: /search buses/i }))
      unmount()

      render(<SearchCard />)
      expect(screen.getByText('Recent searches')).toBeInTheDocument()
      expect(screen.getByText(/Pune → Bengaluru/)).toBeInTheDocument()
    })

    it('does not persist a search that fails validation', () => {
      render(<SearchCard />)
      const toInput = screen.getByRole('combobox', { name: 'To' })
      selectCity(toInput, 'ben', 'Bengaluru')

      fireEvent.click(screen.getByRole('button', { name: /search buses/i }))

      expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBeNull()
    })

    it('fills From, To and the date chip when a non-past recent search is clicked', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      localStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify([{ fromCityId: 1, toCityId: 2, date: toDateKey(tomorrow) }]),
      )

      render(<SearchCard />)
      const fromInput = screen.getByRole('combobox', { name: 'From' })
      const toInput = screen.getByRole('combobox', { name: 'To' })

      fireEvent.click(screen.getByText(`Pune → Bengaluru · ${formatRecentSearchDate(toDateKey(tomorrow))}`))

      expect(fromInput).toHaveValue('Pune')
      expect(toInput).toHaveValue('Bengaluru')
      expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveClass('chip-active')
    })

    it('fills From, To and resets the date to today when a past recent search is clicked', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      localStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify([{ fromCityId: 1, toCityId: 2, date: toDateKey(yesterday) }]),
      )

      render(<SearchCard />)
      const fromInput = screen.getByRole('combobox', { name: 'From' })
      const toInput = screen.getByRole('combobox', { name: 'To' })

      expect(screen.getByText('Past')).toBeInTheDocument()
      fireEvent.click(screen.getByText(`Pune → Bengaluru · ${formatRecentSearchDate(toDateKey(yesterday))}`))

      expect(fromInput).toHaveValue('Pune')
      expect(toInput).toHaveValue('Bengaluru')
      expect(screen.getByRole('button', { name: 'Today' })).toHaveClass('chip-active')
    })

    it('removes a recent search via × and clears all via "Clear all"', () => {
      localStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify([
          { fromCityId: 1, toCityId: 2, date: toDateKey(new Date()) },
          { fromCityId: 2, toCityId: 1, date: toDateKey(new Date()) },
        ]),
      )

      render(<SearchCard />)
      expect(screen.getAllByRole('button', { name: 'Remove recent search' })).toHaveLength(2)

      fireEvent.click(screen.getAllByRole('button', { name: 'Remove recent search' })[0])
      expect(screen.getAllByRole('button', { name: 'Remove recent search' })).toHaveLength(1)
      expect(JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? '[]')).toHaveLength(1)

      fireEvent.click(screen.getByText('Clear all'))
      expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
      expect(JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? '[]')).toHaveLength(0)
    })

    it('hides the Recent searches row (but still renders the rest of the card) when storage is broken', () => {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, '{not json')

      render(<SearchCard />)

      expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: 'From' })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: 'To' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /search buses/i })).toBeInTheDocument()
    })
    })

    describe('clearing the boarding point selection on search changes', () => {
      it('leaves an existing bp param untouched when nothing changes after mount', () => {
        window.history.replaceState(null, '', '/?bp=2')
        render(<SearchCard />)
        expect(window.location.search).toBe('?bp=2')
      })

      it('clears bp when the From city changes', () => {
        window.history.replaceState(null, '', '/?bp=2')
        render(<SearchCard />)
        const fromInput = screen.getByRole('combobox', { name: 'From' })
        selectCity(fromInput, 'pu', 'Pune')
        expect(window.location.search).toBe('')
      })

      it('clears bp when the To city changes', () => {
        window.history.replaceState(null, '', '/?bp=2')
        render(<SearchCard />)
        const toInput = screen.getByRole('combobox', { name: 'To' })
        selectCity(toInput, 'ben', 'Bengaluru')
        expect(window.location.search).toBe('')
      })

      it('clears bp when the date chip changes', () => {
        window.history.replaceState(null, '', '/?bp=2')
        render(<SearchCard />)
        fireEvent.click(screen.getByRole('button', { name: 'Tomorrow' }))
        expect(window.location.search).toBe('')
      })

      it('clears bp when the women toggle changes', () => {
        window.history.replaceState(null, '', '/?bp=2')
        render(<SearchCard />)
        fireEvent.click(screen.getByRole('switch', { name: 'Booking for women' }))
        expect(window.location.search).toBe('')
      })

      it('clears bp when a recent search is selected', () => {
        localStorage.setItem(
          RECENT_SEARCHES_STORAGE_KEY,
          JSON.stringify([{ fromCityId: 1, toCityId: 2, date: toDateKey(new Date()) }]),
        )
        window.history.replaceState(null, '', '/?bp=2')
        render(<SearchCard />)
        fireEvent.click(screen.getByText(`Pune → Bengaluru · ${formatRecentSearchDate(toDateKey(new Date()))}`))
        expect(window.location.search).toBe('')
      })
    })
})
