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
