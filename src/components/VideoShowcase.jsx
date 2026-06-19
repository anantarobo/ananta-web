import { useState } from 'react'
import VideoPlayer from './VideoPlayer'

function NavButton({ direction, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`video-nav video-nav--${direction} ${className}`.trim()}
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous video' : 'Next video'}
    >
      {direction === 'prev' ? '‹' : '›'}
    </button>
  )
}

export default function VideoShowcase({ videos }) {
  const [active, setActive] = useState(0)
  const current = videos[active]
  const lastIndex = videos.length - 1

  const goPrev = () => setActive((i) => (i === 0 ? lastIndex : i - 1))
  const goNext = () => setActive((i) => (i === lastIndex ? 0 : i + 1))

  return (
    <div className="video-showcase">
      <div className="video-showcase-player">
        <NavButton direction="prev" onClick={goPrev} className="video-nav--desktop" />

        <div className="video-showcase-frame">
          <VideoPlayer
            key={current.vimeoId}
            vimeoId={current.vimeoId}
            title={current.title}
          />
        </div>

        <NavButton direction="next" onClick={goNext} className="video-nav--desktop" />
      </div>

      <div className="video-showcase-meta">
        <NavButton direction="prev" onClick={goPrev} className="video-nav--mobile" />

        <div className="video-showcase-meta-center">
          <p className="video-showcase-label">{current.title}</p>
          <span className="video-showcase-counter">
            {active + 1} / {videos.length}
          </span>
        </div>

        <NavButton direction="next" onClick={goNext} className="video-nav--mobile" />
      </div>
    </div>
  )
}
