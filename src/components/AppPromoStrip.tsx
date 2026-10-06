import { useState } from 'react'
import { loadAppPromoDismissed, persistAppPromoDismissed } from '../lib/appPromo'

function AppPromoStrip() {
  const [isDismissed, setIsDismissed] = useState(() => loadAppPromoDismissed().dismissed)

  if (isDismissed) return null

  const handleClose = () => {
    setIsDismissed(true)
    persistAppPromoDismissed()
  }

  return (
    <div className="app-promo-strip">
      <div className="container app-promo-strip-inner">
        <span className="app-promo-strip-text">
          <strong>Get 10% Discount</strong> · Use code APP10 on app
        </span>
        <button type="button" className="app-promo-strip-install">
          Install redBus App
        </button>
        <button
          type="button"
          className="app-promo-strip-close"
          aria-label="Close"
          onClick={handleClose}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default AppPromoStrip
