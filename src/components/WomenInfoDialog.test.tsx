import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import WomenInfoDialog from './WomenInfoDialog'

describe('WomenInfoDialog', () => {
  it('renders nothing when isOpen is false', () => {
    render(<WomenInfoDialog isOpen={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog explaining the feature when isOpen is true', () => {
    render(<WomenInfoDialog isOpen onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Booking for women' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveTextContent(/women/i)
  })

  it('calls onClose when the × button is clicked', () => {
    const onClose = vi.fn()
    render(<WomenInfoDialog isOpen onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<WomenInfoDialog isOpen onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<WomenInfoDialog isOpen onClose={onClose} />)
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking inside the panel', () => {
    const onClose = vi.fn()
    render(<WomenInfoDialog isOpen onClose={onClose} />)
    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
