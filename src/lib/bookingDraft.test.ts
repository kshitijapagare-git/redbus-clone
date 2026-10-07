import { afterEach, describe, expect, it } from 'vitest'
import { clearBookingDraft, loadBookingDraft, saveBookingDraft } from './bookingDraft'

describe('bookingDraft', () => {
  afterEach(() => {
    clearBookingDraft()
  })

  it('returns null when nothing has been saved', () => {
    expect(loadBookingDraft()).toBeNull()
  })

  it('saves and loads a draft', () => {
    const draft = {
      passengers: {
        L1: { name: 'Asha', age: '30', gender: 'Female' },
        L2: { name: 'Ravi', age: '28', gender: 'Male' },
      },
      contact: { email: 'asha@example.com', mobile: '9876543210' },
    }

    const saved = saveBookingDraft(draft)
    expect(saved).toBe(true)
    expect(loadBookingDraft()).toEqual(draft)
  })

  it('clears a saved draft', () => {
    saveBookingDraft({
      passengers: { L1: { name: 'Asha', age: '30', gender: 'Female' } },
      contact: { email: 'asha@example.com', mobile: '9876543210' },
    })

    clearBookingDraft()

    expect(loadBookingDraft()).toBeNull()
  })

  it('returns null for structurally invalid stored JSON', () => {
    sessionStorage.setItem('redbus:bookingDraft', JSON.stringify({ passengers: {}, contact: { email: 1 } }))
    expect(loadBookingDraft()).toBeNull()
  })
})
