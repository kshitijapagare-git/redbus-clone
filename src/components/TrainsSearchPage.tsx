import { cities } from '../data'
import type { City } from '../types'

const FREE_CANCELLATION_PARAM = 'freeCancellation'

function resolveStationName(id: string | null): string {
  if (id === null) return '—'
  const numericId = Number(id)
  const city = cities.find((c) => c.id === (numericId as City['id']))
  return city ? city.name : '—'
}

function TrainsSearchPage() {
  const params = new URLSearchParams(window.location.search)
  const fromName = resolveStationName(params.get('from'))
  const toName = resolveStationName(params.get('to'))
  const date = params.get('date') ?? '—'
  const freeCancellation = params.get(FREE_CANCELLATION_PARAM) === '1'

  return (
    <main className="trains-search-page">
      <div className="container">
        <h1>Searching trains…</h1>
        <p>
          {fromName} → {toName} · {date}
        </p>
        {freeCancellation && <p>Free cancellation requested</p>}
        <p>Train search results are coming soon. Check back shortly.</p>
      </div>
    </main>
  )
}

export default TrainsSearchPage
