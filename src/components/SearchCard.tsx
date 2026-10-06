import { useEffect, useRef, useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import RecentSearches from './RecentSearches'
import WomenInfoDialog from './WomenInfoDialog'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { isPastDate, toDateKey } from '../lib/recentSearches'
import { clearBoardingPointSelection } from '../hooks/useBoardingPointSelection'
import { loadWomenToggle, persistWomenToggle } from '../lib/womenToggle'
import { buildBusSearchUrl } from '../lib/buildSearchUrl'
import { navigateTo } from '../lib/route'
import { cities } from '../data'
import type { City, RecentSearch } from '../types'

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}, ${d.getFullYear()}`

interface SearchErrors {
  from?: string
  to?: string
}

export interface SearchCardProps {
  fromCityId?: City['id'] | null
  onFromCityIdChange?: (id: City['id'] | null) => void
}

function SearchCard({ fromCityId: fromCityIdProp, onFromCityIdChange }: SearchCardProps = {}) {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [forWomen, setForWomen] = useState(() => loadWomenToggle().value)
  const [internalFromCityId, setInternalFromCityId] = useState<City['id'] | null>(null)
  const [toCityId, setToCityId] = useState<City['id'] | null>(null)
  const [errors, setErrors] = useState<SearchErrors>({})
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
  const knowMoreLinkRef = useRef<HTMLAnchorElement>(null)
  const { searches, available, save, remove, clearAll } = useRecentSearches(cities)

  const fromCityId = fromCityIdProp !== undefined ? fromCityIdProp : internalFromCityId
  const setFromCityId = onFromCityIdChange ?? setInternalFromCityId

  const date = new Date(today)
  date.setDate(today.getDate() + dayOffset)

  // Any change to From/To/date/women-toggle after the initial mount clears the
  // existing boarding point selection. The ref guard prevents this from firing
  // on mount, which would otherwise wipe a `bp` the user arrived with.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    clearBoardingPointSelection()
  }, [fromCityId, toCityId, dayOffset, forWomen])

  const computeErrors = (from: City['id'] | null, to: City['id'] | null): SearchErrors => {
    const nextErrors: SearchErrors = {}
    if (from === null) nextErrors.from = 'Please select a departure city'
    if (to === null) nextErrors.to = 'Please select a destination city'
    if (from !== null && to !== null && from === to) {
      nextErrors.from = 'From and To cities must be different'
      nextErrors.to = 'From and To cities must be different'
    }
    return nextErrors
  }

  const handleSearchSubmit = () => {
    const nextErrors = computeErrors(fromCityId, toCityId)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      save({ fromCityId: fromCityId as City['id'], toCityId: toCityId as City['id'], date: toDateKey(date) })
      const url = buildBusSearchUrl({
        fromCityId: fromCityId as City['id'],
        toCityId: toCityId as City['id'],
        date: toDateKey(date),
        women: forWomen,
      })
      navigateTo(url)
    }
    return Object.keys(nextErrors).length === 0
  }

  const handleToggleWomen = () => {
    setForWomen((v) => {
      const next = !v
      persistWomenToggle(next)
      return next
    })
  }

  const handleSwap = () => {
    const nextFrom = toCityId
    const nextTo = fromCityId
    setFromCityId(nextFrom)
    setToCityId(nextTo)
    if (Object.keys(errors).length > 0) {
      setErrors(computeErrors(nextFrom, nextTo))
    }
  }

  const handleSelectRecent = (search: RecentSearch) => {
    setFromCityId(search.fromCityId)
    setToCityId(search.toCityId)
    setErrors(computeErrors(search.fromCityId, search.toCityId))

    if (isPastDate(search.date, today)) {
      setDayOffset(0)
      return
    }

    const todayKey = toDateKey(today)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const tomorrowKey = toDateKey(tomorrow)

    if (search.date === todayKey) {
      setDayOffset(0)
    } else if (search.date === tomorrowKey) {
      setDayOffset(1)
    } else {
      // Future date beyond tomorrow: the UI only supports today/tomorrow chips,
      // so clamp to the closest supported value.
      setDayOffset(1)
    }
  }

  return (
    <>
    <div className="search-card">
      <div className="search-row">
        <div className="search-fields">
          <div className="field combobox-field">
            <span className="field-icon">🚌</span>
            <div className="combobox-field-inner">
              <CityAutocomplete id="from-city" label="From" cities={cities} value={fromCityId} onChange={setFromCityId} />
              {errors.from && <span className="field-error">{errors.from}</span>}
            </div>
          </div>
          <button type="button" className="swap-btn" aria-label="Swap cities" onClick={handleSwap}>
            ⇄
          </button>
          <div className="field combobox-field">
            <span className="field-icon">🚌</span>
            <div className="combobox-field-inner">
              <CityAutocomplete id="to-city" label="To" cities={cities} value={toCityId} onChange={setToCityId} />
              {errors.to && <span className="field-error">{errors.to}</span>}
            </div>
          </div>
          <div className="field date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Date of Journey</small>
              <strong>{formatDate(date)}</strong>
              <em>{dayOffset === 0 ? '(Today)' : '(Tomorrow)'}</em>
            </div>
            <button type="button" className={`chip ${dayOffset === 0 ? 'chip-active' : ''}`} onClick={() => setDayOffset(0)}>
              Today
            </button>
            <button type="button" className={`chip ${dayOffset === 1 ? 'chip-active' : ''}`} onClick={() => setDayOffset(1)}>
              Tomorrow
            </button>
          </div>
        </div>
        <div className="women-box">
          <span className="women-icon">👩</span>
          <div>
            <div>Booking for women</div>
            <a
              href="#"
              ref={knowMoreLinkRef}
              onClick={(e) => {
                e.preventDefault()
                setIsInfoDialogOpen(true)
              }}
            >
              Know more
            </a>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forWomen}
            aria-label="Booking for women"
            className={`toggle ${forWomen ? 'on' : ''}`}
            onClick={handleToggleWomen}
          />
        </div>
      </div>
      <button type="button" className="search-btn" onClick={handleSearchSubmit}>⌕ Search buses</button>
    </div>
    <WomenInfoDialog
      isOpen={isInfoDialogOpen}
      onClose={() => {
        setIsInfoDialogOpen(false)
        knowMoreLinkRef.current?.focus()
      }}
    />
    {available && searches.length > 0 && (
      <RecentSearches
        searches={searches}
        cities={cities}
        today={today}
        onSelect={handleSelectRecent}
        onRemove={remove}
        onClearAll={clearAll}
      />
    )}
    </>
  )
}


export default SearchCard
