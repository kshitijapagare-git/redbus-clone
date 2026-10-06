import type { BusSeatMap, Seat, SeatDeckName } from '../types'

/**
 * Static per-bus seat maps for the sample buses in `./buses.ts`, keyed by
 * `Bus.id`. Each map describes a 'seater' (2+2, lower deck only), 'sleeper'
 * (lower + upper deck berths) or 'mixed' (lower seater row + upper sleeper
 * berths) layout, independent of the bus's `busType` label.
 */

function seaterDeck(rowCount: number): Seat[] {
  const seats: Seat[] = []
  let n = 1
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < 4; col++) {
      seats.push({ id: `L${n}`, label: `${n}`, deck: 'lower', womenOnly: false })
      n++
    }
  }
  return seats
}

function sleeperDeck(deck: SeatDeckName, count: number): Seat[] {
  const prefix = deck === 'lower' ? 'L' : 'U'
  const seats: Seat[] = []
  for (let n = 1; n <= count; n++) {
    seats.push({ id: `${prefix}${n}`, label: `${n}`, deck, womenOnly: false })
  }
  return seats
}

function withWomenOnly(seats: Seat[], womenOnlyIds: string[]): Seat[] {
  const idSet = new Set(womenOnlyIds)
  return seats.map((seat) => (idSet.has(seat.id) ? { ...seat, womenOnly: true } : seat))
}

export const busesSeats: Record<number, BusSeatMap> = {
  // Bus 1: VRL Travels, AC Seater — seater, lower deck only. First two seats
  // (the ones nearest the front) are reserved for women.
  1: {
    mode: 'seater',
    decks: { lower: withWomenOnly(seaterDeck(5), ['L1', 'L2']) },
    booked: ['L5', 'L6'],
  },
  // Bus 2: SRS Travels, Non-AC Seater — seater, lower deck only.
  2: {
    mode: 'seater',
    decks: { lower: seaterDeck(4) },
    booked: ['L3'],
  },
  // Bus 3: Orange Travels, AC Sleeper — lower + upper berths.
  3: {
    mode: 'sleeper',
    decks: { lower: sleeperDeck('lower', 6), upper: sleeperDeck('upper', 6) },
    booked: ['L1', 'U2'],
  },
  // Bus 4: Kallada Travels, Non-AC Sleeper — lower + upper berths.
  4: {
    mode: 'sleeper',
    decks: { lower: sleeperDeck('lower', 6), upper: sleeperDeck('upper', 8) },
    booked: ['U1'],
  },
  // Bus 5: APSRTC, AC Seater — mixed layout: a seater lower deck plus a
  // sleeper upper deck, to cover the 'mixed' seat-map mode.
  5: {
    mode: 'mixed',
    decks: { lower: seaterDeck(3), upper: sleeperDeck('upper', 6) },
    booked: ['L2', 'U3'],
  },
  // Bus 6: VRL Travels, AC Sleeper — lower + upper berths.
  6: {
    mode: 'sleeper',
    decks: { lower: sleeperDeck('lower', 4), upper: sleeperDeck('upper', 4) },
    booked: ['L1'],
  },
  // Bus 7: SRS Travels, Non-AC Seater — seater, lower deck only.
  7: {
    mode: 'seater',
    decks: { lower: seaterDeck(5) },
    booked: ['L10'],
  },
  // Bus 8: TGSRTC, AC Seater — seater, lower deck only.
  8: {
    mode: 'seater',
    decks: { lower: seaterDeck(4) },
    booked: ['L1'],
  },
  // Bus 9: Kallada Travels, Non-AC Sleeper — lower + upper berths.
  9: {
    mode: 'sleeper',
    decks: { lower: sleeperDeck('lower', 5), upper: sleeperDeck('upper', 5) },
    booked: ['L3'],
  },
  // Bus 10: Orange Travels, AC Sleeper — lower + upper berths.
  10: {
    mode: 'sleeper',
    decks: { lower: sleeperDeck('lower', 5), upper: sleeperDeck('upper', 4) },
    booked: ['U1'],
  },
}

export default busesSeats
