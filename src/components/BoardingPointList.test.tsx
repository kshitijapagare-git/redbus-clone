import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import BoardingPointList from './BoardingPointList'
import type { BoardingPoint, City } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
  { id: 3, name: 'Majestic', address: 'Kempegowda Bus Station', landmark: 'Opp. Railway Station', cityId: 2 },
]

function getSummary(container: HTMLElement) {
  return container.querySelector('.bp-summary')
}

describe('BoardingPointList', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('renders a radiogroup with a radio per boarding point, none checked and no selected class initially', () => {
    const { container } = render(
      <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />,
    )

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute('aria-checked', 'false')
      expect(radio).not.toHaveClass('selected')
    })
    expect(getSummary(container)).toBeNull()
  })

  it('selects a boarding point on click: aria-checked, selected class and bp URL param', () => {
    render(<BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />)

    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios[0])

    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(radios[0]).toHaveClass('selected')
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')
    expect(window.location.search).toBe('?bp=1')
  })

  it('moves focus with ArrowRight/ArrowDown without changing selection', () => {
    render(<BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />)
    const radios = screen.getAllByRole('radio')

    radios[0].focus()
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' })

    expect(radios[1]).toHaveFocus()
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')

    fireEvent.keyDown(radios[1], { key: 'ArrowDown' })
    expect(radios[2]).toHaveFocus()
  })

  it('moves focus with ArrowLeft/ArrowUp without changing selection', () => {
    render(<BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />)
    const radios = screen.getAllByRole('radio')

    radios[2].focus()
    fireEvent.keyDown(radios[2], { key: 'ArrowLeft' })
    expect(radios[1]).toHaveFocus()

    fireEvent.keyDown(radios[1], { key: 'ArrowUp' })
    expect(radios[0]).toHaveFocus()
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
  })

  it('selects the focused item with Enter or Space', () => {
    render(<BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />)
    const radios = screen.getAllByRole('radio')

    radios[1].focus()
    fireEvent.keyDown(radios[1], { key: 'Enter' })

    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(window.location.search).toBe('?bp=2')

    radios[0].focus()
    fireEvent.keyDown(radios[0], { key: ' ' })
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
  })

  it('shows a summary panel above the grid with name, address, landmark and city when selected', () => {
    const { container } = render(
      <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />,
    )
    const radios = screen.getAllByRole('radio')

    fireEvent.click(radios[0])

    const summary = getSummary(container)
    expect(summary).not.toBeNull()
    expect(summary).toHaveTextContent('Shivajinagar')
    expect(summary).toHaveTextContent('FC Road, Near Modern Cafe')
    expect(summary).toHaveTextContent('Pune, Maharashtra')
  })

  it('pre-selects a boarding point from an existing bp URL param matching the From city', () => {
    window.history.replaceState(null, '', '/?bp=2')
    const { container } = render(
      <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />,
    )

    const radios = screen.getAllByRole('radio')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[1]).toHaveClass('selected')
    expect(getSummary(container)).toHaveTextContent('Hinjewadi')
  })

  it('ignores a bp param that does not match any boarding point id', () => {
    window.history.replaceState(null, '', '/?bp=999')
    const { container } = render(
      <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />,
    )

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveAttribute('aria-checked', 'false')
      expect(radio).not.toHaveClass('selected')
    })
    expect(getSummary(container)).toBeNull()
  })

  it('ignores a bp param whose boarding point belongs to a different city than fromCityId', () => {
    window.history.replaceState(null, '', '/?bp=3')
    const { container } = render(
      <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />,
    )

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveAttribute('aria-checked', 'false')
      expect(radio).not.toHaveClass('selected')
    })
    expect(getSummary(container)).toBeNull()
  })

  it('disables Continue when nothing is selected and enables it once a boarding point is chosen', () => {
    render(<BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />)

    const continueBtn = screen.getByRole('button', { name: 'Continue' })
    expect(continueBtn).toBeDisabled()

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(continueBtn).toBeEnabled()
  })

  it('reproduces the same selection and summary on re-render with the same bp URL (reload/share)', () => {
    window.history.replaceState(null, '', '/?bp=1')
    const { container, unmount } = render(
      <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />,
    )
    expect(getSummary(container)).toHaveTextContent('Shivajinagar')
    unmount()

    const { container: container2 } = render(
      <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={1} />,
    )
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(radios[0]).toHaveClass('selected')
    expect(getSummary(container2)).toHaveTextContent('Shivajinagar')
  })
})
