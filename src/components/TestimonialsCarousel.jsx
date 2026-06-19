import { useEffect, useState } from 'react'

function getPerPage(width) {
  if (width <= 768) return 1
  if (width <= 1024) return 2
  return 3
}

export default function TestimonialsCarousel({ testimonials }) {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(3)

  useEffect(() => {
    const update = () => setPerPage(getPerPage(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const totalPages = Math.ceil(testimonials.length / perPage)
  const activePage = Math.min(page, Math.max(totalPages - 1, 0))

  const goPrev = () => {
    setPage((current) => {
      const max = Math.max(totalPages - 1, 0)
      const safe = Math.min(current, max)
      return safe === 0 ? max : safe - 1
    })
  }

  const goNext = () => {
    setPage((current) => {
      const max = Math.max(totalPages - 1, 0)
      const safe = Math.min(current, max)
      return safe === max ? 0 : safe + 1
    })
  }

  const visible = testimonials.slice(activePage * perPage, activePage * perPage + perPage)
  const isPartial = visible.length < perPage

  return (
    <div className="testimonials-carousel-wrap">
      <div className="testimonials-carousel">
        <button
          type="button"
          className="testimonial-nav testimonial-nav--prev"
          onClick={goPrev}
          aria-label="Previous testimonials"
        >
          ‹
        </button>

        <div
          className={`testimonials-track testimonials-track--${perPage}${isPartial ? ' testimonials-track--center' : ''}`}
        >
          {visible.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="testimonial-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote className="testimonial-quote">&ldquo;{item.quote}&rdquo;</blockquote>
              <footer className="testimonial-author">
                <strong>{item.name}</strong>
                <span>{item.location}</span>
              </footer>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="testimonial-nav testimonial-nav--next"
          onClick={goNext}
          aria-label="Next testimonials"
        >
          ›
        </button>
      </div>

      <div className="testimonials-dots" role="tablist" aria-label="Testimonial pages">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`testimonials-dot${index === activePage ? ' testimonials-dot--active' : ''}`}
            onClick={() => setPage(index)}
            aria-label={`Go to page ${index + 1}`}
            aria-selected={index === activePage}
          />
        ))}
      </div>
    </div>
  )
}
