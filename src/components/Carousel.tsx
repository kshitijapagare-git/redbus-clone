import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

export interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  prevLabel?: string
  nextLabel?: string
  /** Optional key extractor; defaults to the item's index. */
  getKey?: (item: T, index: number) => string | number
}

// A pixel of slack so sub-pixel scroll positions still count as "at the edge".
const EDGE_TOLERANCE = 1

/**
 * Horizontally scrolling list of cards. The arrows reflect the track's real
 * scroll position, so they stay correct however the track moves: arrow
 * buttons, the keyboard, a touch swipe (native overflow scrolling) or a
 * resize that makes every card fit.
 */
function Carousel<T>({
  items,
  renderItem,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  getKey,
}: CarouselProps<T>) {
  const trackRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const [canGoPrev, setCanGoPrev] = useState(false)
  const [canGoNext, setCanGoNext] = useState(false)

  const updateArrows = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setCanGoPrev(track.scrollLeft > EDGE_TOLERANCE)
    setCanGoNext(track.scrollLeft + track.clientWidth < track.scrollWidth - EDGE_TOLERANCE)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateArrows()
    track.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      track.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows, items.length])

  // One step is the distance between two neighbouring cards (card width plus
  // the gap), falling back to most of the visible width.
  const stepSize = () => {
    const track = trackRef.current
    const [first, second] = itemRefs.current
    if (first && second && second.offsetLeft > first.offsetLeft) {
      return second.offsetLeft - first.offsetLeft
    }
    return track ? track.clientWidth * 0.8 : 0
  }

  const scrollByStep = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const maxLeft = track.scrollWidth - track.clientWidth
    const left = Math.max(0, Math.min(maxLeft, track.scrollLeft + direction * stepSize()))
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left, behavior: 'smooth' })
    } else {
      track.scrollLeft = left
      updateArrows()
    }
  }

  const goPrev = () => {
    if (canGoPrev) scrollByStep(-1)
  }

  const goNext = () => {
    if (canGoNext) scrollByStep(1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
    }
  }

  return (
    <div className="carousel" tabIndex={0} onKeyDown={handleKeyDown}>
      <ul className="carousel-track" ref={trackRef}>
        {items.map((item, index) => (
          <li
            key={getKey ? getKey(item, index) : index}
            className="carousel-item"
            ref={(el) => {
              itemRefs.current[index] = el
            }}
          >
            {renderItem(item, index)}
          </li>
        ))}
      </ul>
      {canGoPrev && (
        <button type="button" className="carousel-arrow carousel-arrow-prev" aria-label={prevLabel} onClick={goPrev}>
          ‹
        </button>
      )}
      {canGoNext && (
        <button type="button" className="carousel-arrow carousel-arrow-next" aria-label={nextLabel} onClick={goNext}>
          ›
        </button>
      )}
    </div>
  )
}

export default Carousel
