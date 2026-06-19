import { useEffect, useState } from 'react'

export default function VideoPlayer({ vimeoId, title }) {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobilePortrait(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const params = new URLSearchParams({
    title: '0',
    byline: '0',
    portrait: isMobilePortrait ? '1' : '0',
  })

  return (
    <div className={`video-wrapper${isMobilePortrait ? ' video-wrapper--portrait' : ''}`}>
      <iframe
        className="video-iframe"
        src={`https://player.vimeo.com/video/${vimeoId}?${params.toString()}`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        allowFullScreen
      />
    </div>
  )
}
