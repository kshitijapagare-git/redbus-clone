import { describe, expect, it } from 'vitest'
import {
  MAX_SELECTABLE_SEATS,
  SEATS_PARAM,
  buildSeatsQueryValue,
  parseSelectedSeatIds,
  sanitizeSeatSelection,
  sortSeatIds,
  toggleSeatSelection,
} from './seatSelection'
import type { BusSeatMap } from '../types'

const seatMap: BusSeatMap = {
  mode: 'sleeper',
  decks: {
    lower: [
      { id: 'L1', label: '1', deck: 'lower', womenOnly: false },
      { id: 'L2', label: '2', deck: 'lower', womenOnly: true },
      { id: 'L3', label: '3', deck: 'lower', womenOnly: false },
      { id: 'L10', label: '10', deck: 'lower', womenOnly: false },
    ],
    upper: [
      { id: 'U1', label: '1', deck: 'upper', womenOnly: false },
      { id: 'U2', label: '2', deck: 'upper', womenOnly: false },
    ],
  },
  booked: ['L3', 'U1'],
}

describe('SEATS_PARAM', () => {
  it('is "seats"', () => {
    expect(SEATS_PARAM).toBe('seats')
  })
})

describe('MAX_SELECTABLE_SEATS', () => {
  it('is 6', () => {
    expect(MAX_SELECTABLE_SEATS).toBe(6)
  })
})

describe('parseSelectedSeatIds', () => {
  it('returns [] when the seats param is missing', () => {
    expect(parseSelectedSeatIds('')).toEqual([])
  })

  it('returns [] when the seats param is empty', () => {
    expect(parseSelectedSeatIds('?seats=')).toEqual([])
  })

  it('returns the ordered list of ids for seats=L1,L2', () => {
    expect(parseSelectedSeatIds('?seats=L1,L2')).toEqual(['L1', 'L2'])
  })

  it('preserves order for a longer list', () => {
    expect(parseSelectedSeatIds('?seats=U2,L1,L10')).toEqual(['U2', 'L1', 'L10'])
  })
})

describe('buildSeatsQueryValue', () => {
  it('joins ids with commas', () => {
    expect(buildSeatsQueryValue(['L1', 'L2'])).toBe('L1,L2')
  })

  it('returns an empty string for an empty list', () => {
    expect(buildSeatsQueryValue([])).toBe('')
  })
})

describe('sanitizeSeatSelection', () => {
  it('drops booked ids', () => {
    expect(sanitizeSeatSelection(['L1', 'L3'], seatMap)).toEqual(['L1'])
  })

  it('drops ids that do not exist on the seat map', () => {
    expect(sanitizeSeatSelection(['L1', 'Z9'], seatMap)).toEqual(['L1'])
  })

  it('preserves the original order of the remaining ids', () => {
    expect(sanitizeSeatSelection(['U2', 'L3', 'L1'], seatMap)).toEqual(['U2', 'L1'])
  })

  it('keeps all ids when none are booked or missing', () => {
    expect(sanitizeSeatSelection(['L1', 'L2'], seatMap)).toEqual(['L1', 'L2'])
  })
})

describe('sortSeatIds', () => {
  it('orders lower-deck ids before upper-deck ids', () => {
    expect(sortSeatIds(['U1', 'L1'])).toEqual(['L1', 'U1'])
  })

  it('orders numerically within a deck', () => {
    expect(sortSeatIds(['L10', 'L2', 'L1'])).toEqual(['L1', 'L2', 'L10'])
  })

  it('combines deck ordering and numeric ordering', () => {
    expect(sortSeatIds(['U2', 'L10', 'U1', 'L1'])).toEqual(['L1', 'L10', 'U1', 'U2'])
  })

  it('does not mutate the input array', () => {
    const input = ['U1', 'L1']
    const original = [...input]
    sortSeatIds(input)
    expect(input).toEqual(original)
  })
})

describe('toggleSeatSelection', () => {
  it('adds a seat id when not already selected', () => {
    const result = toggleSeatSelection(['L1'], 'U2', seatMap)
    expect(result).toEqual({ ids: ['L1', 'U2'], limitExceeded: false })
  })

  it('removes a seat id when already selected', () => {
    const result = toggleSeatSelection(['L1', 'U2'], 'L1', seatMap)
    expect(result).toEqual({ ids: ['U2'], limitExceeded: false })
  })

  it('never adds a booked seat', () => {
    const result = toggleSeatSelection(['L1'], 'L3', seatMap)
    expect(result).toEqual({ ids: ['L1'], limitExceeded: false })
  })

  it('never adds a nonexistent seat', () => {
    const result = toggleSeatSelection(['L1'], 'Z9', seatMap)
    expect(result).toEqual({ ids: ['L1'], limitExceeded: false })
  })

  it('returns the original 6 unchanged plus limitExceeded when adding a 7th', () => {
    // Use a seat map with at least 7 non-booked seats so a 7th pick is possible.
    const bigSeatMap: BusSeatMap = {
      mode: 'seater',
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
      },
      booked: [],
    }
    const selected6 = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6']
    const result = toggleSeatSelection(selected6, 'L7', bigSeatMap)
    expect(result.ids).toEqual(selected6)
    expect(result.limitExceeded).toBe(true)
    expect(result.ids.length).toBe(6)
  })
})
