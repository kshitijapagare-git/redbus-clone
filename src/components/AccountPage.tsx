import { useState } from 'react'

export interface AccountOption {
  id: string
  label: string
  icon: string
  subtitle?: string
}

export interface AccountOptionGroup {
  title: string
  options: AccountOption[]
}

export const accountOptionGroups: AccountOptionGroup[] = [
  {
    title: 'My details',
    options: [
      { id: 'bookings', label: 'Bookings', icon: '🎟️' },
      { id: 'personal-information', label: 'Personal information', icon: '🧑' },
    ],
  },
  {
    title: 'Payments',
    options: [
      { id: 'redbus-wallet', label: 'redBus Wallet', icon: '👛' },
      { id: 'redeem-gift-card', label: 'Redeem gift card', icon: '🎁' },
    ],
  },
  {
    title: 'More',
    options: [
      { id: 'offers', label: 'Offers', icon: '🏷️' },
      { id: 'know-about-redbus', label: 'Know about redBus', icon: 'ℹ️' },
      { id: 'help', label: 'Help', icon: '❓' },
      { id: 'cancel-ticket', label: 'Cancel Ticket', icon: '✖️' },
      { id: 'reschedule-ticket', label: 'Reschedule ticket', icon: '🔄' },
      { id: 'search-ticket', label: 'Search ticket', icon: '🔍' },
      { id: 'language', label: 'Language', icon: '🌐', subtitle: 'English' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'country', label: 'Country', icon: '🇮🇳', subtitle: 'India' },
      { id: 'booking-for-women', label: 'Booking for women', icon: '👩' },
    ],
  },
]

const DEFAULT_SELECTED_OPTION_ID = 'bookings'

function AccountPage() {
  const [selectedOptionId, setSelectedOptionId] = useState(DEFAULT_SELECTED_OPTION_ID)

  return (
    <main className="account-page">
      <div className="container account-page-inner">
        <div className="account-left">
          <div className="account-login-box">
            <h2>Log in to manage your bookings</h2>
            <button type="button" className="account-login-btn">
              Log in
            </button>
            <p className="account-signup-line">
              Don&apos;t have an account?{' '}
              <button type="button" className="account-signup-link">
                Sign up
              </button>
            </p>
          </div>
          {accountOptionGroups.map((group) => (
            <div className="account-option-group" key={group.title}>
              <h3 className="account-option-group-title">{group.title}</h3>
              <ul className="account-option-list">
                {group.options.map((option) => {
                  const isSelected = option.id === selectedOptionId
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        className={`account-option${isSelected ? ' selected' : ''}`}
                        aria-current={isSelected ? 'true' : undefined}
                        onClick={() => setSelectedOptionId(option.id)}
                      >
                        <span className="account-option-icon" aria-hidden="true">
                          {option.icon}
                        </span>
                        <span className="account-option-text">
                          <span className="account-option-label">{option.label}</span>
                          {option.subtitle && <span className="account-option-subtitle">{option.subtitle}</span>}
                        </span>
                        <span className="account-option-arrow" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="account-right">
          <div className="account-right-head">
            <h2>My bookings</h2>
            <span className="account-refresh-icon" aria-hidden="true">
              ⟳
            </span>
          </div>
          <div className="account-empty-state">
            <span className="account-empty-illustration" aria-hidden="true">
              🧳
            </span>
            <p className="account-empty-title">Login to manage your trips</p>
            <p className="account-empty-subtitle">Track, modify or cancel with ease</p>
            <button type="button" className="account-login-btn">
              Login
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AccountPage
