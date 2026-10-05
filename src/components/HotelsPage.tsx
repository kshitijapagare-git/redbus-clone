import HotelsSearchCard from './HotelsSearchCard'

function HotelsPage() {
  return (
    <main className="hotels-page">
      <section className="hero hotels-hero">
        <div className="container">
          <h1>Pocket friendly, Verified stays</h1>
          <p className="hotels-hero-sub">
            <span aria-hidden="true">🏢</span> 30000+ affordable stays
          </p>
        </div>
      </section>
      <div className="container search-wrap">
        <HotelsSearchCard />
      </div>
    </main>
  )
}


export default HotelsPage
