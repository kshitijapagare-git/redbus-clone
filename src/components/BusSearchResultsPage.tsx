import { useEffect, useState } from 'react'
import BusCard from './BusCard'
import BusFilterPanel from './BusFilterPanel'
import { buses, cities } from '../data'
import { useBusSearchFilters } from '../hooks/useBusSearchFilters'
import { fareBounds, filterBuses, routeIdFor, sortBuses } from '../lib/busFilters'
import { formatRecentSearchDate } from '../lib/recentSearches'

const MOBILE_BREAKPOINT = 900

function useIsMobile(): boolean {
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewportWidth < MOBILE_BREAKPOINT
}

function BusSearchResultsPage() {
  const isMobile = useIsMobile()
  const {
    routeError,
    fromCityId,
    toCityId,
    date,
    committed,
    draft,
    warnings,
    setType,
    setTime,
    setFareRange,
    setWomen,
    setSort,
    applyDraft,
    resetDraft,
    clearFilters,
  } = useBusSearchFilters(isMobile)

  if (routeError) {
    return (
      <main className="bus-results-page">
        <div className="container">
          <p role="alert" className="bus-route-error">
            {routeError}
          </p>
        </div>
      </main>
    )
  }

  const fromCity = cities.find((c) => c.id === fromCityId)
  const toCity = cities.find((c) => c.id === toCityId)
  const routeId = routeIdFor(fromCityId as number, toCityId as number)
  const routeBuses = buses.filter((b) => b.routeId === routeId)
  const bounds = fareBounds(routeBuses)

  const filteredBuses = filterBuses(routeBuses, {
    type: committed.type,
    time: committed.time,
    fareMin: committed.fareMin,
    fareMax: committed.fareMax,
    women: committed.women,
  })
  const sortedBuses = sortBuses(filteredBuses, committed.sort)

  const panelState = isMobile ? draft : committed

  return (
    <main className="bus-results-page">
      <div className="container bus-results-page-inner">
        <div className="bus-results-header">
          <h1>
            {fromCity?.name} → {toCity?.name} · {date ? formatRecentSearchDate(date) : ''}
          </h1>
          <p aria-live="polite" className="bus-results-count">
            {sortedBuses.length} buses found
          </p>
        </div>

        {warnings.length > 0 && (
          <div className="bus-warning-banner" role="status">
            {warnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
        )}

        <div className="bus-results-body">
          {sortedBuses.length === 0 ? (
            <div className="bus-empty-state">
              <p>No buses match your filters.</p>
              <button type="button" className="bus-empty-clear-btn" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <BusFilterPanel
                isMobile={isMobile}
                state={panelState}
                fareBounds={bounds}
                setType={setType}
                setTime={setTime}
                setFareRange={setFareRange}
                setWomen={setWomen}
                setSort={setSort}
                applyDraft={applyDraft}
                resetDraft={resetDraft}
                clearFilters={clearFilters}
              />

              <ul className="bus-list">
                {sortedBuses.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default BusSearchResultsPage
