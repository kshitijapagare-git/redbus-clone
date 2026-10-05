import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { BoardingPoint, City } from '../types'
import { useBoardingPointSelection } from '../hooks/useBoardingPointSelection'
import { resolveSelectedBoardingPoint } from '../lib/boardingPointSelection'

interface Props {
  cities: City[]
  boardingPoints: BoardingPoint[]
  fromCityId: City['id'] | null
}

function BoardingPointList({ cities, boardingPoints, fromCityId }: Props) {
  const { rawId, select } = useBoardingPointSelection()
  const selectedPoint = resolveSelectedBoardingPoint(rawId, boardingPoints, fromCityId)
  const selectedIndex = selectedPoint ? boardingPoints.findIndex((bp) => bp.id === selectedPoint.id) : -1

  const [focusedIndex, setFocusedIndex] = useState(0)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  // Keep the roving tabIndex pointed at the currently selected item whenever
  // the selection changes (e.g. reading a `bp` from the URL on mount), so
  // keyboard focus lands somewhere meaningful without requiring a click first.
  useEffect(() => {
    if (selectedIndex >= 0) {
      setFocusedIndex(selectedIndex)
    }
  }, [selectedIndex])

  const moveFocus = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(boardingPoints.length - 1, nextIndex))
    setFocusedIndex(clamped)
    itemRefs.current[clamped]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      moveFocus(index + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      moveFocus(index - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      select(boardingPoints[index].id)
    }
  }

  const selectedCity = selectedPoint ? cities.find((c) => c.id === selectedPoint.cityId) : undefined

  return (
    <>
      {selectedPoint && (
        <div className="bp-summary">
          <strong>{selectedPoint.name}</strong>
          <p>
            {selectedPoint.address}, {selectedPoint.landmark}
          </p>
          {selectedCity && (
            <p>
              {selectedCity.name}, {selectedCity.state}
            </p>
          )}
        </div>
      )}
      <ul className="bp-grid" role="radiogroup">
        {boardingPoints.map((bp, index) => {
          const city = cities.find((c) => c.id === bp.cityId)
          const isSelected = selectedPoint?.id === bp.id
          return (
            <li
              key={bp.id}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              role="radio"
              aria-checked={isSelected}
              tabIndex={index === focusedIndex ? 0 : -1}
              className={`bp-card${isSelected ? ' selected' : ''}`}
              onClick={() => select(bp.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
            >
              <strong>{bp.name}</strong> — {bp.address}, {bp.landmark}
              {city && ` (${city.name}, ${city.state})`}
            </li>
          )
        })}
      </ul>
      <button type="button" className="bp-continue-btn" disabled={!selectedPoint}>
        Continue
      </button>
    </>
  )
}

export default BoardingPointList
