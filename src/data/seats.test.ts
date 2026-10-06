import { describe, expect, it } from 'vitest'
import { buses } from './buses'
import { busesSeats } from './seats'

describe('busesSeats', () => {
  it('has exactly one entry per bus id in buses', () => {
    const busIds = buses.map((b) => b.id).sort((a, b) => a - b)
    const seatIds = Object.keys(busesSeats)
      .map(Number)
      .sort((a, b) => a - b)
    expect(seatIds).toEqual(busIds)
  })

  it('includes at least one seater bus with only a lower deck', () => {
    const seaterEntries = Object.values(busesSeats).filter((m) => m.mode === 'seater')
    expect(seaterEntries.length).toBeGreaterThan(0)
    seaterEntries.forEach((m) => {
      expect(m.decks.upper).toBeUndefined()
    })
  })

  it('includes at least one sleeper bus with lower and upper decks', () => {
    const sleeperEntries = Object.values(busesSeats).filter((m) => m.mode === 'sleeper')
    expect(sleeperEntries.length).toBeGreaterThan(0)
    sleeperEntries.forEach((m) => {
      expect(m.decks.lower.length).toBeGreaterThan(0)
      expect(m.decks.upper && m.decks.upper.length).toBeGreaterThan(0)
    })
  })

  it('includes at least one mixed-mode bus', () => {
    const mixedEntries = Object.values(busesSeats).filter((m) => m.mode === 'mixed')
    expect(mixedEntries.length).toBeGreaterThan(0)
  })

  it('has unique seat ids within each bus seat map across decks', () => {
    Object.values(busesSeats).forEach((seatMap) => {
      const allSeats = [...seatMap.decks.lower, ...(seatMap.decks.upper ?? [])]
      const ids = allSeats.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  it('has every booked id referencing an existing seat id', () => {
    Object.values(busesSeats).forEach((seatMap) => {
      const allIds = new Set([...seatMap.decks.lower, ...(seatMap.decks.upper ?? [])].map((s) => s.id))
      seatMap.booked.forEach((bookedId) => {
        expect(allIds.has(bookedId)).toBe(true)
      })
    })
  })

  it('has at least one womenOnly seat across all the data', () => {
    const hasWomenOnly = Object.values(busesSeats).some((seatMap) =>
      [...seatMap.decks.lower, ...(seatMap.decks.upper ?? [])].some((s) => s.womenOnly),
    )
    expect(hasWomenOnly).toBe(true)
  })
})
