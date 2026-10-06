import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { faqs } from '../data'
import type { FAQCategory, FAQItem } from '../data'

const CATEGORIES: FAQCategory[] = ['General', 'Ticket-related', 'Payment', 'Cancellation & Refund']

function categoryTabId(category: FAQCategory) {
  return `faq-tab-${category.replace(/[^a-zA-Z]+/g, '-').toLowerCase()}`
}

function categoryPanelId(category: FAQCategory) {
  return `faq-panel-${category.replace(/[^a-zA-Z]+/g, '-').toLowerCase()}`
}

function questionButtonId(category: FAQCategory, index: number) {
  return `faq-question-${category.replace(/[^a-zA-Z]+/g, '-').toLowerCase()}-${index}`
}

function FAQsSection() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('General')
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const faqsByCategory = (category: FAQCategory): FAQItem[] => faqs.filter((f) => f.category === category)

  const handleSelectCategory = (category: FAQCategory) => {
    setActiveCategory(category)
    setOpenQuestionId(null)
  }

  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = (index + 1) % CATEGORIES.length
      handleSelectCategory(CATEGORIES[nextIndex])
      tabRefs.current[nextIndex]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = (index - 1 + CATEGORIES.length) % CATEGORIES.length
      handleSelectCategory(CATEGORIES[prevIndex])
      tabRefs.current[prevIndex]?.focus()
    }
  }

  const toggleQuestion = (id: string) => {
    setOpenQuestionId((current) => (current === id ? null : id))
  }

  return (
    <section className="container section faqs-section">
      <div className="section-head">
        <h2>FAQs related to Bus Tickets Booking</h2>
      </div>
      <div className="tabs faqs-tabs" role="tablist" aria-label="FAQ categories">
        {CATEGORIES.map((category, index) => {
          const isActive = category === activeCategory
          return (
            <button
              key={category}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              type="button"
              role="tab"
              id={categoryTabId(category)}
              aria-selected={isActive}
              aria-controls={categoryPanelId(category)}
              tabIndex={isActive ? 0 : -1}
              className={`tab${isActive ? ' active' : ''}`}
              onClick={() => handleSelectCategory(category)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
            >
              {category}
            </button>
          )
        })}
      </div>
      {CATEGORIES.map((category) => {
        if (category !== activeCategory) return null
        return (
          <div
            key={category}
            role="tabpanel"
            id={categoryPanelId(category)}
            aria-labelledby={categoryTabId(category)}
            className="faqs-panel"
          >
            <ul className="faqs-list">
              {faqsByCategory(category).map((faq, index) => {
                const id = questionButtonId(category, index)
                const isOpen = openQuestionId === id
                const answerId = `${id}-answer`
                return (
                  <li key={id} className="faqs-item">
                    <button
                      type="button"
                      className="faqs-question"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => toggleQuestion(id)}
                    >
                      {faq.question}
                    </button>
                    {isOpen && (
                      <p id={answerId} className="faqs-answer">
                        {faq.answer}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

export default FAQsSection
