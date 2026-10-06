export interface AboutRedBusSubsection {
  heading: string
  /** Rendered as a paragraph under the heading. Omitted for the steps subsection. */
  body?: string
  /** Renders the numbered booking steps instead of a paragraph. */
  showsSteps?: boolean
}

/** The About redBus subsections, in display order. */
export const aboutRedBusSubsections: AboutRedBusSubsection[] = [
  {
    heading: 'Why Choose redBus for Bus Booking?',
    body:
      'With thousands of trusted operators, live seat selection and 24x7 customer support, redBus makes bus ticket booking fast, transparent and reliable.',
  },
  {
    heading: 'Why Choose redRail for Train Ticket Booking?',
    body:
      'redRail brings the same ease of booking to train travel, with real-time availability, PNR status checks and running status updates in one place.',
  },
  {
    heading: 'How to Book Bus Tickets and Train Tickets Online on redBus?',
    showsSteps: true,
  },
  {
    heading: 'Exclusive Offers on redBus',
    body:
      'Unlock exclusive discounts and cashback offers on every booking with redBus coupon codes, applied automatically at checkout when eligible.',
  },
]

export interface AboutRedBusStep {
  step: number
  text: string
}

export const aboutRedBusSteps: AboutRedBusStep[] = [
  { step: 1, text: 'Open the redBus website or app and enter your source and destination cities.' },
  { step: 2, text: 'Select your date of journey and tap Search to view available buses or trains.' },
  { step: 3, text: 'Compare operators, timings, seat availability and fares to pick the best option.' },
  { step: 4, text: 'Choose your preferred seat and boarding/dropping point.' },
  { step: 5, text: 'Enter passenger details and apply any eligible coupon code.' },
  { step: 6, text: 'Complete the payment using your preferred payment method.' },
  { step: 7, text: 'Receive your e-ticket instantly via SMS and email, ready to show at boarding.' },
]

export interface AboutRedBusLink {
  label: string
  href: string
}

export const aboutRedBusLinks: AboutRedBusLink[] = [
  { label: 'train ticket booking', href: '/trains' },
  { label: 'PNR status', href: '/pnr-status' },
  { label: 'train running status', href: '/train-running-status' },
]

export interface AboutRedBusIntroSegment {
  /** Plain text to render. Mutually exclusive with linkLabel. */
  text?: string
  /** References an AboutRedBusLink.label to render an <a> in this spot. */
  linkLabel?: string
}

export interface AboutRedBusIntroParagraph {
  segments: AboutRedBusIntroSegment[]
}

export const aboutRedBusIntro: AboutRedBusIntroParagraph[] = [
  {
    segments: [
      {
        text:
          "redBus is India's largest online bus ticket booking platform, trusted by millions of travellers for safe, convenient and affordable bus and train travel across the country.",
      },
    ],
  },
  {
    segments: [
      {
        text:
          "Whether you're planning a short weekend trip or a long-distance journey, redBus and redRail make it simple to compare operators, pick the right seat and book with confidence — including ",
      },
      { linkLabel: 'train ticket booking' },
      { text: ', checking ' },
      { linkLabel: 'PNR status' },
      { text: ' and tracking ' },
      { linkLabel: 'train running status' },
      { text: '.' },
    ],
  },
]
