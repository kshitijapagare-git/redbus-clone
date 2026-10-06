export interface Testimonial {
  name: string
  sinceYear: number
  quote: string
}

export const testimonials: Testimonial[] = [
  {
    name: 'Amol Bodhare',
    sinceYear: 2015,
    quote: 'Booking bus tickets with redBus has always been smooth and hassle-free. I have been a loyal customer for years.',
  },
  {
    name: 'Debaditya',
    sinceYear: 2018,
    quote: 'redBus makes it so easy to compare operators and pick the right seat. Highly recommended for every trip.',
  },
  {
    name: 'Sachin Bankar',
    sinceYear: 2016,
    quote: 'Great customer support and reliable buses every single time. redBus is my go-to for travel booking.',
  },
]
