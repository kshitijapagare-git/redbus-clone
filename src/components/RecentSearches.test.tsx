import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RecentSearches from './RecentSearches'
import type { City, RecentSearch } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

const today = new Date(2024, 9, 2) // 2024-10-02

describe('RecentSearches', () => {
  it('renders nothing when there are no searches', () => {
    const { container } = render(
      <RecentSearches
        searches={[]}
        cities={cities}
        today={today}
        onSelect={() => {}}
        onRemove={() => {}}
        onClearAll={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders each entry as "City → City · DD Mon"', () => {
    const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2024-10-05' }]
    render(
      <RecentSearches
        searches={searches}
        cities={cities}
        today={today}
        onSelect={() => {}}
        onRemove={() => {}}
        onClearAll={() => {}}
      />,
    )
    expect(screen.getByText('Pune → Bengaluru · 05 Oct')).toBeInTheDocument()
  })

  it('labels an entry whose date is before today as past', () => {
    const searches: RecentSearch[] = [
      { fromCityId: 1, toCityId: 2, date: '2024-10-01' },
      { fromCityId: 2, toCityId: 1, date: '2024-10-05' },
    ]
    render(
      <RecentSearches
        searches={searches}
        cities={cities}
        today={today}
        onSelect={() => {}}
        onRemove={() => {}}
        onClearAll={() => {}}
      />,
    )
    expect(screen.getByText('Past')).toBeInTheDocument()
    expect(screen.getAllByText('Past')).toHaveLength(1)
  })

  it('calls onSelect with the entry when clicked (not via ×)', () => {
    const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2024-10-05' }]
    const onSelect = vi.fn()
    render(
      <RecentSearches
        searches={searches}
        cities={cities}
        today={today}
        onSelect={onSelect}
        onRemove={() => {}}
        onClearAll={() => {}}
      />,
    )
    fireEvent.click(screen.getByText('Pune → Bengaluru · 05 Oct'))
    expect(onSelect).toHaveBeenCalledWith(searches[0])
  })

  it('calls onRemove with the index when × is clicked, without calling onSelect', () => {
    const searches: RecentSearch[] = [
      { fromCityId: 1, toCityId: 2, date: '2024-10-05' },
      { fromCityId: 2, toCityId: 1, date: '2024-10-06' },
    ]
    const onSelect = vi.fn()
    const onRemove = vi.fn()
    render(
      <RecentSearches
        searches={searches}
        cities={cities}
        today={today}
        onSelect={onSelect}
        onRemove={onRemove}
        onClearAll={() => {}}
      />,
    )
    const removeButtons = screen.getAllByRole('button', { name: 'Remove recent search' })
    fireEvent.click(removeButtons[1])
    expect(onRemove).toHaveBeenCalledWith(1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('calls onClearAll when "Clear all" is clicked', () => {
    const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2024-10-05' }]
    const onClearAll = vi.fn()
    render(
      <RecentSearches
        searches={searches}
        cities={cities}
        today={today}
        onSelect={() => {}}
        onRemove={() => {}}
        onClearAll={onClearAll}
      />,
    )
    fireEvent.click(screen.getByText('Clear all'))
    expect(onClearAll).toHaveBeenCalled()
  })
})
