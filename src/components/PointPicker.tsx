import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { BoardingPoint, City } from '../types'
import { useBoardingPointSelection } from '../hooks/useBoardingPointSelection'
import { resolveSelectedBoardingPoint } from '../lib/boardingPointSelection'

export interface PointPickerProps {
  label: string
  paramKey: 'bp' | 'dp'
  points: BoardingPoint[]
  cityId: City['id'] | null
}

/**
 * A radiogroup picker for a single boarding or dropping point, reusing the
 * same selection lib/hook and roving-tabIndex keyboard behaviour as
 * BoardingPointList, but generalized to work against either the `bp` or
 * `dp` URL param so it can be rendered twice on the same page (once for
 * boarding, once for dropping) without the two selections interfering.
 */
function PointPicker({ label, paramKey, points, cityId }: PointPickerProps) {
  const { rawId, select } = useBoardingPointSelection(paramKey)
  const selectedPoint = resolveSelectedBoardingPoint(rawId, points, cityId)
  const selectedIndex = selectedPoint ? points.findIndex((p) => p.id === selectedPoint.id) : -1

  const [focusedIndex, setFocusedIndex] = useState(0)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    if (selectedIndex >= 0) {
      setFocusedIndex(selectedIndex)
    }
  }, [selectedIndex])

  const moveFocus = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(points.length - 1, nextIndex))
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
      select(points[index].id)
    }
  }

  return (
    <div className="point-picker">
      <h3 className="point-picker-label">{label}</h3>
      <ul className="bp-grid point-picker-grid" role="radiogroup" aria-label={label}>
        {points.map((point, index) => {
          const isSelected = selectedPoint?.id === point.id
          return (
            <li
              key={point.id}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              role="radio"
              aria-checked={isSelected}
              tabIndex={index === focusedIndex ? 0 : -1}
              className={`bp-card${isSelected ? ' selected' : ''}`}
              onClick={() => select(point.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
            >
              <strong>{point.name}</strong> — {point.address}, {point.landmark}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PointPicker
