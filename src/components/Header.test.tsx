import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Header from './Header'

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  fireEvent(window, new Event('resize'))
}

describe('Header', () => {
  beforeEach(() => {
    setViewportWidth(1200)
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    document.body.style.overflow = ''
    setViewportWidth(1200)
    window.history.replaceState(null, '', '/')
  })

  it('does not render the menu button at widths >= 900px, and leaves nav-side unchanged', () => {
    setViewportWidth(900)
    render(<Header />)

    expect(screen.queryByRole('button', { name: 'Menu' })).not.toBeInTheDocument()
    expect(screen.getByText('☰ Bookings')).toBeInTheDocument()
    expect(screen.getByText('ⓘ Help')).toBeInTheDocument()
    expect(screen.getByText('◉ Account')).toBeInTheDocument()
  })

  it('renders an enabled menu button below 900px', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toBeEnabled()
  })

  it('opens a dialog panel with Bookings/Help/Account links, wires aria-expanded/aria-controls, and focuses the Bookings link', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    expect(dialog).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-controls', dialog.id)

    const bookingsLink = screen.getByRole('link', { name: '☰ Bookings' })
    const helpLink = screen.getByRole('link', { name: 'ⓘ Help' })
    const accountLink = screen.getByRole('link', { name: '◉ Account' })
    expect(bookingsLink).toBeInTheDocument()
    expect(helpLink).toBeInTheDocument()
    expect(accountLink).toBeInTheDocument()

    expect(bookingsLink).toHaveFocus()
  })

  it('locks body scroll while open and restores it on close', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(document.body.style.overflow).toBe('')
  })

  it('closes via the × button and returns focus to the menu button', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveFocus()
  })

  it('closes on an outside tap and returns focus to the menu button', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('closes on Escape and returns focus to the menu button', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('closes when a link is clicked and returns focus to the menu button', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)

    fireEvent.click(screen.getByRole('link', { name: 'ⓘ Help' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('closes when a link is activated with Space and returns focus to the menu button', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)

    const accountLink = screen.getByRole('link', { name: '◉ Account' })
    fireEvent.keyDown(accountLink, { key: ' ' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('traps Tab/Shift+Tab focus within the panel while open', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    const focusable = dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    expect(first).toHaveFocus()

    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()

    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })

  it('navigates to /account when the desktop Account link is clicked', () => {
    setViewportWidth(1200)
    render(<Header />)

    const accountLink = screen.getByRole('link', { name: '◉ Account' })
    fireEvent.click(accountLink)

    expect(window.location.pathname).toBe('/account')
  })

  it('navigates to /account when the desktop Bookings link is clicked', () => {
    setViewportWidth(1200)
    render(<Header />)

    const bookingsLink = screen.getByRole('link', { name: '☰ Bookings' })
    fireEvent.click(bookingsLink)

    expect(window.location.pathname).toBe('/account')
  })

  it('navigates to /account and closes the menu when the mobile Account link is clicked', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)

    const accountLink = screen.getByRole('link', { name: '◉ Account' })
    fireEvent.click(accountLink)

    expect(window.location.pathname).toBe('/account')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates to /account and closes the menu when the mobile Bookings link is clicked', () => {
    setViewportWidth(899)
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)

    const bookingsLink = screen.getByRole('link', { name: '☰ Bookings' })
    fireEvent.click(bookingsLink)

    expect(window.location.pathname).toBe('/account')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not mark any nav-main item as active while on /account', () => {
    window.history.replaceState(null, '', '/account')
    setViewportWidth(1200)
    render(<Header />)

    const busLink = screen.getByText('Bus tickets').closest('a')
    const trainLink = screen.getByText('Train tickets').closest('a')
    const hotelsLink = screen.getByText('Hotels').closest('a')

    expect(busLink?.className).not.toContain('active')
    expect(trainLink?.className).not.toContain('active')
    expect(hotelsLink?.className).not.toContain('active')
  })
})
