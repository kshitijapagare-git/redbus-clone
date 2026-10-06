import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Carousel from './Carousel'
import { mockCarouselLayout } from '../test-utils/carouselLayout'

const items = ['Alpha', 'Beta', 'Gamma']

// Three 100px-step cards in a 150px-wide track: the track can scroll 150px.
const renderOverflowing = () => {
  const result = render(
    <Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />,
  )
  const track = mockCarouselLayout(result.container, { clientWidth: 150, step: 100 })
  return { ...result, track }
}

describe('Carousel', () => {
  it('hides the prev arrow at the start and shows the next arrow', () => {
    renderOverflowing()

    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('hides the next arrow at the end and shows the prev arrow', () => {
    renderOverflowing()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
  })

  it('moves forward/back when the arrow buttons are clicked', () => {
    const { track } = renderOverflowing()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(track.scrollLeft).toBe(100)
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }))
    expect(track.scrollLeft).toBe(0)
    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
  })

  it('moves forward/back with ArrowRight/ArrowLeft keyboard navigation', () => {
    const { container, track } = renderOverflowing()
    const carousel = container.querySelector('.carousel') as HTMLElement

    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(track.scrollLeft).toBe(100)

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    expect(track.scrollLeft).toBe(0)
  })

  it('updates the arrows when the track is scrolled directly, e.g. by a touch swipe', () => {
    const { track } = renderOverflowing()

    track.scrollLeft = 150
    fireEvent.scroll(track)

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
  })

  it('shows no arrows when every card already fits', () => {
    const { container } = render(
      <Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />,
    )
    mockCarouselLayout(container, { clientWidth: 400, step: 100 })

    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })
})
