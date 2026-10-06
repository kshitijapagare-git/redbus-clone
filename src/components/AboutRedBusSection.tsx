import { Fragment } from 'react'
import { aboutRedBusIntro, aboutRedBusLinks, aboutRedBusSteps, aboutRedBusSubsections } from '../data'

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

      {aboutRedBusSubsections.map((subsection) => (
        <Fragment key={subsection.heading}>
          <h3>{subsection.heading}</h3>
          {subsection.body && <p>{subsection.body}</p>}
          {subsection.showsSteps && (
            <ol className="about-redbus-steps">
              {aboutRedBusSteps.map((step) => (
                <li key={step.step}>{step.text}</li>
              ))}
            </ol>
          )}
        </Fragment>
      ))}
    </section>
  )
}

export default AboutRedBusSection
