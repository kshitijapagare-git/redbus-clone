export type FAQCategory = 'General' | 'Ticket-related' | 'Payment' | 'Cancellation & Refund'

/** Tab order for the FAQ section; the first one is selected by default. */
export const faqCategories: FAQCategory[] = ['General', 'Ticket-related', 'Payment', 'Cancellation & Refund']

export interface FAQItem {
  category: FAQCategory
  question: string
  answer: string
}

export const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is redBus?',
    answer: 'redBus is an online platform that lets you search, compare and book bus and train tickets across India.',
  },
  {
    category: 'General',
    question: 'How do I search for buses on redBus?',
    answer: 'Enter your source, destination and date of journey on the home page, then tap Search buses to see available options.',
  },
  {
    category: 'General',
    question: 'Is redBus available as a mobile app?',
    answer: 'Yes, redBus is available on both Android and iOS, with the same booking features as the website.',
  },
  {
    category: 'Ticket-related',
    question: 'How do I view my ticket after booking?',
    answer: 'Your ticket is sent instantly via SMS and email, and is also available under My Bookings in your account.',
  },
  {
    category: 'Ticket-related',
    question: 'Can I change my boarding point after booking?',
    answer: 'Boarding point changes depend on the operator; check your ticket or contact support for options on your route.',
  },
  {
    category: 'Payment',
    question: 'What payment methods are accepted?',
    answer: 'redBus accepts credit/debit cards, UPI, net banking and popular wallets.',
  },
  {
    category: 'Payment',
    question: 'Is it safe to pay online on redBus?',
    answer: 'Yes, all payments are processed through secure, encrypted payment gateways.',
  },
  {
    category: 'Cancellation & Refund',
    question: 'How do I cancel my ticket?',
    answer: 'Go to My Bookings, select your ticket and choose Cancel Ticket to start the cancellation process.',
  },
  {
    category: 'Cancellation & Refund',
    question: 'How long does a refund take?',
    answer: 'Refunds are typically processed back to your original payment method within 5-7 business days.',
  },
]
