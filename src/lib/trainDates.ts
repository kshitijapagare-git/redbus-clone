const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const pad = (n: number) => String(n).padStart(2, '0')

/** Formats a Date as 'DD MMM, YYYY', e.g. '07 Oct, 2026'. */
export function formatTrainDate(date: Date): string {
  const day = pad(date.getDate())
  const month = MONTH_LABELS[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month}, ${year}`
}
