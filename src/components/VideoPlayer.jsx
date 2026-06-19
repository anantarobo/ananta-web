export default function VideoPlayer({ vimeoId, title }) {
  return (
    <div className="video-wrapper">
      <iframe
        className="video-iframe"
        src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        allowFullScreen
      />
    </div>
  )
}
