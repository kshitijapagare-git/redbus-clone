import type { BusSearchFilterState } from '../hooks/useBusSearchFilters'
import type { BusTypeToken, SortKey, TimeBucket } from '../lib/busSearchParams'
import FareRangeSlider from './FareRangeSlider'

const BUS_TYPE_OPTIONS: { token: BusTypeToken; label: string }[] = [
  { token: 'AC', label: 'AC' },
  { token: 'Non-AC', label: 'Non-AC' },
  { token: 'Seater', label: 'Seater' },
  { token: 'Sleeper', label: 'Sleeper' },
]

const TIME_OPTIONS: { value: TimeBucket; label: string }[] = [
  { value: 'early', label: 'Before 6 AM' },
  { value: 'morning', label: '6 AM - 12 PM' },
  { value: 'afternoon', label: '12 PM - 6 PM' },
  { value: 'night', label: 'After 6 PM' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'departure', label: 'Departure (earliest)' },
  { value: 'fare', label: 'Fare (lowest)' },
  { value: 'duration', label: 'Duration (shortest)' },
  { value: 'rating', label: 'Rating (highest)' },
]

export interface BusFilterPanelProps {
  isMobile: boolean
  /** The filter values currently in effect for the controls: `draft` on mobile, `committed` on desktop. */
  state: BusSearchFilterState
  fareBounds: { min: number; max: number }
  setType: (t: Set<BusTypeToken>) => void
  setTime: (t: TimeBucket | null) => void
  setFareRange: (min: number, max: number) => void
  setWomen: (v: boolean) => void
  setSort: (s: SortKey) => void
  applyDraft: () => void
  resetDraft: () => void
  clearFilters: () => void
}

function BusFilterPanel({
  isMobile,
  state,
  fareBounds,
  setType,
  setTime,
  setFareRange,
  setWomen,
  setSort,
  applyDraft,
  resetDraft,
  clearFilters,
}: BusFilterPanelProps) {
  const toggleType = (token: BusTypeToken) => {
    const next = new Set(state.type)
    if (next.has(token)) {
      next.delete(token)
    } else {
      next.add(token)
    }
    setType(next)
  }

  const content = (
    <>
      <div className="bus-filter-panel-head">
        <h2>Filters</h2>
        <button type="button" className="bus-filter-clear-btn" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      <fieldset className="bus-filter-group">
        <legend>Bus type</legend>
        {BUS_TYPE_OPTIONS.map((option) => {
          const inputId = `bus-type-${option.token}`
          return (
            <div className="bus-filter-checkbox-row" key={option.token}>
              <input
                id={inputId}
                type="checkbox"
                checked={state.type.has(option.token)}
                onChange={() => toggleType(option.token)}
              />
              <label htmlFor={inputId}>{option.label}</label>
            </div>
          )
        })}
      </fieldset>

      <fieldset className="bus-filter-group">
        <legend>Departure time</legend>
        {TIME_OPTIONS.map((option) => {
          const inputId = `bus-time-${option.value}`
          return (
            <div className="bus-filter-checkbox-row" key={option.value}>
              <input
                id={inputId}
                type="radio"
                name="bus-departure-time"
                checked={state.time === option.value}
                onChange={() => setTime(option.value)}
              />
              <label htmlFor={inputId}>{option.label}</label>
            </div>
          )
        })}
      </fieldset>

      <fieldset className="bus-filter-group">
        <legend>Fare range</legend>
        <FareRangeSlider
          min={fareBounds.min}
          max={fareBounds.max}
          valueMin={state.fareMin ?? fareBounds.min}
          valueMax={state.fareMax ?? fareBounds.max}
          onChange={setFareRange}
        />
      </fieldset>

      <fieldset className="bus-filter-group">
        <legend>Sort by</legend>
        {SORT_OPTIONS.map((option) => {
          const inputId = `bus-sort-${option.value}`
          return (
            <div className="bus-filter-checkbox-row" key={option.value}>
              <input
                id={inputId}
                type="radio"
                name="bus-sort"
                checked={state.sort === option.value}
                onChange={() => setSort(option.value)}
              />
              <label htmlFor={inputId}>{option.label}</label>
            </div>
          )
        })}
      </fieldset>

      <div className="bus-filter-checkbox-row">
        <input
          id="bus-women-friendly"
          type="checkbox"
          checked={state.women}
          onChange={(e) => setWomen(e.target.checked)}
        />
        <label htmlFor="bus-women-friendly">Women friendly</label>
      </div>
    </>
  )

  if (!isMobile) {
    return <div className="bus-filter-panel">{content}</div>
  }

  return (
    <div className="bus-filter-sheet-backdrop">
      <div role="dialog" aria-label="Filters" className="bus-filter-sheet">
        {content}
        <div className="bus-filter-sheet-actions">
          <button type="button" className="bus-filter-sheet-cancel" onClick={resetDraft}>
            Cancel
          </button>
          <button type="button" className="bus-filter-sheet-apply" onClick={applyDraft}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default BusFilterPanel
