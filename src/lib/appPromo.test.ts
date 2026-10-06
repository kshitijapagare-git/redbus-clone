import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  APP_PROMO_DISMISSED_STORAGE_KEY,
  loadAppPromoDismissed,
  persistAppPromoDismissed,
} from './appPromo'

describe('appPromo', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('loadAppPromoDismissed', () => {
    it('returns dismissed: false when nothing is stored', () => {
      expect(loadAppPromoDismissed()).toEqual({ dismissed: false, available: true })
    })

    it('returns dismissed: true when the stored value is "1"', () => {
      localStorage.setItem(APP_PROMO_DISMISSED_STORAGE_KEY, '1')
      expect(loadAppPromoDismissed()).toEqual({ dismissed: true, available: true })
    })

    it('returns dismissed: false for any other stored value', () => {
      localStorage.setItem(APP_PROMO_DISMISSED_STORAGE_KEY, 'true')
      expect(loadAppPromoDismissed()).toEqual({ dismissed: false, available: true })
    })

    it('returns available: false when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      expect(loadAppPromoDismissed()).toEqual({ dismissed: false, available: false })
    })
  })

  describe('persistAppPromoDismissed', () => {
    it('writes "1" to the storage key and returns true', () => {
      expect(persistAppPromoDismissed()).toBe(true)
      expect(localStorage.getItem(APP_PROMO_DISMISSED_STORAGE_KEY)).toBe('1')
    })

    it('returns false when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      expect(persistAppPromoDismissed()).toBe(false)
    })
  })
})
