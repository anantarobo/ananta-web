import { useState, useRef, useCallback, useEffect } from 'react'

export default function BeforeAfter({ before, after, title }) {
  const [position, setPosition] = useState(50)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const updatePosition = useCallback((clientX) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onPointerDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    updatePosition(e.clientX)
  }

  const onPointerUp = (e) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div className="ba-card">
      {title && <h3 className="ba-card-title">{title}</h3>}
      <div
        ref={containerRef}
        className="ba-slider"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img src={after} alt="After cleaning" className="ba-img ba-img--after" />
        <div className="ba-before-wrap" style={{ width: `${position}%` }}>
          <img
            src={before}
            alt="Before cleaning"
            className="ba-img ba-img--before"
            style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
          />
        </div>
        <div className="ba-handle" style={{ left: `${position}%` }}>
          <div className="ba-handle-line" />
          <div className="ba-handle-knob">
            <span>◀</span>
            <span>▶</span>
          </div>
        </div>
        <span className="ba-label ba-label--before">Before</span>
        <span className="ba-label ba-label--after">After</span>
      </div>
      <p className="ba-hint">Drag the slider to compare</p>
    </div>
  )
}
