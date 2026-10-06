import { redDealsStats } from '../data'

export interface RedDealsSectionProps {
  scrollTargetId?: string
}

const DEFAULT_SCROLL_TARGET_ID = 'search-card'

function RedDealsSection({ scrollTargetId = DEFAULT_SCROLL_TARGET_ID }: RedDealsSectionProps) {
  const handleBookNow = () => {
    document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="container section red-deals-section">
      <div className="red-deals-card">
        <h2>Unlock Unbeatable Exclusive redDeals! 20% OFF</h2>
        <p>
          {redDealsStats.deals} Deals . {redDealsStats.operators} Bus Operators . {redDealsStats.routes} Routes
        </p>
        <button type="button" className="search-btn red-deals-cta" onClick={handleBookNow}>
          Book now
        </button>
      </div>
    </section>
  )
}

export default RedDealsSection
