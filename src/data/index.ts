import type { BoardingPoint, City } from '../types'

export const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

export const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
  { id: 3, name: 'Majestic', address: 'Kempegowda Bus Station', landmark: 'Opp. Railway Station', cityId: 2 },
]

export * from './getaways'
export * from './festivalTrains'
export * from './testimonials'
export * from './appDownload'
export * from './aboutRedBus'
export * from './redDeals'
export * from './faqs'
export * from './whatsNew'
export * from './governmentBuses'
export * from './popularLists'
export * from './footerLinks'

