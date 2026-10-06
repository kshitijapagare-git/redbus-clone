import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { OFFERS_PATH, navigateTo } from '../lib/route'

export type OfferCategory = 'bus' | 'train'

export interface Offer {
  title: string
  valid: string
  code: string
  tone: string
  category: OfferCategory
}

export const defaultOffers: Offer[] = [
  { title: 'Save up to Rs 300 on bus tickets', valid: '05 Oct', code: 'FESTIVE300', tone: 'peach', category: 'bus' },
  { title: 'Save up to Rs 250 on bus tickets', valid: '31 Oct', code: 'FIRST', tone: 'pink', category: 'bus' },
  { title: 'Flat Rs 300 off on bus tickets', valid: '31 Oct', code: 'BUS300', tone: 'pink', category: 'bus' },
  { title: 'Save up to Rs 200 on Primo operators.', valid: '31 Oct', code: 'PRIMODAY', tone: 'yellow', category: 'bus' },
  { title: 'Save up to Rs 150 on train tickets', valid: '31 Oct', code: 'TRAIN150', tone: 'peach', category: 'train' },
]

type TabCategory = 'all' | OfferCategory

const tabs: { key: TabCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'bus', label: 'Bus' },
  { key: 'train', label: 'Train' },
]

const categoryLabel = (category: OfferCategory) => category.charAt(0).toUpperCase() + category.slice(1)

export interface OffersProps {
  offers?: Offer[]
}

function Offers({ offers = defaultOffers }: OffersProps) {
  const [activeCategory, setActiveCategory] = useState<TabCategory>('all')
  const [copyStatus, setCopyStatus] = useState<Record<string, 'copied' | 'failed' | undefined>>({})
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      Object.values(timeouts).forEach((t) => clearTimeout(t))
    }
  }, [])

  const filteredOffers = useMemo(
    () => (activeCategory === 'all' ? offers : offers.filter((o) => o.category === activeCategory)),
    [offers, activeCategory],
  )

  const handleCopy = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        flushSync(() => {
          setCopyStatus((prev) => ({ ...prev, [code]: 'copied' }))
        })
        const existing = timeoutsRef.current[code]
        if (existing) clearTimeout(existing)
        timeoutsRef.current[code] = setTimeout(() => {
          flushSync(() => {
            setCopyStatus((prev) => ({ ...prev, [code]: undefined }))
          })
          delete timeoutsRef.current[code]
        }, 2000)
      })
      .catch(() => {
        flushSync(() => {
          setCopyStatus((prev) => ({ ...prev, [code]: 'failed' }))
        })
      })
  }

  return (
    <section className="container section">
      <div className="section-head">
        <h2>Offers for you</h2>
        <a
          href={OFFERS_PATH}
          onClick={(e) => {
            e.preventDefault()
            navigateTo(OFFERS_PATH)
          }}
        >
          View more
        </a>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeCategory === tab.key}
            className={`tab${activeCategory === tab.key ? ' active' : ''}`}
            onClick={() => setActiveCategory(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="offer-grid">
        {filteredOffers.length === 0 ? (
          <p className="offer-empty">No offers right now</p>
        ) : (
          filteredOffers.map((o) => (
            <article key={o.code} className={`offer offer-${o.tone}`}>
              <span className="badge">{categoryLabel(o.category)}</span>
              <h3>{o.title}</h3>
              <p>Valid till {o.valid}</p>
              <button type="button" className="code" onClick={() => handleCopy(o.code)}>
                <span aria-hidden="true">🏷</span> {copyStatus[o.code] === 'copied' ? 'Copied!' : o.code}
              </button>
              {copyStatus[o.code] === 'failed' && (
                <span className="code-error">Copy failed. Please copy the code manually.</span>
              )}
              <span className="offer-art">🚌</span>
            </article>
          ))
        )}
      </div>
    </section>
  )
}


export default Offers
