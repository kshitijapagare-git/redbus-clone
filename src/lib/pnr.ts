const PNR_LENGTH = 10
const PNR_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomPnrCandidate(): string {
  let result = ''
  for (let i = 0; i < PNR_LENGTH; i++) {
    result += PNR_CHARS[Math.floor(Math.random() * PNR_CHARS.length)]
  }
  return result
}

/**
 * Generates a random 10-character PNR (uppercase A-Z and 0-9 only),
 * retrying until the result is not already present in `existingPnrs`.
 */
export function generatePnr(existingPnrs: Set<string>): string {
  let candidate = randomPnrCandidate()
  while (existingPnrs.has(candidate)) {
    candidate = randomPnrCandidate()
  }
  return candidate
}

export default generatePnr
