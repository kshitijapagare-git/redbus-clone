import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AppDownloadBanner from './AppDownloadBanner'
import { appDownloadInfo } from '../data'

describe('AppDownloadBanner', () => {
  it('renders the headline copy', () => {
    render(<AppDownloadBanner />)

    expect(screen.getByText('Grab 10% off now')).toBeInTheDocument()
    expect(screen.getByText('Download App to unlock offer!')).toBeInTheDocument()
  })

  it('renders a Google Play badge link with rating and downloads in its accessible name', () => {
    render(<AppDownloadBanner />)

    const link = screen.getByRole('link', { name: /Google Play/ })
    expect(link).toHaveAccessibleName(expect.stringContaining('4.6'))
    expect(link).toHaveAccessibleName(expect.stringContaining('10 crore+ Downloads'))
    expect(link).toHaveAttribute('href', appDownloadInfo.googlePlay.href)
  })

  it('renders an App Store badge link with rating and downloads in its accessible name', () => {
    render(<AppDownloadBanner />)

    const link = screen.getByRole('link', { name: /App Store/ })
    expect(link).toHaveAccessibleName(expect.stringContaining('4.7'))
    expect(link).toHaveAccessibleName(expect.stringContaining('1.5 crore+ Downloads'))
    expect(link).toHaveAttribute('href', appDownloadInfo.appStore.href)
  })

  it('renders a QR code image with non-empty alt text', () => {
    render(<AppDownloadBanner />)

    const img = screen.getByRole('img', { name: /QR code/i })
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('alt')).not.toBe('')
  })
})
