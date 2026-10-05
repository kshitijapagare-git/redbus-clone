import { describe, expect, it } from 'vitest'
import {
  MAX_ADULTS_PER_ROOM,
  MAX_ROOMS,
  MIN_ADULTS_PER_ROOM,
  MIN_ROOMS,
  clampAdultsPerRoom,
  clampRooms,
  formatRoomsGuestsSummary,
} from './roomsGuests'

describe('clampRooms', () => {
  it('never returns a value below MIN_ROOMS', () => {
    expect(clampRooms(0)).toBe(MIN_ROOMS)
    expect(clampRooms(-5)).toBe(MIN_ROOMS)
  })

  it('never returns a value above MAX_ROOMS', () => {
    expect(clampRooms(10)).toBe(MAX_ROOMS)
    expect(clampRooms(6)).toBe(MAX_ROOMS)
  })

  it('returns the value unchanged when already within range', () => {
    expect(clampRooms(3)).toBe(3)
  })
})

describe('clampAdultsPerRoom', () => {
  it('never returns a value below MIN_ADULTS_PER_ROOM', () => {
    expect(clampAdultsPerRoom(0)).toBe(MIN_ADULTS_PER_ROOM)
    expect(clampAdultsPerRoom(-2)).toBe(MIN_ADULTS_PER_ROOM)
  })

  it('never returns a value above MAX_ADULTS_PER_ROOM', () => {
    expect(clampAdultsPerRoom(10)).toBe(MAX_ADULTS_PER_ROOM)
    expect(clampAdultsPerRoom(5)).toBe(MAX_ADULTS_PER_ROOM)
  })

  it('returns the value unchanged when already within range', () => {
    expect(clampAdultsPerRoom(2)).toBe(2)
  })
})

describe('formatRoomsGuestsSummary', () => {
  it('formats a single room as singular "Room"', () => {
    expect(formatRoomsGuestsSummary(1, 2)).toBe('1 Room · 2 Adults')
  })

  it('formats multiple rooms as plural "Rooms"', () => {
    expect(formatRoomsGuestsSummary(2, 3)).toBe('2 Rooms · 3 Adults')
  })
})
