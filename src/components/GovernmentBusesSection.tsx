import Carousel from './Carousel'
import { governmentBusOperators } from '../data'
import type { GovernmentBusOperator } from '../data'

function GovernmentBusesSection() {
  return (
    <section className="container section government-buses-section">
      <div className="section-head">
        <h2>Government Buses</h2>
      </div>
      <Carousel
        items={governmentBusOperators}
        getKey={(operator: GovernmentBusOperator) => operator.id}
        prevLabel="Previous"
        nextLabel="Next"
        renderItem={(operator: GovernmentBusOperator) => (
          <article className="government-bus-card">
            <div className="government-bus-card-head">
              <div className="government-bus-logo" role="img" aria-label={operator.logoAlt} />
              <div>
                <h3>{operator.name}</h3>
                <div className="government-bus-local-name">{operator.localName}</div>
              </div>
            </div>
            <div className="government-bus-rating">★ {operator.rating}</div>
            <p className="government-bus-services">{operator.serviceCount}+ services</p>
            <p className="government-bus-partner-text">{operator.partnerText}</p>
            <p className="government-bus-support-text">24*7 customer service (Call or chat)</p>
          </article>
        )}
      />
    </section>
  )
}

export default GovernmentBusesSection
