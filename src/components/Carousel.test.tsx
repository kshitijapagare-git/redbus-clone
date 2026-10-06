import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Carousel from './Carousel'

const items = ['Alpha', 'Beta', 'Gamma']

describe('Carousel', () => {
  it('hides the prev arrow at the start and shows the next arrow', () => {
    render(<Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />)

    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('hides the next arrow at the end and shows the prev arrow', () => {
    render(<Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />)

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
  })

  it('moves forward/back when the arrow buttons are clicked', () => {
    render(<Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />)

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }))
    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
  })

  it('moves forward/back with ArrowRight/ArrowLeft keyboard navigation', () => {
    const { container } = render(
      <Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />,
    )
    const carousel = container.querySelector('.carousel') as HTMLElement

    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
  })

  it('triggers next on a swipe left past the 50px threshold', () => {
    const { container } = render(
      <Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />,
    )
    const carousel = container.querySelector('.carousel') as HTMLElement

    fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 140 }] })

    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
  })

  it('does not trigger next on a swipe shorter than the 50px threshold', () => {
    const { container } = render(
      <Carousel items={items} renderItem={(item) => <span>{item}</span>} prevLabel="Prev" nextLabel="Next" />,
    )
    const carousel = container.querySelector('.carousel') as HTMLElement

    fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 170 }] })

    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
  })
})
