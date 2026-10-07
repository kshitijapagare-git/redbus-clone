export const MOCK_FAILURE_CARD_NUMBER = '4000000000000002'
export const MOCK_FAILURE_UPI_ID = 'fail@bank'

/** Validates a UPI id of the shape `name@bank`. Returns an error message, or null when valid. */
export function validateUpiId(id: string): string | null {
  const trimmed = id.trim()
  if (trimmed === '') return 'UPI ID is required.'
  const parts = trimmed.split('@')
  if (parts.length !== 2) return 'Enter a valid UPI ID in the form name@bank.'
  const [name, bank] = parts
  if (name.length === 0 || bank.length === 0) return 'Enter a valid UPI ID in the form name@bank.'
  return null
}

/** Luhn checksum check for a card number. Non-digit characters (spaces) are ignored. */
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length === 0) return false

  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

/** Validates a card number: digits only (ignoring spaces), length 13-19, and passes the Luhn check. */
export function validateCardNumber(cardNumber: string): string | null {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return 'Enter a valid card number.'
  if (!luhnCheck(digits)) return 'Enter a valid card number.'
  return null
}

const EXPIRY_PATTERN = /^(\d{2})\/(\d{2})$/

/** Validates an MM/YY expiry string: valid month, and not in the past relative to `now`. */
export function validateCardExpiry(expiry: string, now: Date = new Date()): string | null {
  const match = EXPIRY_PATTERN.exec(expiry.trim())
  if (!match) return 'Enter expiry as MM/YY.'

  const month = Number(match[1])
  const year = Number(match[2])
  if (month < 1 || month > 12) return 'Enter expiry as MM/YY.'

  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Card has expired.'
  }

  return null
}

/** Validates a CVV: exactly 3 digits. */
export function validateCvv(cvv: string): string | null {
  if (!/^\d{3}$/.test(cvv.trim())) return 'CVV must be exactly 3 digits.'
  return null
}

/** Masks all but the last 4 digits of a card number as '•••• 1234'. */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '')
  const last4 = digits.slice(-4)
  return `•••• ${last4}`
}

export interface UpiPaymentDetails {
  id: string
}

export interface CardPaymentDetails {
  number: string
  expiry: string
  cvv: string
}

export interface NetbankingPaymentDetails {
  bank: string
}

/**
 * Encodes the two mock-failure rules: the test card number 4000 0000 0000
 * 0002 always fails, and the UPI id fail@bank always fails. Everything else
 * is treated as a successful mock payment.
 */
export function isMockPaymentFailure(
  method: 'upi' | 'card' | 'netbanking',
  details: Record<string, string>,
): boolean {
  if (method === 'card') {
    const digits = (details.number ?? '').replace(/\D/g, '')
    return digits === MOCK_FAILURE_CARD_NUMBER
  }
  if (method === 'upi') {
    return (details.id ?? '').trim().toLowerCase() === MOCK_FAILURE_UPI_ID
  }
  return false
}
