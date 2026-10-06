import { useState } from 'react'
import AboutRedBusSection from './components/AboutRedBusSection'
import AccountPage from './components/AccountPage'
import AppDownloadBanner from './components/AppDownloadBanner'
import AppPromoStrip from './components/AppPromoStrip'
import BoardingPointList from './components/BoardingPointList'
import BusSearchResultsPage from './components/BusSearchResultsPage'
import FAQsSection from './components/FAQsSection'
import FestivalTrainsSection from './components/FestivalTrainsSection'
import Footer from './components/Footer'
import GetawaysSection from './components/GetawaysSection'
import GovernmentBusesSection from './components/GovernmentBusesSection'
import Header from './components/Header'
import HelpPage from './components/HelpPage'
import HotelsPage from './components/HotelsPage'
import Offers from './components/Offers'
import OffersPage from './components/OffersPage'
import PassengerDetailsPage from './components/PassengerDetailsPage'
import PopularListsSection from './components/PopularListsSection'
import RedDealsSection from './components/RedDealsSection'
import SearchCard from './components/SearchCard'
import SeatSelectionPage from './components/SeatSelectionPage'
import TestimonialsSection from './components/TestimonialsSection'
import TrainsPage from './components/TrainsPage'
import TrainsSearchPage from './components/TrainsSearchPage'
import WhatsNewSection from './components/WhatsNewSection'
import { boardingPoints, cities } from './data'
import {
  ACCOUNT_PATH,
  HELP_PATH,
  HOTELS_PATH,
  OFFERS_PATH,
  SEARCH_PATH,
  TRAINS_PATH,
  TRAINS_SEARCH_PATH,
  matchPassengerDetailsPath,
  matchSeatSelectionPath,
  useCurrentPath,
} from './lib/route'
import type { City } from './types'
import './App.css'

function App() {
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)
  const currentPath = useCurrentPath()

  let pageContent
  const seatSelectionBusId = matchSeatSelectionPath(currentPath)
  const passengerDetailsBusId = matchPassengerDetailsPath(currentPath)

  if (passengerDetailsBusId !== null) {
    pageContent = <PassengerDetailsPage busId={passengerDetailsBusId} />
  } else if (seatSelectionBusId !== null) {
    pageContent = <SeatSelectionPage busId={seatSelectionBusId} />
  } else if (currentPath === HOTELS_PATH) {
    pageContent = <HotelsPage />
  } else if (currentPath === ACCOUNT_PATH) {
    pageContent = <AccountPage />
  } else if (currentPath === HELP_PATH) {
    pageContent = <HelpPage />
  } else if (currentPath === OFFERS_PATH) {
    pageContent = <OffersPage />
  } else if (currentPath === TRAINS_SEARCH_PATH) {
    pageContent = <TrainsSearchPage />
  } else if (currentPath === SEARCH_PATH) {
    pageContent = <BusSearchResultsPage />
  } else if (currentPath === TRAINS_PATH) {
    pageContent = <TrainsPage />
  } else {
    pageContent = (
      <>
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
        <div className="container search-wrap" id="search-card">
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
          <GetawaysSection />
          <FestivalTrainsSection />
          <WhatsNewSection />
          <GovernmentBusesSection />
          <TestimonialsSection />
          <AppDownloadBanner />
          <AboutRedBusSection />
          <RedDealsSection />
          <FAQsSection />
          <PopularListsSection />
        </main>
      </>
    )
  }

  return (
    <>
      <AppPromoStrip />
      <Header />
      {pageContent}
      <Footer />
    </>
  )
}

export default App
