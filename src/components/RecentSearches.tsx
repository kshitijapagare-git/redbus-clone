import type { City, RecentSearch } from '../types'
import { formatRecentSearchDate, isPastDate } from '../lib/recentSearches'

export interface RecentSearchesProps {
  searches: RecentSearch[]
  cities: City[]
  today: Date
  onSelect: (search: RecentSearch) => void
  onRemove: (index: number) => void
  onClearAll: () => void
}

function RecentSearches({ searches, cities, today, onSelect, onRemove, onClearAll }: RecentSearchesProps) {
  if (searches.length === 0) return null

  const cityName = (id: City['id']) => cities.find((c) => c.id === id)?.name ?? '—'

  return (
    <div className="recent-searches">
      <div className="recent-searches-head">
        <span>Recent searches</span>
        <button type="button" className="recent-searches-clear" onClick={onClearAll}>
          Clear all
        </button>
      </div>
      <ul className="recent-searches-list">
        {searches.map((search, index) => {
          const past = isPastDate(search.date, today)
          return (
            <li key={`${search.fromCityId}-${search.toCityId}-${index}`}>
              <div
                role="button"
                tabIndex={0}
                className={`recent-search-chip${past ? ' recent-search-past' : ''}`}
                onClick={() => onSelect(search)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(search)
                  }
                }}
              >
                <span>
                  {cityName(search.fromCityId)} → {cityName(search.toCityId)} · {formatRecentSearchDate(search.date)}
                </span>
                {past && <span className="recent-search-past-badge">Past</span>}
                <button
                  type="button"
                  aria-label="Remove recent search"
                  className="recent-search-remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(index)
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RecentSearches
