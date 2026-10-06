import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BusFilterPanel from './BusFilterPanel'
import type { BusSearchFilterState } from '../hooks/useBusSearchFilters'

function baseState(overrides: Partial<BusSearchFilterState> = {}): BusSearchFilterState {
  return {
    type: new Set(),
    time: null,
    fareMin: null,
    fareMax: null,
    women: false,
    sort: 'departure',
    ...overrides,
  }
}

describe('BusFilterPanel', () => {
  it('renders bus-type options as checkboxes with labels, and more than one can be checked', () => {
    const setType = vi.fn()
    render(
      <BusFilterPanel
        isMobile={false}
        state={baseState()}
        fareBounds={{ min: 400, max: 1200 }}
        setType={setType}
        setTime={vi.fn()}
        setFareRange={vi.fn()}
        setWomen={vi.fn()}
        setSort={vi.fn()}
        applyDraft={vi.fn()}
        resetDraft={vi.fn()}
        clearFilters={vi.fn()}
      />,
    )

    const ac = screen.getByLabelText('AC') as HTMLInputElement
    const seater = screen.getByLabelText('Seater') as HTMLInputElement
    expect(ac.type).toBe('checkbox')
    expect(seater.type).toBe('checkbox')

    fireEvent.click(ac)
    expect(setType).toHaveBeenCalledWith(new Set(['AC']))
  })

  it('renders departure-time options as a single radio group with labels', () => {
    const setTime = vi.fn()
    render(
      <BusFilterPanel
        isMobile={false}
        state={baseState()}
        fareBounds={{ min: 400, max: 1200 }}
        setType={vi.fn()}
        setTime={setTime}
        setFareRange={vi.fn()}
        setWomen={vi.fn()}
        setSort={vi.fn()}
        applyDraft={vi.fn()}
        resetDraft={vi.fn()}
        clearFilters={vi.fn()}
      />,
    )

    const beforeSix = screen.getByLabelText('Before 6 AM') as HTMLInputElement
    const afterSix = screen.getByLabelText('After 6 PM') as HTMLInputElement
    expect(beforeSix.type).toBe('radio')
    expect(afterSix.type).toBe('radio')
    expect(beforeSix.name).toBe(afterSix.name)

    fireEvent.click(afterSix)
    expect(setTime).toHaveBeenCalledWith('night')
  })

  it('renders Women friendly as a checkbox, checked when the state defaults it on', () => {
    render(
      <BusFilterPanel
        isMobile={false}
        state={baseState({ women: true })}
        fareBounds={{ min: 400, max: 1200 }}
        setType={vi.fn()}
        setTime={vi.fn()}
        setFareRange={vi.fn()}
        setWomen={vi.fn()}
        setSort={vi.fn()}
        applyDraft={vi.fn()}
        resetDraft={vi.fn()}
        clearFilters={vi.fn()}
      />,
    )

    const womenCheckbox = screen.getByLabelText('Women friendly') as HTMLInputElement
    expect(womenCheckbox.type).toBe('checkbox')
    expect(womenCheckbox.checked).toBe(true)
  })

  it('desktop mode: toggling a control calls the setter directly and renders no Apply button', () => {
    const setWomen = vi.fn()
    render(
      <BusFilterPanel
        isMobile={false}
        state={baseState()}
        fareBounds={{ min: 400, max: 1200 }}
        setType={vi.fn()}
        setTime={vi.fn()}
        setFareRange={vi.fn()}
        setWomen={setWomen}
        setSort={vi.fn()}
        applyDraft={vi.fn()}
        resetDraft={vi.fn()}
        clearFilters={vi.fn()}
      />,
    )

    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Women friendly'))
    expect(setWomen).toHaveBeenCalledWith(true)
  })

  it('mobile mode: renders a bottom sheet with a visible Apply button, and toggling a control does not call applyDraft', () => {
    const applyDraft = vi.fn()
    const setWomen = vi.fn()
    render(
      <BusFilterPanel
        isMobile={true}
        state={baseState()}
        fareBounds={{ min: 400, max: 1200 }}
        setType={vi.fn()}
        setTime={vi.fn()}
        setFareRange={vi.fn()}
        setWomen={setWomen}
        setSort={vi.fn()}
        applyDraft={applyDraft}
        resetDraft={vi.fn()}
        clearFilters={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
    const applyButton = screen.getByRole('button', { name: 'Apply' })
    expect(applyButton).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Women friendly'))
    expect(setWomen).toHaveBeenCalledWith(true)
    expect(applyDraft).not.toHaveBeenCalled()

    fireEvent.click(applyButton)
    expect(applyDraft).toHaveBeenCalledTimes(1)
  })

  it('clicking Clear filters calls clearFilters', () => {
    const clearFilters = vi.fn()
    render(
      <BusFilterPanel
        isMobile={false}
        state={baseState()}
        fareBounds={{ min: 400, max: 1200 }}
        setType={vi.fn()}
        setTime={vi.fn()}
        setFareRange={vi.fn()}
        setWomen={vi.fn()}
        setSort={vi.fn()}
        applyDraft={vi.fn()}
        resetDraft={vi.fn()}
        clearFilters={clearFilters}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(clearFilters).toHaveBeenCalledTimes(1)
  })
})
