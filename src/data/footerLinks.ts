export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'About redBus',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Investor Relations', href: '/investor-relations' },
      { label: 'Press & Media', href: '/press' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Support & Legal',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cancellation Policy', href: '/cancellation-policy' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Bus Tickets', href: '/' },
      { label: 'Train Tickets', href: '/trains' },
      { label: 'Hotels', href: '/hotels' },
      { label: 'Offers', href: '/offers' },
      { label: 'Getaways', href: '/getaways' },
    ],
  },
  {
    title: 'Traveller Tools',
    links: [
      { label: 'PNR Status', href: '/pnr-status' },
      { label: 'Train Running Status', href: '/train-running-status' },
      { label: 'Bus Timetable', href: '/bus-timetable' },
      { label: 'Live Bus Tracking', href: '/live-tracking' },
      { label: 'Fare Calculator', href: '/fare-calculator' },
    ],
  },
  {
    title: 'Apps',
    links: [
      { label: 'Android App', href: 'https://play.google.com/store/apps/details?id=com.redbus' },
      { label: 'iOS App', href: 'https://apps.apple.com/app/redbus/id456463380' },
    ],
  },
  {
    title: 'Global Sites',
    links: [
      { label: 'redBus Indonesia', href: 'https://www.redbus.id' },
      { label: 'redBus Singapore', href: 'https://www.redbus.sg' },
      { label: 'redBus Malaysia', href: 'https://www.redbus.my' },
      { label: 'redBus Colombia', href: 'https://www.redbus.co' },
      { label: 'redBus Peru', href: 'https://www.redbus.pe' },
    ],
  },
  {
    title: 'Our Partners',
    links: [
      { label: 'Bus Operators', href: '/bus-operators' },
      { label: 'Travel Agents', href: '/travel-agents' },
      { label: 'Affiliates', href: '/affiliates' },
    ],
  },
]
