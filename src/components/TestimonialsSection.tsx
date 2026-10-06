import { testimonials } from '../data'

function TestimonialsSection() {
  return (
    <section className="container section testimonials-section">
      <div className="section-head">
        <h2>Testimonials</h2>
      </div>
      <p className="testimonials-subtitle">Hear from our satisfied customers in their own words</p>
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <figure className="testimonial-card" key={testimonial.name}>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>
              <strong>{testimonial.name}</strong>
              <span>Customer since {testimonial.sinceYear}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
