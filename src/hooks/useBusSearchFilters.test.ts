import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useBusSearchFilters } from './useBusSearchFilters'

describe('useBusSearchFilters', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('reads the URL into state on mount', () => {
    window.history.replaceState(
      null,
      '',
      '/search?from=1&to=2&date=2024-10-07&type=AC,Sleeper&time=night&sort=fare&women=1&fareMin=500&fareMax=1200',
    )
    const { result } = renderHook(() => useBusSearchFilters(false))

    expect(result.current.fromCityId).toBe(1)
    expect(result.current.toCityId).toBe(2)
    expect(result.current.date).toBe('2024-10-07')
    expect(result.current.committed.type).toEqual(new Set(['AC', 'Sleeper']))
    expect(result.current.committed.time).toBe('night')
    expect(result.current.committed.sort).toBe('fare')
    expect(result.current.committed.women).toBe(true)
    expect(result.current.committed.fareMin).toBe(500)
    expect(result.current.committed.fareMax).toBe(1200)
  })

  it('desktop mode: a setter updates committed and the URL immediately', () => {
    const { result } = renderHook(() => useBusSearchFilters(false))

    act(() => {
      result.current.setSort('fare')
    })

    expect(result.current.committed.sort).toBe('fare')
    expect(window.location.search).toContain('sort=fare')
  })

  it('mobile mode: a setter updates draft only, leaving committed and the URL unchanged', () => {
    const { result } = renderHook(() => useBusSearchFilters(true))
    const searchBefore = window.location.search

    act(() => {
      result.current.setSort('fare')
    })

    expect(result.current.draft.sort).toBe('fare')
    expect(result.current.committed.sort).toBe('departure')
    expect(window.location.search).toBe(searchBefore)
  })

  it('mobile mode: applyDraft commits the draft changes to committed and the URL', () => {
    const { result } = renderHook(() => useBusSearchFilters(true))

    act(() => {
      result.current.setSort('fare')
    })
    act(() => {
      result.current.setWomen(true)
    })
    act(() => {
      result.current.applyDraft()
    })

    expect(result.current.committed.sort).toBe('fare')
    expect(result.current.committed.women).toBe(true)
    expect(window.location.search).toContain('sort=fare')
    expect(window.location.search).toContain('women=1')
  })

  it('mobile mode: resetDraft discards pending changes', () => {
    const { result } = renderHook(() => useBusSearchFilters(true))

    act(() => {
      result.current.setSort('fare')
    })
    act(() => {
      result.current.resetDraft()
    })

    expect(result.current.draft.sort).toBe('departure')
  })

  it('clearFilters removes type/time/fare/women/sort from the URL while from/to/date remain', () => {
    window.history.replaceState(
      null,
      '',
      '/search?from=1&to=2&date=2024-10-07&type=AC&time=night&sort=fare&women=1&fareMin=500&fareMax=1200',
    )
    const { result } = renderHook(() => useBusSearchFilters(false))

    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.committed.type).toEqual(new Set())
    expect(result.current.committed.time).toBeNull()
    expect(result.current.committed.sort).toBe('departure')
    expect(result.current.committed.women).toBe(false)
    expect(result.current.committed.fareMin).toBeNull()
    expect(result.current.committed.fareMax).toBeNull()
    expect(result.current.fromCityId).toBe(1)
    expect(result.current.toCityId).toBe(2)
    expect(result.current.date).toBe('2024-10-07')
    expect(window.location.search).toContain('from=1')
    expect(window.location.search).toContain('to=2')
    expect(window.location.search).toContain('date=2024-10-07')
    expect(window.location.search).not.toContain('type=')
    expect(window.location.search).not.toContain('time=')
    expect(window.location.search).not.toContain('sort=')
    expect(window.location.search).not.toContain('women=')
    expect(window.location.search).not.toContain('fareMin=')
    expect(window.location.search).not.toContain('fareMax=')
  })

  it('updates committed in response to a popstate event (e.g. Back)', () => {
    const { result } = renderHook(() => useBusSearchFilters(false))

    act(() => {
      window.history.replaceState(null, '', '/search?from=1&to=2&date=2024-10-07&sort=rating')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(result.current.committed.sort).toBe('rating')
  })
})
