import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Offers, { defaultOffers } from './Offers'
import type { Offer } from './Offers'
import { OFFERS_PATH } from '../lib/route'

describe('Offers', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('has a "View more" link pointing at OFFERS_PATH that navigates there on click', () => {
    render(<Offers />)
    const link = screen.getByRole('link', { name: 'View more' })
    expect(link).toHaveAttribute('href', OFFERS_PATH)

    fireEvent.click(link)

    expect(window.location.pathname).toBe(OFFERS_PATH)
  })

  it('shows every offer on the All tab', () => {
    render(<Offers />)
    const tab = screen.getByRole('tab', { name: 'All' })
    fireEvent.click(tab)

    defaultOffers.forEach((offer) => {
      expect(screen.getByText(offer.title)).toBeInTheDocument()
    })
  })

  it('filters to only bus offers on the Bus tab', () => {
    render(<Offers />)
    fireEvent.click(screen.getByRole('tab', { name: 'Bus' }))

    const busTab = screen.getByRole('tab', { name: 'Bus' })
    expect(busTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false')

    const busOffers = defaultOffers.filter((o) => o.category === 'bus')
    const trainOffers = defaultOffers.filter((o) => o.category === 'train')

    busOffers.forEach((offer) => {
      expect(screen.getByText(offer.title)).toBeInTheDocument()
    })
    trainOffers.forEach((offer) => {
      expect(screen.queryByText(offer.title)).not.toBeInTheDocument()
    })
  })

  it('filters to only train offers on the Train tab', () => {
    render(<Offers />)
    fireEvent.click(screen.getByRole('tab', { name: 'Train' }))

    const trainTab = screen.getByRole('tab', { name: 'Train' })
    expect(trainTab).toHaveAttribute('aria-selected', 'true')

    const busOffers = defaultOffers.filter((o) => o.category === 'bus')
    const trainOffers = defaultOffers.filter((o) => o.category === 'train')

    trainOffers.forEach((offer) => {
      expect(screen.getByText(offer.title)).toBeInTheDocument()
    })
    busOffers.forEach((offer) => {
      expect(screen.queryByText(offer.title)).not.toBeInTheDocument()
    })
  })

  it('shows the empty state and no cards when a tab has no matching offers', () => {
    const busOnly: Offer[] = [
      { title: 'Bus only offer', valid: '31 Oct', code: 'BUSONLY', tone: 'pink', category: 'bus' },
    ]
    render(<Offers offers={busOnly} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Train' }))

    expect(screen.getByText('No offers right now')).toBeInTheDocument()
    expect(screen.queryByText('Bus only offer')).not.toBeInTheDocument()
  })

  describe('copying a coupon code', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    })

    it('shows "Copied!" after a successful copy and reverts after ~2 seconds', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

      const offers: Offer[] = [
        { title: 'Single offer', valid: '31 Oct', code: 'SINGLE10', tone: 'pink', category: 'bus' },
      ]
      render(<Offers offers={offers} />)

      const button = screen.getByRole('button', { name: /SINGLE10/ })
      fireEvent.click(button)

      expect(writeText).toHaveBeenCalledWith('SINGLE10')

      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()
      })

      await vi.advanceTimersByTimeAsync(2000)

      expect(screen.getByRole('button', { name: /SINGLE10/ })).toBeInTheDocument()
    })

    it('shows a failure message when copying fails, without throwing', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('denied'))
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

      const offers: Offer[] = [
        { title: 'Single offer', valid: '31 Oct', code: 'FAILCODE', tone: 'pink', category: 'bus' },
      ]
      render(<Offers offers={offers} />)

      const button = screen.getByRole('button', { name: /FAILCODE/ })
      fireEvent.click(button)

      await vi.waitFor(() => {
        expect(screen.getByText('Copy failed. Please copy the code manually.')).toBeInTheDocument()
      })
    })
  })
})
