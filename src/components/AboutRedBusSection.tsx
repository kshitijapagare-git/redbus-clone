import { aboutRedBusIntro, aboutRedBusLinks, aboutRedBusSteps } from '../data'

function AboutRedBusSection() {
  const linkByLabel = (label: string) => aboutRedBusLinks.find((l) => l.label === label)

  return (
    <section className="container section about-redbus-section">
      <div className="section-head">
        <h2>redBus: India's Leading Online Bus Booking and Train Ticket Booking Platform</h2>
      </div>
      {aboutRedBusIntro.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>
          {paragraph.segments.map((segment, segmentIndex) => {
            if (segment.linkLabel) {
              const link = linkByLabel(segment.linkLabel)
              return link ? (
                <a key={segmentIndex} href={link.href}>
                  {link.label}
                </a>
              ) : null
            }
            return <span key={segmentIndex}>{segment.text}</span>
          })}
        </p>
      ))}

      <h3>Why Choose redBus for Bus Booking?</h3>
      <p>
        With thousands of trusted operators, live seat selection and 24x7 customer support, redBus makes
        bus ticket booking fast, transparent and reliable.
      </p>

      <h3>Why Choose redRail for Train Ticket Booking?</h3>
      <p>
        redRail brings the same ease of booking to train travel, with real-time availability, PNR status
        checks and running status updates in one place.
      </p>

      <h3>How to Book Bus Tickets and Train Tickets Online on redBus?</h3>
      <ol className="about-redbus-steps">
        {aboutRedBusSteps.map((step) => (
          <li key={step.step}>{step.text}</li>
        ))}
      </ol>

      <h3>Exclusive Offers on redBus</h3>
      <p>
        Unlock exclusive discounts and cashback offers on every booking with redBus coupon codes, applied
        automatically at checkout when eligible.
      </p>
    </section>
  )
}

export default AboutRedBusSection
