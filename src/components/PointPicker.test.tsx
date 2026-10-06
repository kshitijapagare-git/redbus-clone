import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import PointPicker from './PointPicker'
import type { BoardingPoint } from '../types'

const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
]

const droppingPoints: BoardingPoint[] = [
  { id: 7, name: 'Majestic', address: 'Kempegowda Bus Station', landmark: 'Opp. Railway Station', cityId: 2 },
  { id: 8, name: 'Electronic City', address: 'Hosur Road', landmark: 'Near Infosys Gate', cityId: 2 },
]

describe('PointPicker', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('renders a radiogroup of the given points with none checked initially', () => {
    render(<PointPicker label="Boarding point" paramKey="bp" points={boardingPoints} cityId={1} />)

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute('aria-checked', 'false')
      expect(radio).not.toHaveClass('selected')
    })
  })

  it('selects a point on click, marking aria-checked and the selected class', () => {
    render(<PointPicker label="Boarding point" paramKey="bp" points={boardingPoints} cityId={1} />)
    const radios = screen.getAllByRole('radio')

    fireEvent.click(radios[0])

    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(radios[0]).toHaveClass('selected')
    expect(window.location.search).toBe('?bp=1')
  })

  it('selects the focused point with Enter or Space, and moves focus with arrow keys', () => {
    render(<PointPicker label="Boarding point" paramKey="bp" points={boardingPoints} cityId={1} />)
    const radios = screen.getAllByRole('radio')

    radios[0].focus()
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' })
    expect(radios[1]).toHaveFocus()

    fireEvent.keyDown(radios[1], { key: 'Enter' })
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(window.location.search).toBe('?bp=2')
  })

  it('holds an independent selection from a second instance using paramKey "dp"', () => {
    render(
      <>
        <PointPicker label="Boarding point" paramKey="bp" points={boardingPoints} cityId={1} />
        <PointPicker label="Dropping point" paramKey="dp" points={droppingPoints} cityId={2} />
      </>,
    )

    const [boardingRadios, droppingRadios] = screen.getAllByRole('radiogroup').map((group) =>
      Array.from(group.querySelectorAll('[role="radio"]')),
    )

    fireEvent.click(boardingRadios[0])
    fireEvent.click(droppingRadios[1])

    expect(window.location.search).toContain('bp=1')
    expect(window.location.search).toContain('dp=8')
    expect(boardingRadios[0]).toHaveAttribute('aria-checked', 'true')
    expect(droppingRadios[1]).toHaveAttribute('aria-checked', 'true')
    expect(droppingRadios[0]).toHaveAttribute('aria-checked', 'false')
  })
})
