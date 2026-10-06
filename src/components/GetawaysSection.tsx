import { getaways } from '../data'

function GetawaysSection() {
  return (
    <section className="container section getaways-section">
      <div className="section-head">
        <h2>Introducing Getaways</h2>
      </div>
      <p className="getaways-subtitle">Hey, ready for a weekend getaway?</p>
      <p className="getaways-tagline">Handpicked destinations for you</p>
      <div className="getaways-grid">
        {getaways.map((getaway) => (
          <article className="getaway-card" key={getaway.name}>
            <div className="getaway-photo" role="img" aria-label={getaway.imageAlt} />
            <h3>{getaway.name}</h3>
          </article>
        ))}
      </div>
      <button type="button" className="getaways-explore-btn">
        Explore all
      </button>
    </section>
  )
}

export default GetawaysSection
