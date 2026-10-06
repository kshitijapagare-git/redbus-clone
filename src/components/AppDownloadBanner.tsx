import qrCodePlaceholder from '../assets/qr-code-placeholder.svg'
import { appDownloadInfo } from '../data'

function AppDownloadBanner() {
  const { googlePlay, appStore } = appDownloadInfo

  return (
    <section className="container section app-download-banner">
      <div className="app-download-banner-inner">
        <div className="app-download-banner-text">
          <h2>Grab 10% off now</h2>
          <p>Download App to unlock offer!</p>
          <div className="app-download-badges">
            <a
              className="app-download-badge"
              href={googlePlay.href}
              aria-label={`Google Play · ★ ${googlePlay.rating} · ${googlePlay.downloads}`}
            >
              <span aria-hidden="true">▶</span>
              <span>
                <strong>Google Play</strong>
                <small>
                  ★ {googlePlay.rating} · {googlePlay.downloads}
                </small>
              </span>
            </a>
            <a
              className="app-download-badge"
              href={appStore.href}
              aria-label={`App Store · ★ ${appStore.rating} · ${appStore.downloads}`}
            >
              <span aria-hidden="true"></span>
              <span>
                <strong>App Store</strong>
                <small>
                  ★ {appStore.rating} · {appStore.downloads}
                </small>
              </span>
            </a>
          </div>
        </div>
        <img className="app-download-qr" src={qrCodePlaceholder} alt="QR code to download the redBus app" />
      </div>
    </section>
  )
}

export default AppDownloadBanner
