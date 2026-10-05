import { useEffect, useRef } from 'react'

export interface WomenInfoDialogProps {
  isOpen: boolean
  onClose: () => void
}

function WomenInfoDialog({ isOpen, onClose }: WomenInfoDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // While the dialog is open: close on Escape, close on a click/tap outside
  // the panel, following the same convention used in Header.tsx's mobile
  // panel (listeners added only while open, cleaned up on close).
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      const panel = panelRef.current
      if (panel && !panel.contains(target)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="women-dialog-backdrop" aria-hidden="true" />
      <div role="dialog" aria-label="Booking for women" className="women-dialog" ref={panelRef}>
        <button type="button" className="women-dialog-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h3>Booking for women</h3>
        <p>
          Turning this on lets you book seats reserved for women travelling alone, so you can choose
          a seat alongside other women passengers on buses that offer this option.
        </p>
      </div>
    </>
  )
}

export default WomenInfoDialog
