import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useSeatSelection } from './useSeatSelection'
import type { BusSeatMap } from '../types'

const seatMap: BusSeatMap = {
  mode: 'sleeper',
  decks: {
    lower: [
      { id: 'L1', label: '1', deck: 'lower', womenOnly: false },
      { id: 'L2', label: '2', deck: 'lower', womenOnly: false },
      { id: 'L3', label: '3', deck: 'lower', womenOnly: false },
      { id: 'L4', label: '4', deck: 'lower', womenOnly: false },
      { id: 'L5', label: '5', deck: 'lower', womenOnly: false },
      { id: 'L6', label: '6', deck: 'lower', womenOnly: false },
      { id: 'L7', label: '7', deck: 'lower', womenOnly: false },
    ],
    upper: [
      { id: 'U1', label: '1', deck: 'upper', womenOnly: false },
      { id: 'U2', label: '2', deck: 'upper', womenOnly: false },
    ],
  },
  booked: ['L3', 'U1'],
}

describe('useSeatSelection', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/search/3/seats')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('starts empty when there is no seats param in the URL', () => {
    const { result } = renderHook(() => useSeatSelection(3, seatMap))
    expect(result.current.selectedSeatIds).toEqual([])
  })

  it('restores valid seat ids from the URL on mount', () => {
    window.history.replaceState(null, '', '/search/3/seats?seats=L1,L2')
    const { result } = renderHook(() => useSeatSelection(3, seatMap))
    expect(result.current.selectedSeatIds).toEqual(['L1', 'L2'])
  })

  it('drops a booked seat id from the URL on mount and rewrites the URL', () => {
    window.history.replaceState(null, '', '/search/3/seats?seats=L1,L3')
    const { result } = renderHook(() => useSeatSelection(3, seatMap))
    expect(result.current.selectedSeatIds).toEqual(['L1'])
    expect(window.location.search).not.toContain('L3')
    expect(window.location.search).toContain('seats=L1')
  })

  it('drops a nonexistent seat id from the URL on mount', () => {
    window.history.replaceState(null, '', '/search/3/seats?seats=L1,Z9')
    const { result } = renderHook(() => useSeatSelection(3, seatMap))
    expect(result.current.selectedSeatIds).toEqual(['L1'])
  })

  it('toggleSeat adds a seat and writes it to the URL', () => {
    const { result } = renderHook(() => useSeatSelection(3, seatMap))

    act(() => {
      result.current.toggleSeat('L1')
    })

    expect(result.current.selectedSeatIds).toEqual(['L1'])
    expect(window.location.search).toContain('seats=L1')
  })

  it('toggleSeat removes a seat already selected', () => {
    window.history.replaceState(null, '', '/search/3/seats?seats=L1,L2')
    const { result } = renderHook(() => useSeatSelection(3, seatMap))

    act(() => {
      result.current.toggleSeat('L1')
    })

    expect(result.current.selectedSeatIds).toEqual(['L2'])
  })

  it('shows a limit message and keeps the selection unchanged on a 7th pick', () => {
    window.history.replaceState(null, '', '/search/3/seats?seats=L1,L2,L4,L5,L6,L7')
    const { result } = renderHook(() => useSeatSelection(3, seatMap))

    act(() => {
      result.current.toggleSeat('U2')
    })

    expect(result.current.limitMessage).toBe('You can select up to 6 seats')
    expect(result.current.selectedSeatIds).toEqual(['L1', 'L2', 'L4', 'L5', 'L6', 'L7'])
  })

  it('clears the limit message after a subsequent successful toggle', () => {
    window.history.replaceState(null, '', '/search/3/seats?seats=L1,L2,L4,L5,L6,L7')
    const { result } = renderHook(() => useSeatSelection(3, seatMap))

    act(() => {
      result.current.toggleSeat('U2')
    })
    expect(result.current.limitMessage).toBe('You can select up to 6 seats')

    act(() => {
      result.current.toggleSeat('L1')
    })

    expect(result.current.limitMessage).toBeNull()
    expect(result.current.selectedSeatIds).toEqual(['L2', 'L4', 'L5', 'L6', 'L7'])
  })
})
