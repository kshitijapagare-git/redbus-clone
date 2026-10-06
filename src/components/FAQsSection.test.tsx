import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FAQsSection from './FAQsSection'
import { faqs } from '../data'

describe('FAQsSection', () => {
  it('renders the heading and all four category tabs, with General selected by default', () => {
    render(<FAQsSection />)

    expect(screen.getByRole('heading', { name: 'FAQs related to Bus Tickets Booking' })).toBeInTheDocument()

    const tablist = screen.getByRole('tablist', { name: 'FAQ categories' })
    expect(tablist).toBeInTheDocument()

    const generalTab = screen.getByRole('tab', { name: 'General' })
    const ticketTab = screen.getByRole('tab', { name: 'Ticket-related' })
    const paymentTab = screen.getByRole('tab', { name: 'Payment' })
    const cancellationTab = screen.getByRole('tab', { name: 'Cancellation & Refund' })

    expect(generalTab).toHaveAttribute('aria-selected', 'true')
    expect(ticketTab).toHaveAttribute('aria-selected', 'false')
    expect(paymentTab).toHaveAttribute('aria-selected', 'false')
    expect(cancellationTab).toHaveAttribute('aria-selected', 'false')

    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('shows questions for the active category and toggles an answer open/closed', () => {
    render(<FAQsSection />)

    const generalFaqs = faqs.filter((f) => f.category === 'General')
    const firstQuestion = screen.getByRole('button', { name: generalFaqs[0].question })

    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(generalFaqs[0].answer)).not.toBeInTheDocument()

    fireEvent.click(firstQuestion)
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(generalFaqs[0].answer)).toBeInTheDocument()

    fireEvent.click(firstQuestion)
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(generalFaqs[0].answer)).not.toBeInTheDocument()
  })

  it('closes any open answer when switching tabs', () => {
    render(<FAQsSection />)

    const generalFaqs = faqs.filter((f) => f.category === 'General')
    const firstQuestion = screen.getByRole('button', { name: generalFaqs[0].question })
    fireEvent.click(firstQuestion)
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('tab', { name: 'Payment' }))

    const paymentTab = screen.getByRole('tab', { name: 'Payment' })
    expect(paymentTab).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(screen.getByRole('tab', { name: 'General' }))
    const reopenedQuestion = screen.getByRole('button', { name: generalFaqs[0].question })
    expect(reopenedQuestion).toHaveAttribute('aria-expanded', 'false')
  })

  it('moves tab selection with ArrowRight/ArrowLeft, wrapping at the ends', () => {
    render(<FAQsSection />)

    const generalTab = screen.getByRole('tab', { name: 'General' })
    const ticketTab = screen.getByRole('tab', { name: 'Ticket-related' })
    const cancellationTab = screen.getByRole('tab', { name: 'Cancellation & Refund' })

    fireEvent.keyDown(generalTab, { key: 'ArrowRight' })
    expect(ticketTab).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(ticketTab, { key: 'ArrowLeft' })
    expect(generalTab).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(generalTab, { key: 'ArrowLeft' })
    expect(cancellationTab).toHaveAttribute('aria-selected', 'true')
  })

  it('renders each panel with role tabpanel and each tab with role tab', () => {
    render(<FAQsSection />)

    const panel = screen.getByRole('tabpanel')
    expect(panel).toBeInTheDocument()
    expect(within(panel).getAllByRole('button').length).toBeGreaterThan(0)
  })
})
