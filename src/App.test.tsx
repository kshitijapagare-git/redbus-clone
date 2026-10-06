import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { FOOTER_TEXT } from './components/Footer'

describe('App footer', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('renders the footer with the exact text on the Home route', () => {
    window.history.replaceState(null, '', '/')
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent(FOOTER_TEXT)
  })

  it('renders the footer with the exact text on the Trains route', () => {
    window.history.replaceState(null, '', '/trains')
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent(FOOTER_TEXT)
  })

  it('renders the footer with the exact text on the Hotels route', () => {
    window.history.replaceState(null, '', '/hotels')
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent(FOOTER_TEXT)
  })

  it('renders the header and footer with the exact text on the Account route', () => {
    window.history.replaceState(null, '', '/account')
    render(<App />)
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent(FOOTER_TEXT)
  })
})
