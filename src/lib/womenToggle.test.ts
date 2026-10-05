import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WOMEN_TOGGLE_STORAGE_KEY, loadWomenToggle, persistWomenToggle } from './womenToggle'

describe('loadWomenToggle / persistWomenToggle', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns value:false and available:true when storage has no entry for the key', () => {
    expect(loadWomenToggle()).toEqual({ value: false, available: true })
  })

  it('returns value:true when a previously persisted "on" value exists', () => {
    store[WOMEN_TOGGLE_STORAGE_KEY] = JSON.stringify(true)
    expect(loadWomenToggle()).toEqual({ value: true, available: true })
  })

  it('returns value:false when a previously persisted "off" value exists', () => {
    store[WOMEN_TOGGLE_STORAGE_KEY] = JSON.stringify(false)
    expect(loadWomenToggle()).toEqual({ value: false, available: true })
  })

  it('returns value:false and available:false when getItem throws, without throwing', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('boom')
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    expect(loadWomenToggle()).toEqual({ value: false, available: false })
  })

  it('returns value:false and available:false when the stored value is malformed JSON', () => {
    store[WOMEN_TOGGLE_STORAGE_KEY] = '{not json'
    expect(loadWomenToggle()).toEqual({ value: false, available: false })
  })

  it('returns value:false and available:false when the stored value is not a boolean', () => {
    store[WOMEN_TOGGLE_STORAGE_KEY] = JSON.stringify('yes')
    expect(loadWomenToggle()).toEqual({ value: false, available: false })
  })

  it('persistWomenToggle writes to the storage key and returns true on success', () => {
    expect(persistWomenToggle(true)).toBe(true)
    expect(store[WOMEN_TOGGLE_STORAGE_KEY]).toBe(JSON.stringify(true))
  })

  it('persistWomenToggle returns false, without throwing, when setItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded')
      }),
      removeItem: vi.fn(),
    })
    expect(persistWomenToggle(true)).toBe(false)
  })
})
