import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

const MOBILE_BREAKPOINT = 900
const MOBILE_PANEL_ID = 'header-mobile-panel'

function Header() {
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  const isMobile = viewportWidth < MOBILE_BREAKPOINT

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = ''
    menuButtonRef.current?.focus()
  }

  // While the panel is open: lock body scroll, move focus to the first link,
  // close on Escape, close on a click/tap outside the panel (and the menu
  // button itself, which has its own toggle handler), and trap Tab/Shift+Tab
  // within the panel's focusable elements.
  useEffect(() => {
    if (!isMenuOpen) return

    document.body.style.overflow = 'hidden'
    firstLinkRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu()
        return
      }

      if (e.key === 'Tab') {
        const panel = panelRef.current
        if (!panel) return
        const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      const panel = panelRef.current
      const button = menuButtonRef.current
      if (panel && !panel.contains(target) && button !== target && !button?.contains(target)) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Anchors fire a native click on Enter but not on Space, so Space needs
  // explicit handling here to close the panel; Enter is covered by onClick.
  const handleLinkKeyDown = (e: ReactKeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === ' ') {
      closeMenu()
    }
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">redBus</div>
        <nav className="nav-main">
          <a className="nav-item active" href="#">
            <span className="nav-icon">🚌</span>Bus tickets
          </a>
          <a className="nav-item" href="#">
            <span className="nav-icon">🚆</span>Train tickets
          </a>
          <a className="nav-item" href="#">
            <span className="nav-icon">🛏️</span>Hotels
          </a>
        </nav>
        {!isMobile && (
          <nav className="nav-side">
            <a href="#">☰ Bookings</a>
            <a href="#">ⓘ Help</a>
            <a href="#">◉ Account</a>
          </nav>
        )}
        {isMobile && (
          <button
            type="button"
            ref={menuButtonRef}
            className="menu-btn"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_PANEL_ID}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            ☰
          </button>
        )}
      </div>
      {isMenuOpen && (
        <>
          <div className="mobile-panel-backdrop" aria-hidden="true" />
          <div id={MOBILE_PANEL_ID} ref={panelRef} role="dialog" aria-label="Menu" className="mobile-panel">
            <nav className="mobile-panel-nav">
              <a ref={firstLinkRef} href="#" onClick={closeMenu} onKeyDown={handleLinkKeyDown}>
                ☰ Bookings
              </a>
              <a href="#" onClick={closeMenu} onKeyDown={handleLinkKeyDown}>
                ⓘ Help
              </a>
              <a href="#" onClick={closeMenu} onKeyDown={handleLinkKeyDown}>
                ◉ Account
              </a>
            </nav>
            <button type="button" className="mobile-panel-close" aria-label="Close menu" onClick={closeMenu}>
              ×
            </button>
          </div>
        </>
      )}
    </header>
  )
}

export default Header
