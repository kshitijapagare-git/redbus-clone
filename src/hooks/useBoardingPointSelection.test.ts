import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearBoardingPointSelection, useBoardingPointSelection } from './useBoardingPointSelection'

describe('useBoardingPointSelection', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('starts with rawId null when there is no bp in the URL', () => {
    const { result } = renderHook(() => useBoardingPointSelection())
    expect(result.current.rawId).toBeNull()
  })

  it('starts with rawId set when bp is already in the URL', () => {
    window.history.replaceState(null, '', '/?bp=3')
    const { result } = renderHook(() => useBoardingPointSelection())
    expect(result.current.rawId).toBe(3)
  })

  it('select(id) updates window.location.search to include bp=<id>', () => {
    const { result } = renderHook(() => useBoardingPointSelection())

    act(() => {
      result.current.select(5)
    })

    expect(window.location.search).toBe('?bp=5')
    expect(result.current.rawId).toBe(5)
  })

  it('clear() removes bp from window.location.search', () => {
    window.history.replaceState(null, '', '/?bp=5')
    const { result } = renderHook(() => useBoardingPointSelection())

    act(() => {
      result.current.clear()
    })

    expect(window.location.search).toBe('')
    expect(result.current.rawId).toBeNull()
  })

  it('updates rawId in response to a popstate event without remounting', () => {
    const { result } = renderHook(() => useBoardingPointSelection())
    expect(result.current.rawId).toBeNull()

    act(() => {
      window.history.replaceState(null, '', '/?bp=7')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(result.current.rawId).toBe(7)
  })

  it('exposes clearBoardingPointSelection usable outside of React render', () => {
    window.history.replaceState(null, '', '/?bp=9')

    clearBoardingPointSelection()

    expect(window.location.search).toBe('')
  })

  it('supports an independent "dp" paramKey alongside an existing "bp" value', () => {
    window.history.replaceState(null, '', '/?bp=5')
    const { result } = renderHook(() => useBoardingPointSelection('dp'))

    expect(result.current.rawId).toBeNull()

    act(() => {
      result.current.select(7)
    })

    expect(window.location.search).toContain('bp=5')
    expect(window.location.search).toContain('dp=7')
    expect(result.current.rawId).toBe(7)

    act(() => {
      result.current.clear()
    })

    expect(window.location.search).toContain('bp=5')
    expect(window.location.search).not.toContain('dp=')
  })
})
