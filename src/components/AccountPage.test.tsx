import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AccountPage, { accountOptionGroups } from './AccountPage'

describe('AccountPage', () => {
  it('renders the login prompt box', () => {
    render(<AccountPage />)
    expect(screen.getByRole('heading', { name: 'Log in to manage your bookings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('renders exactly three option groups in order with the expected labels', () => {
    expect(accountOptionGroups.map((g) => g.title)).toEqual(['My details', 'Payments', 'More'])

    expect(accountOptionGroups[0].options.map((o) => o.label)).toEqual(['Bookings', 'Personal information'])
    expect(accountOptionGroups[1].options.map((o) => o.label)).toEqual(['redBus Wallet', 'Redeem gift card'])
    expect(accountOptionGroups[2].options.map((o) => o.label)).toEqual([
      'Offers',
      'Know about redBus',
      'Help',
      'Cancel Ticket',
      'Reschedule ticket',
      'Search ticket',
      'Language',
      'Notifications',
      'Country',
      'Booking for women',
    ])

    const language = accountOptionGroups[2].options.find((o) => o.label === 'Language')
    expect(language?.subtitle).toBe('English')
    const country = accountOptionGroups[2].options.find((o) => o.label === 'Country')
    expect(country?.subtitle).toBe('India')
  })

  it('renders every option as a <button>, never an <a>', () => {
    render(<AccountPage />)
    accountOptionGroups.forEach((group) => {
      group.options.forEach((option) => {
        const button = screen.getByRole('button', { name: new RegExp(option.label) })
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  it('selects Bookings by default', () => {
    render(<AccountPage />)
    const bookingsButton = screen.getByRole('button', { name: 'Bookings' })
    expect(bookingsButton).toHaveAttribute('aria-current', 'true')
    expect(bookingsButton.className).toContain('selected')

    const personalInfoButton = screen.getByRole('button', { name: 'Personal information' })
    expect(personalInfoButton).not.toHaveAttribute('aria-current')
    expect(personalInfoButton.className).not.toContain('selected')
  })

  it('moves the selection and aria-current when a different option is clicked', () => {
    render(<AccountPage />)

    const bookingsButton = screen.getByRole('button', { name: 'Bookings' })
    const walletButton = screen.getByRole('button', { name: 'redBus Wallet' })

    fireEvent.click(walletButton)

    expect(walletButton).toHaveAttribute('aria-current', 'true')
    expect(walletButton.className).toContain('selected')
    expect(bookingsButton).not.toHaveAttribute('aria-current')
    expect(bookingsButton.className).not.toContain('selected')
  })

  it('renders the right panel empty state', () => {
    render(<AccountPage />)
    expect(screen.getByRole('heading', { name: 'My bookings' })).toBeInTheDocument()
    expect(screen.getByText('Login to manage your trips')).toBeInTheDocument()
    expect(screen.getByText('Track, modify or cancel with ease')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })
})
