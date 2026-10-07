export interface City {
  id: number
  name: string
  state: string
}

export interface RecentSearch {
  fromCityId: City['id']
  toCityId: City['id']
  /** Date-only key in 'YYYY-MM-DD' form (local calendar date). */
  date: string
}

export interface BoardingPoint {
  id: number
  name: string
  address: string
  landmark: string
  cityId: City['id']
}

export interface Coupon {
  code: string
  discountAmount: number
  active: boolean
  allowedBusIds: number[]
}

export type PaymentMethodType = 'upi' | 'card' | 'netbanking'

export type BookingStatus = 'Confirmed'

export interface Passenger {
  seatId: string
  name: string
  age: number
  gender: string
}

export interface Booking {
  pnr: string
  status: BookingStatus
  busId: number
  operatorName: string
  busType: BusType
  fromCityId: number
  toCityId: number
  /** Date-only key in 'YYYY-MM-DD' form (local calendar date). */
  date: string
  /** 24h 'HH:MM' */
  departureTime: string
  /** 24h 'HH:MM' */
  arrivalTime: string
  seatIds: string[]
  boardingPoint: BoardingPoint
  droppingPoint: BoardingPoint
  passengers: Passenger[]
  contact: {
    email: string
    mobile: string
  }
  fare: {
    subtotal: number
    discount: number
    gst: number
    total: number
  }
  couponCode: string | null
  createdAt: string
}

export type BusType = 'AC Seater' | 'AC Sleeper' | 'Non-AC Seater' | 'Non-AC Sleeper'

export interface Bus {
  id: number
  /** `'<fromCityId>-<toCityId>'`, e.g. '1-2'. */
  routeId: string
  operatorName: string
  busType: BusType
  /** 24h 'HH:MM' */
  departureTime: string
  /** 24h 'HH:MM' */
  arrivalTime: string
  durationMins: number
  fare: number
  seatsAvailable: number
  rating: number
  isWomenFriendly: boolean
}

export type SeatDeckName = 'lower' | 'upper'

export interface Seat {
  /** Unique across all decks of a bus, e.g. 'L4' or 'U2'. */
  id: string
  /** Display label, e.g. the seat number within its deck/row. */
  label: string
  deck: SeatDeckName
  womenOnly: boolean
}

export type SeatMapMode = 'seater' | 'sleeper' | 'mixed'

export interface BusSeatMap {
  mode: SeatMapMode
  decks: {
    lower: Seat[]
    upper?: Seat[]
  }
  /** Seat ids (from either deck) that are already booked. */
  booked: string[]
}
