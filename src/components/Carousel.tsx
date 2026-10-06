import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, TouchEvent } from 'react'

export const SWIPE_THRESHOLD = 50

export interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  prevLabel?: string
  nextLabel?: string
  /** Optional key extractor; defaults to the item's index. */
  getKey?: (item: T, index: number) => string | number
}

function Carousel<T>({
  items,
  renderItem,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  getKey,
}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const trackRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const touchStartXRef = useRef<number | null>(null)

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < items.length - 1

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, index))
    setCurrentIndex(clamped)
    const target = itemRefs.current[clamped]
    target?.scrollIntoView?.({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  const goPrev = () => {
    if (canGoPrev) goTo(currentIndex - 1)
  }

  const goNext = () => {
    if (canGoNext) goTo(currentIndex + 1)
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

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current
    touchStartXRef.current = null
    if (startX === null) return
    const endX = e.changedTouches[0]?.clientX
    if (endX === undefined) return
    const diff = startX - endX
    if (diff > SWIPE_THRESHOLD) {
      goNext()
    } else if (diff < -SWIPE_THRESHOLD) {
      goPrev()
    }
  }

  return (
    <div
      className="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
