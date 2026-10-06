import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TestimonialsSection from './TestimonialsSection'
import { testimonials } from '../data'

describe('TestimonialsSection', () => {
  it('renders the heading and subtitle', () => {
    render(<TestimonialsSection />)

    expect(screen.getByRole('heading', { name: 'Testimonials' })).toBeInTheDocument()
    expect(screen.getByText('Hear from our satisfied customers in their own words')).toBeInTheDocument()
  })

  it('renders a figure+blockquote card for each testimonial from data', () => {
    const { container } = render(<TestimonialsSection />)

    testimonials.forEach((testimonial) => {
      expect(screen.getByText(testimonial.name)).toBeInTheDocument()
      expect(screen.getByText(`Customer since ${testimonial.sinceYear}`)).toBeInTheDocument()
    })

    const figures = container.querySelectorAll('figure')
    expect(figures.length).toBe(testimonials.length)
    figures.forEach((figure) => {
      expect(figure.querySelector('blockquote')).not.toBeNull()
    })
  })
})
