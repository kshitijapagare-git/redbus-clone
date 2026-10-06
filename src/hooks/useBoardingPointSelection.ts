import { useCallback, useEffect, useState } from 'react'
import { BOARDING_POINT_PARAM, parseBoardingPointId, withBoardingPointId } from '../lib/boardingPointSelection'

export interface UseBoardingPointSelectionResult {
  rawId: number | null
  select: (id: number) => void
  clear: () => void
}

function readRawId(paramKey: string): number | null {
  return parseBoardingPointId(window.location.search, paramKey)
}

function writeBoardingPointId(id: number | null, paramKey: string): void {
  const newSearch = withBoardingPointId(window.location.search, id, paramKey)
  const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`
  window.history.replaceState(window.history.state, '', newUrl)
  // There is no router in this app, so other mounted instances of this hook
  // (used from both SearchCard and BoardingPointList) need an explicit nudge
  // to re-read window.location.search — a manual popstate dispatch keeps the
  // URL as the single source of truth without prop drilling the selection.
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Usable outside React render for one-off side effects (e.g. clearing on search change). */
export function clearBoardingPointSelection(paramKey: string = BOARDING_POINT_PARAM): void {
  writeBoardingPointId(null, paramKey)
}

export function useBoardingPointSelection(
  paramKey: string = BOARDING_POINT_PARAM,
): UseBoardingPointSelectionResult {
  const [rawId, setRawId] = useState<number | null>(() => readRawId(paramKey))

  useEffect(() => {
    const handlePopState = () => {
      setRawId(readRawId(paramKey))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [paramKey])

  const select = useCallback(
    (id: number) => {
      writeBoardingPointId(id, paramKey)
    },
    [paramKey],
  )

  const clear = useCallback(() => {
    clearBoardingPointSelection(paramKey)
  }, [paramKey])

  return { rawId, select, clear }
}

export default useBoardingPointSelection
