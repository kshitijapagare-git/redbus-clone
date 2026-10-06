export const popularBusRoutes: string[] = [
  'Pune to Bengaluru',
  'Bengaluru to Pune',
  'Mumbai to Pune',
  'Pune to Mumbai',
  'Bengaluru to Chennai',
  'Chennai to Bengaluru',
  'Hyderabad to Bengaluru',
  'Bengaluru to Hyderabad',
]

export const popularCities: string[] = [
  'Pune',
  'Bengaluru',
  'Mumbai',
  'Chennai',
  'Hyderabad',
  'Delhi',
  'Kolkata',
  'Ahmedabad',
]

export const popularBusOperators: string[] = [
  'APSRTC',
  'TGSRTC',
  'KERALA RTC',
  'KTCL',
  'VRL Travels',
  'SRS Travels',
  'Orange Travels',
  'Kallada Travels',
]

export interface PopularList {
  id: string
  title: string
  items: string[]
}

/** The collapsible lists in the Popular Searches section, in display order. */
export const popularLists: PopularList[] = [
  { id: 'popular-bus-routes', title: 'Popular Bus Routes', items: popularBusRoutes },
  { id: 'popular-cities', title: 'Popular Cities', items: popularCities },
  { id: 'popular-bus-operators', title: 'Popular Bus Operators', items: popularBusOperators },
]
