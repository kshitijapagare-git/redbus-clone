import { describe, expect, it } from 'vitest'
import {
  isMockPaymentFailure,
  luhnCheck,
  maskCardNumber,
  validateCardExpiry,
  validateCardNumber,
  validateCvv,
  validateUpiId,
} from './paymentValidation'

describe('validateUpiId', () => {
  it('accepts a valid name@bank id', () => {
    expect(validateUpiId('john@okbank')).toBeNull()
  })

  it('rejects an id with no @', () => {
    expect(validateUpiId('johnokbank')).not.toBeNull()
  })

  it('rejects an id with an empty name or bank part', () => {
    expect(validateUpiId('@okbank')).not.toBeNull()
    expect(validateUpiId('john@')).not.toBeNull()
  })

  it('rejects an empty id', () => {
    expect(validateUpiId('')).not.toBeNull()
  })
})

describe('luhnCheck', () => {
  it('flags a known-valid test card number as valid', () => {
    expect(luhnCheck('4242424242424242')).toBe(true)
  })

  it('flags a digit-altered version of a valid card as invalid', () => {
    expect(luhnCheck('4242424242424241')).toBe(false)
  })
})

describe('validateCardNumber', () => {
  it('accepts a valid card number', () => {
    expect(validateCardNumber('4242 4242 4242 4242')).toBeNull()
  })

  it('rejects a card number that fails the Luhn check', () => {
    expect(validateCardNumber('4242424242424241')).not.toBeNull()
  })
})

describe('validateCardExpiry', () => {
  const now = new Date(2024, 5, 15) // June 2024

  it('rejects a past MM/YY', () => {
    expect(validateCardExpiry('01/20', now)).not.toBeNull()
  })

  it('rejects an invalid format', () => {
    expect(validateCardExpiry('2024-06', now)).not.toBeNull()
    expect(validateCardExpiry('13/24', now)).not.toBeNull()
  })

  it('accepts the current month/year', () => {
    expect(validateCardExpiry('06/24', now)).toBeNull()
  })

  it('accepts a future MM/YY', () => {
    expect(validateCardExpiry('07/24', now)).toBeNull()
    expect(validateCardExpiry('01/25', now)).toBeNull()
  })
})

describe('validateCvv', () => {
  it('accepts exactly 3 digits', () => {
    expect(validateCvv('123')).toBeNull()
  })

  it('rejects 2 or 4 digits', () => {
    expect(validateCvv('12')).not.toBeNull()
    expect(validateCvv('1234')).not.toBeNull()
  })

  it('rejects non-digit input', () => {
    expect(validateCvv('abc')).not.toBeNull()
  })
})

describe('maskCardNumber', () => {
  it('masks all but the last 4 digits', () => {
    expect(maskCardNumber('4111111111111234')).toBe('•••• 1234')
  })
})

describe('isMockPaymentFailure', () => {
  it('is true for the mock-failure card number', () => {
    expect(isMockPaymentFailure('card', { number: '4000000000000002', expiry: '12/30', cvv: '123' })).toBe(true)
  })

  it('is true for the mock-failure UPI id', () => {
    expect(isMockPaymentFailure('upi', { id: 'fail@bank' })).toBe(true)
  })

  it('is false for any other valid card', () => {
    expect(isMockPaymentFailure('card', { number: '4242424242424242', expiry: '12/30', cvv: '123' })).toBe(false)
  })

  it('is false for any other valid UPI id', () => {
    expect(isMockPaymentFailure('upi', { id: 'john@okbank' })).toBe(false)
  })

  it('is false for netbanking', () => {
    expect(isMockPaymentFailure('netbanking', { bank: 'SBI' })).toBe(false)
  })
})
