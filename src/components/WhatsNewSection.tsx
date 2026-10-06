import Carousel from './Carousel'
import { whatsNewItems } from '../data'
import type { WhatsNewItem } from '../data'

function WhatsNewSection() {
  return (
    <section className="container section whats-new-section">
      <div className="section-head">
        <h2>What's new</h2>
      </div>
      <Carousel
        items={whatsNewItems}
        getKey={(item: WhatsNewItem) => item.id}
        prevLabel="Previous"
        nextLabel="Next"
        renderItem={(item: WhatsNewItem) => (
          <article className="whats-new-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        )}
      />
    </section>
  )
}

export default WhatsNewSection
