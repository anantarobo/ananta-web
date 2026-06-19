import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(onClose, 4500)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return createPortal(
    <div className="toast-stack" role="status" aria-live="polite">
      <div className={`toast toast--${type}`}>
        <span className="toast-icon" aria-hidden="true">
          {type === 'success' ? '✓' : '!'}
        </span>
        <p className="toast-message">{message}</p>
        <button type="button" className="toast-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>,
    document.body,
  )
}
