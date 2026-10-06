import { fireEvent } from '@testing-library/react'

interface CarouselLayout {
  /** Visible width of the track. */
  clientWidth: number
  /** Distance from one card's left edge to the next (card width + gap). */
  step: number
}

/**
 * jsdom has no layout, so a carousel track always reports zero sizes. This
 * gives the track a visible width, a scrollable width and per-card offsets,
 * and makes scrollTo update scrollLeft and fire a scroll event the way a
 * browser would. Call it right after render.
 */
export function mockCarouselLayout(container: HTMLElement, { clientWidth, step }: CarouselLayout): HTMLElement {
  const track = container.querySelector('.carousel-track') as HTMLElement
  const items = Array.from(track.querySelectorAll<HTMLElement>('.carousel-item'))
  let scrollLeft = 0

  items.forEach((item, index) => {
    Object.defineProperty(item, 'offsetLeft', { configurable: true, value: index * step })
  })
  Object.defineProperty(track, 'clientWidth', { configurable: true, value: clientWidth })
  Object.defineProperty(track, 'scrollWidth', { configurable: true, value: items.length * step })
  Object.defineProperty(track, 'scrollLeft', {
    configurable: true,
    get: () => scrollLeft,
    set: (value: number) => {
      scrollLeft = value
    },
  })
  track.scrollTo = ((options: ScrollToOptions) => {
    scrollLeft = options.left ?? scrollLeft
    fireEvent.scroll(track)
  }) as typeof track.scrollTo

  // Let the carousel read the new layout.
  fireEvent.scroll(track)
  return track
}
