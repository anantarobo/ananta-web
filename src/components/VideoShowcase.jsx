import { useState } from 'react'
import VideoPlayer from './VideoPlayer'

export default function VideoShowcase({ videos }) {
  const [active, setActive] = useState(0)
  const current = videos[active]

  return (
    <div className="video-showcase">
      <div className="video-showcase-player">
        <VideoPlayer
          key={current.vimeoId}
          vimeoId={current.vimeoId}
          title={current.title}
        />
        <p className="video-showcase-label">{current.title}</p>
      </div>

      <div className="video-picker" role="tablist" aria-label="Choose a video">
        {videos.map((video, index) => (
          <button
            key={video.vimeoId}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`video-picker-card${index === active ? ' active' : ''}`}
            onClick={() => setActive(index)}
          >
            <div className="video-picker-thumb-wrap">
              <img src={video.poster} alt="" className="video-picker-thumb" />
              {index === active && <span className="video-picker-play">▶</span>}
            </div>
            <div className="video-picker-info">
              <span className="video-picker-index">0{index + 1}</span>
              <span className="video-picker-title">{video.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
