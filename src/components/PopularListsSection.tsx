import { useState } from 'react'
import { popularLists as lists } from '../data'

function PopularListsSection() {
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
