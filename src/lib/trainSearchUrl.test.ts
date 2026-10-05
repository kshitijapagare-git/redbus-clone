import { describe, expect, it } from 'vitest'
import { buildTrainSearchUrl } from './trainSearchUrl'

describe('buildTrainSearchUrl', () => {
  it('builds a url with from, to and date', () => {
    expect(buildTrainSearchUrl(1, 2, '2026-10-07', false)).toBe(
      '/trains/search?from=1&to=2&date=2026-10-07',
    )
  })

  it('appends freeCancellation=1 only when true', () => {
    expect(buildTrainSearchUrl(1, 2, '2026-10-07', true)).toBe(
      '/trains/search?from=1&to=2&date=2026-10-07&freeCancellation=1',
    )
  })

  it('never includes freeCancellation when false', () => {
    const url = buildTrainSearchUrl(1, 2, '2026-10-07', false)
    expect(url).not.toContain('freeCancellation')
  })
})
