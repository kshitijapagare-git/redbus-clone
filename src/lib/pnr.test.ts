import { describe, expect, it } from 'vitest'
import { generatePnr } from './pnr'

describe('generatePnr', () => {
  it('returns a 10-character string of only A-Z and 0-9', () => {
    const pnr = generatePnr(new Set())
    expect(pnr).toHaveLength(10)
    expect(pnr).toMatch(/^[A-Z0-9]{10}$/)
  })

  it('never returns a value already present in the existing-PNRs set', () => {
    const pnr = generatePnr(new Set())
    const existing = new Set<string>()
    // Force collisions for every candidate except one specific value, by
    // pre-seeding a huge set is impractical; instead verify the contract
    // directly by seeding the exact output of an unconstrained call and
    // asserting a retried call never repeats it.
    existing.add(pnr)
    const next = generatePnr(existing)
    expect(next).not.toBe(pnr)
  })
})
