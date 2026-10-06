import { describe, expect, it } from 'vitest'
import {
  validateEmail,
  validateMobileNumber,
  validatePassengerAge,
  validatePassengerGender,
  validatePassengerName,
} from './passengerValidation'

describe('validatePassengerName', () => {
  it('rejects an empty or whitespace-only name', () => {
    expect(validatePassengerName('')).not.toBeNull()
    expect(validatePassengerName('   ')).not.toBeNull()
  })

  it('accepts a non-empty name', () => {
    expect(validatePassengerName('Asha')).toBeNull()
  })
})

describe('validatePassengerAge', () => {
  it('accepts integers from 1 to 120 inclusive', () => {
    expect(validatePassengerAge('1')).toBeNull()
    expect(validatePassengerAge('120')).toBeNull()
    expect(validatePassengerAge('45')).toBeNull()
  })

  it('rejects 0 and 121', () => {
    expect(validatePassengerAge('0')).not.toBeNull()
    expect(validatePassengerAge('121')).not.toBeNull()
  })

  it('rejects non-numeric and empty input', () => {
    expect(validatePassengerAge('abc')).not.toBeNull()
    expect(validatePassengerAge('')).not.toBeNull()
    expect(validatePassengerAge('12.5')).not.toBeNull()
  })
})

describe('validatePassengerGender', () => {
  it('requires a non-empty gender regardless of womenOnly', () => {
    expect(validatePassengerGender('', false)).not.toBeNull()
    expect(validatePassengerGender('', true)).not.toBeNull()
  })

  it('rejects any gender other than Female on a women-only seat', () => {
    expect(validatePassengerGender('Male', true)).not.toBeNull()
    expect(validatePassengerGender('Other', true)).not.toBeNull()
  })

  it('accepts Female on a women-only seat', () => {
    expect(validatePassengerGender('Female', true)).toBeNull()
  })

  it('accepts any non-empty gender on a non-women-only seat', () => {
    expect(validatePassengerGender('Male', false)).toBeNull()
    expect(validatePassengerGender('Female', false)).toBeNull()
    expect(validatePassengerGender('Other', false)).toBeNull()
  })
})

describe('validateMobileNumber', () => {
  it('accepts exactly 10 digits', () => {
    expect(validateMobileNumber('9876543210')).toBeNull()
  })

  it('rejects shorter, longer or non-digit input', () => {
    expect(validateMobileNumber('98765')).not.toBeNull()
    expect(validateMobileNumber('98765432109876')).not.toBeNull()
    expect(validateMobileNumber('98765abcde')).not.toBeNull()
    expect(validateMobileNumber('')).not.toBeNull()
  })
})

describe('validateEmail', () => {
  it('rejects an empty address', () => {
    expect(validateEmail('')).not.toBeNull()
    expect(validateEmail('   ')).not.toBeNull()
  })

  it('rejects a syntactically invalid address', () => {
    expect(validateEmail('not-an-email')).not.toBeNull()
    expect(validateEmail('a@b')).not.toBeNull()
    expect(validateEmail('@b.com')).not.toBeNull()
  })

  it('accepts a syntactically valid address', () => {
    expect(validateEmail('a@b.com')).toBeNull()
  })
})
