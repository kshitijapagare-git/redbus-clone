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
