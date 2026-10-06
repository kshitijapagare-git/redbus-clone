import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import AppPromoStrip from './AppPromoStrip'
import { APP_PROMO_DISMISSED_STORAGE_KEY } from '../lib/appPromo'

describe('AppPromoStrip', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows the promo text and install button when not dismissed', () => {
    render(<AppPromoStrip />)

    expect(screen.getByText('Get 10% Discount')).toBeInTheDocument()
    expect(screen.getByText(/Use code APP10 on app/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Install redBus App' })).toBeInTheDocument()
  })

  it('hides the strip after the close button is clicked', () => {
    render(<AppPromoStrip />)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByText('Get 10% Discount')).not.toBeInTheDocument()
  })

  it('persists the dismissal so a re-render stays closed', () => {
    const { unmount } = render(<AppPromoStrip />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    unmount()

    expect(localStorage.getItem(APP_PROMO_DISMISSED_STORAGE_KEY)).toBe('1')

    render(<AppPromoStrip />)
    expect(screen.queryByText('Get 10% Discount')).not.toBeInTheDocument()
  })

  it('does not render when localStorage already has the dismissed flag set', () => {
    localStorage.setItem(APP_PROMO_DISMISSED_STORAGE_KEY, '1')
    render(<AppPromoStrip />)

    expect(screen.queryByText('Get 10% Discount')).not.toBeInTheDocument()
  })
})
