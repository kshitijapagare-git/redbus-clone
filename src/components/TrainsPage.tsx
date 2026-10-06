import Offers from './Offers'
import TrainsSearchCard from './TrainsSearchCard'

function TrainsPage() {
  return (
    <main className="trains-page">
      <section className="hero train-hero">
        <div className="hero-scene" aria-hidden="true">
          <div className="train-illustration" aria-hidden="true">🚆</div>
        </div>
        <div className="container">
          <h1>Train Ticket Booking</h1>
          <p className="irctc-badge">
            <span aria-hidden="true">✔</span> IRCTC Authorised Partner
          </p>
        </div>
      </section>
      <div className="container search-wrap">
        <div className="quiz-tab-banner">Book Ticket, Play Quiz &amp; Win Real Gold!</div>
        <TrainsSearchCard />
      </div>
      <Offers title="Exciting offers and discounts" />
    </main>
  )
}

export default TrainsPage
