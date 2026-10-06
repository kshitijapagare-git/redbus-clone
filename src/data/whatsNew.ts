export interface WhatsNewItem {
  id: string
  title: string
  description: string
}

export const whatsNewItems: WhatsNewItem[] = [
  {
    id: 'acko-travel-protection',
    title: 'ACKO travel protection',
    description: 'Protect your trip against delays and cancellations with ACKO travel protection.',
  },
  {
    id: 'free-cancellation',
    title: 'Free Cancellation',
    description: 'Cancel your ticket with zero cancellation fee on eligible buses.',
  },
  {
    id: 'bus-timetable',
    title: 'Bus timetable',
    description: 'Check bus timetables for popular routes before you book.',
  },
  {
    id: 'flexi-ticket',
    title: 'FlexiTicket',
    description: 'Change your date of travel for free with FlexiTicket.',
  },
]
