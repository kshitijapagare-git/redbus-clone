import { useState } from 'react'
import { popularBusOperators, popularBusRoutes, popularCities } from '../data'

interface PopularListConfig {
  id: string
  title: string
  items: string[]
}

function PopularListsSection() {
  const lists: PopularListConfig[] = [
    { id: 'popular-bus-routes', title: 'Popular Bus Routes', items: popularBusRoutes },
    { id: 'popular-cities', title: 'Popular Cities', items: popularCities },
    { id: 'popular-bus-operators', title: 'Popular Bus Operators', items: popularBusOperators },
  ]

  const [openListIds, setOpenListIds] = useState<Record<string, boolean>>({})

  const toggleList = (id: string) => {
    setOpenListIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section className="container section popular-lists-section">
      <div className="section-head">
        <h2>Popular Searches</h2>
      </div>
      <div className="popular-lists">
        {lists.map((list) => {
          const isOpen = !!openListIds[list.id]
          const panelId = `${list.id}-panel`
          return (
            <div className="popular-list" key={list.id}>
              <button
                type="button"
                className="popular-list-toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleList(list.id)}
              >
                <h3>{list.title}</h3>
                <span className="popular-list-arrow" aria-hidden="true">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
              {isOpen && (
                <ul id={panelId} className="popular-list-items">
                  {list.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PopularListsSection
