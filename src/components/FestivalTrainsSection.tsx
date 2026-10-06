import { useState } from 'react'
import { festivalMonths } from '../data'
import { TRAINS_PATH, navigateTo } from '../lib/route'

function FestivalTrainsSection() {
  const [selectedMonthId, setSelectedMonthId] = useState(festivalMonths[0]?.id ?? null)

  return (
    <section className="container section festival-trains-section">
      <div className="section-head">
        <h2>Book now to get confirmed ticket</h2>
      </div>
      <p className="festival-trains-offer">Get ₹60 off using code SUPERB60</p>
      <div className="festival-trains-months">
        {festivalMonths.map((month) => {
          const isActive = month.id === selectedMonthId
          return (
            <button
              key={month.id}
              type="button"
              className={`festival-month-card${isActive ? ' active' : ''}`}
              onClick={() => setSelectedMonthId(month.id)}
            >
              <strong>{month.monthLabel}</strong>
              <span>{month.festivalName}</span>
            </button>
          )
        })}
      </div>
      <p className="irctc-badge festival-trains-irctc">
        <span aria-hidden="true">✔</span> Authorised IRCTC partner
      </p>
      <button type="button" className="search-btn festival-trains-cta" onClick={() => navigateTo(TRAINS_PATH)}>
        Book trains now
      </button>
    </section>
  )
}

export default FestivalTrainsSection
