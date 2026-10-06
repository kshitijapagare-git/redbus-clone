import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer, { FOOTER_TEXT } from './Footer'
import { footerColumns } from '../data'

describe('Footer', () => {
  it('renders the existing FOOTER_TEXT paragraph unchanged', () => {
    render(<Footer />)

    expect(screen.getByText(FOOTER_TEXT)).toBeInTheDocument()
  })

  it('renders a nav labelled Footer containing all seven column headings and their links', () => {
    render(<Footer />)

    const nav = screen.getByRole('navigation', { name: 'Footer' })
    expect(nav).toBeInTheDocument()

    footerColumns.forEach((column) => {
      expect(within(nav).getByRole('heading', { level: 3, name: column.title })).toBeInTheDocument()
      column.links.forEach((link) => {
        expect(within(nav).getByRole('link', { name: link.label })).toHaveAttribute('href', link.href)
      })
    })
  })
})
