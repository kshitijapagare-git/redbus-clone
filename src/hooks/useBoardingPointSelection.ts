import { useCallback, useEffect, useState } from 'react'
import { parseBoardingPointId, withBoardingPointId } from '../lib/boardingPointSelection'

export interface UseBoardingPointSelectionResult {
  rawId: number | null
  select: (id: number) => void
  clear: () => void
}

function readRawId(): number | null {
  return parseBoardingPointId(window.location.search)
}

function writeBoardingPointId(id: number | null): void {
  const newSearch = withBoardingPointId(window.location.search, id)
  const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`
  window.history.replaceState(window.history.state, '', newUrl)
  // There is no router in this app, so other mounted instances of this hook
  // (used from both SearchCard and BoardingPointList) need an explicit nudge
  // to re-read window.location.search — a manual popstate dispatch keeps the
  // URL as the single source of truth without prop drilling the selection.
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Usable outside React render for one-off side effects (e.g. clearing on search change). */
export function clearBoardingPointSelection(): void {
  writeBoardingPointId(null)
}

export function useBoardingPointSelection(): UseBoardingPointSelectionResult {
  const [rawId, setRawId] = useState<number | null>(() => readRawId())

  useEffect(() => {
    const handlePopState = () => {
      setRawId(readRawId())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const select = useCallback((id: number) => {
    writeBoardingPointId(id)
  }, [])

  const clear = useCallback(() => {
    clearBoardingPointSelection()
  }, [])

  return { rawId, select, clear }
}

export default useBoardingPointSelection
