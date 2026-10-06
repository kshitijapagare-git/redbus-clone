import type { Bus } from '../types'

export interface BusCardProps {
  bus: Bus
}

function BusCard({ bus }: BusCardProps) {
  return (
    <li className="bus-card">
      <div className="bus-card-head">
        <h3 className="bus-card-operator">{bus.operatorName}</h3>
        <span className="bus-card-type">{bus.busType}</span>
      </div>
      <div className="bus-card-times">
        <span className="bus-card-departure">{bus.departureTime}</span>
        <span className="bus-card-duration">{bus.durationMins} mins</span>
        <span className="bus-card-arrival">{bus.arrivalTime}</span>
      </div>
      <div className="bus-card-footer">
        <span className="bus-card-rating">★ {bus.rating.toFixed(1)}</span>
        <span className="bus-card-fare">₹{bus.fare}</span>
        <span className="bus-card-seats">{bus.seatsAvailable} seats left</span>
      </div>
    </li>
  )
}

export default BusCard
