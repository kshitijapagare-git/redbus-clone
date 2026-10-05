import { useRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RoomsGuestsPanel from './RoomsGuestsPanel'
import type { RoomsGuestsPanelProps } from './RoomsGuestsPanel'

function Harness(props: Partial<RoomsGuestsPanelProps> & { onClose?: () => void }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const {
    rooms = 1,
    adultsPerRoom = 2,
    onRoomsChange = () => {},
    onAdultsChange = () => {},
    onClose = () => {},
  } = props

  return (
    <>
      <button type="button" ref={triggerRef}>
        Trigger
      </button>
      <RoomsGuestsPanel
        rooms={rooms}
        adultsPerRoom={adultsPerRoom}
        onRoomsChange={onRoomsChange}
        onAdultsChange={onAdultsChange}
        onClose={onClose}
        triggerRef={triggerRef}
      />
    </>
  )
}

describe('RoomsGuestsPanel', () => {
  it('renders the panel as a dialog', () => {
    render(<Harness />)
    expect(screen.getByRole('dialog', { name: 'Rooms and guests' })).toBeInTheDocument()
  })

  it('disables the rooms decrement button at the minimum', () => {
    render(<Harness rooms={1} />)
    expect(screen.getByRole('button', { name: 'Decrease rooms' })).toBeDisabled()
  })

  it('disables the rooms increment button at the maximum', () => {
    render(<Harness rooms={5} />)
    expect(screen.getByRole('button', { name: 'Increase rooms' })).toBeDisabled()
  })

  it('disables the adults decrement button at the minimum', () => {
    render(<Harness adultsPerRoom={1} />)
    expect(screen.getByRole('button', { name: 'Decrease adults' })).toBeDisabled()
  })

  it('disables the adults increment button at the maximum', () => {
    render(<Harness adultsPerRoom={4} />)
    expect(screen.getByRole('button', { name: 'Increase adults' })).toBeDisabled()
  })

  it('calls onRoomsChange with a clamped value when incrementing', () => {
    const onRoomsChange = vi.fn()
    render(<Harness rooms={2} onRoomsChange={onRoomsChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase rooms' }))
    expect(onRoomsChange).toHaveBeenCalledWith(3)
  })

  it('calls onRoomsChange with a clamped value when decrementing', () => {
    const onRoomsChange = vi.fn()
    render(<Harness rooms={2} onRoomsChange={onRoomsChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease rooms' }))
    expect(onRoomsChange).toHaveBeenCalledWith(1)
  })

  it('calls onAdultsChange with a clamped value when incrementing', () => {
    const onAdultsChange = vi.fn()
    render(<Harness adultsPerRoom={2} onAdultsChange={onAdultsChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase adults' }))
    expect(onAdultsChange).toHaveBeenCalledWith(3)
  })

  it('calls onAdultsChange with a clamped value when decrementing', () => {
    const onAdultsChange = vi.fn()
    render(<Harness adultsPerRoom={2} onAdultsChange={onAdultsChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease adults' }))
    expect(onAdultsChange).toHaveBeenCalledWith(1)
  })

  it('does not call onRoomsChange beyond the maximum', () => {
    const onRoomsChange = vi.fn()
    render(<Harness rooms={5} onRoomsChange={onRoomsChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase rooms' }))
    expect(onRoomsChange).not.toHaveBeenCalled()
  })

  it('does not call onRoomsChange below the minimum', () => {
    const onRoomsChange = vi.fn()
    render(<Harness rooms={1} onRoomsChange={onRoomsChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease rooms' }))
    expect(onRoomsChange).not.toHaveBeenCalled()
  })

  it('calls onClose and restores focus to the trigger when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus()
  })

  it('calls onClose and restores focus to the trigger when clicking outside', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus()
  })

  it('does not call onClose when clicking inside the panel', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when clicking the trigger itself', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Trigger' }))
    expect(onClose).not.toHaveBeenCalled()
  })
})
