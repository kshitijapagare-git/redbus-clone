import { useState } from 'react'
import BoardingPointList from './components/BoardingPointList'
import Header from './components/Header'
import HotelsPage from './components/HotelsPage'
import Offers from './components/Offers'
import SearchCard from './components/SearchCard'
import TrainsPage from './components/TrainsPage'
import TrainsSearchPage from './components/TrainsSearchPage'
import { boardingPoints, cities } from './data'
import { HOTELS_PATH, TRAINS_PATH, TRAINS_SEARCH_PATH, useCurrentPath } from './lib/route'
import type { City } from './types'
import './App.css'

function App() {
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)
  const currentPath = useCurrentPath()

  if (currentPath === HOTELS_PATH) {
    return (
      <>
        <Header />
        <HotelsPage />
      </>
    )
  }

  if (currentPath === TRAINS_SEARCH_PATH) {
    return (
      <>
        <Header />
        <TrainsSearchPage />
      </>
    )
  }

  if (currentPath === TRAINS_PATH) {
    return (
      <>
        <Header />
        <TrainsPage />
      </>
    )
  }

  return (
    <>
      <Header />
      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="road" />
          <div className="hero-bus">🚌</div>
        </div>
        <div className="container">
          <h1>
            India's No. 1 online
            <br />
            bus ticket booking site
          </h1>
        </div>
      </section>
      <div className="container search-wrap">
        <SearchCard fromCityId={fromCityId} onFromCityIdChange={setFromCityId} />
      </div>
      <main>
        <Offers />
        <section className="container section">
          <div className="section-head">
            <h2>Boarding Points</h2>
          </div>
          <BoardingPointList cities={cities} boardingPoints={boardingPoints} fromCityId={fromCityId} />
        </section>
      </main>
    </>
  )
}

export default App
