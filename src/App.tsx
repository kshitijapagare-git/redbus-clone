import { useState } from 'react'
import BoardingPointList from './components/BoardingPointList'
import Header from './components/Header'
import Offers from './components/Offers'
import SearchCard from './components/SearchCard'
import { boardingPoints, cities } from './data'
import type { City } from './types'
import './App.css'

function App() {
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)

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
