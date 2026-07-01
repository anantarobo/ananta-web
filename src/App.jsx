import { useState, useEffect } from 'react'
import Logo from './components/Logo'
import BeforeAfter from './components/BeforeAfter'
import VideoShowcase from './components/VideoShowcase'
import ContactForm from './components/ContactForm'
import TestimonialsCarousel from './components/TestimonialsCarousel'
import Seo from './components/Seo'
import WhatsAppFloat from './components/WhatsAppFloat'
import './App.css'

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Results', href: '#results' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Video', href: '#video' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

const STATS = [
  { value: '100%', label: 'Autonomous Operation', desc: 'No manual labour required', icon: '🤖' },
  { value: '0L', label: 'Water Used', desc: 'Completely waterless cleaning', icon: '💧' },
  { value: '15%+', label: 'Energy Recovered', desc: 'Lost generation regained', icon: '⚡' },
  { value: '24/7', label: 'Always Running', desc: 'No operational limits', icon: '🔄' },
]

const GALLERY = [
  { src: '/image1.jpeg', alt: 'Ananta robot on solar panels', caption: 'Our robot in action on rooftop solar' },
  { src: '/image2.jpeg', alt: 'Solar panel cleaning robot', caption: 'Precision cleaning technology' },
  { src: '/image3.jpeg', alt: 'Ananta robotics deployment', caption: 'Deployed across large installations' },
  { src: '/image4.jpeg', alt: 'Ananta robotics field work', caption: 'Field-tested and proven results' },
]

const BEFORE_AFTER = [
  {
    title: 'Rooftop Solar',
    before: '/beforeimage1.png',
    after: '/afterimage1.png',
  },
]

const VIDEOS = [
  { title: 'Robot in Action', vimeoId: '1202735700' },
  { title: 'Field Deployment', vimeoId: '1202735701' },
]

const TESTIMONIALS = [
  {
    name: 'Jignesh Patel',
    location: 'Adajan, Surat',
    quote:
      'After installing the Solar Cleaning Robot from ANANTA ROBOTICS, maintaining my solar panels has become effortless. The automatic cleaning schedule keeps the panels dust-free and performing efficiently every day.',
  },
  {
    name: 'Hitesh Gajera',
    location: 'Vesu, Surat',
    quote:
      'This robot has saved both time and maintenance costs. The installation was smooth, and the overall performance has exceeded my expectations. A great investment for any solar panel owner.',
  },
  {
    name: 'Milan Desai',
    location: 'Katargam, Surat',
    quote:
      'I was looking for an automated solution for cleaning my rooftop solar panels, and this product delivered exactly that. Reliable, efficient, and easy to use. Highly recommended.',
  },
  {
    name: 'Ketan Bhimani',
    location: 'Varachha, Surat',
    quote:
      'Dust and dirt were affecting my solar panel performance. Now the robot cleans regularly, and I can clearly see a positive difference in power generation.',
  },
  {
    name: 'Dhaval Savani',
    location: 'Piplod, Surat',
    quote:
      'This solution from ANANTA ROBOTICS is very practical and reliable. Automatic operation and low maintenance make it extremely easy to use.',
  },
]

const FOOTER_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Results', href: '#results' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Video', href: '#video' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="#home" className="logo-link">
            <Logo variant="icon" />
            <span className="logo-text">ANANTA <small>ROBOTICS</small></span>
          </a>

          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </div>

          <div className="nav-cta">
            <a href="#contact" className="btn btn-outline">Talk to Expert</a>
            <a href="#contact" className="btn btn-primary">Get a Quote</a>
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mobile-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
        <a href="#contact" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
          Get a Quote
        </a>
      </div>
    </>
  )
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-grid" />
      <div className="container container--hero">
        <div className="hero-layout">
          <div className="hero-content">
            <div className="hero-badge">Welcome to ANANTA ROBOTICS 🚀</div>
            <h1>
              Innovating the Future of{' '}
              <span className="highlight">Human Life.</span>
            </h1>
            <p className="hero-sub">
              ⚙️✨ Autonomous solar panel cleaning robots — waterless, labour-free,
              and built to recover lost energy generation.
            </p>
            <p className="hero-tagline">
              Thank you for connecting with us! We look forward to collaborating
              and bringing your ideas to life.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">Get a Quote</a>
              <a href="#video" className="btn btn-ghost">Watch Video</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-frame">
              <img src="/image1.jpeg" alt="Ananta Robotics solar cleaning robot" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-header">
          <span className="stats-header-label">Why ANANTA</span>
          <h2>Built for maximum solar efficiency</h2>
        </div>
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-body">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-desc">{stat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section about">
      <div className="container about-layout">
        <div className="about-visual">
          <img
            src="/image3.jpeg"
            alt="Ananta Robotics solar cleaning robot in action"
            className="about-image"
          />
        </div>
        <div className="about-content">
          <span className="section-label">About Us</span>
          <h2 className="section-title">ANANTA ROBOTICS</h2>
          <p className="about-lead">
            Innovating the Future of Human Life. ⚙️✨
          </p>
          <p>
            We build autonomous solar panel cleaning robots that help recover
            lost energy generation — without water, without labour, and without
            operational limits.
          </p>
          <p>
            Based in Surat, Gujarat, we are committed to bringing cutting-edge
            robotics solutions to India's growing solar infrastructure. Thank you
            for connecting with us — we look forward to collaborating and
            bringing your ideas to life.
          </p>
          <div className="about-highlights">
            <div className="about-highlight">
              <span className="about-highlight-icon">🤖</span>
              <div>
                <strong>Autonomous Robots</strong>
                <p>Fully automated solar panel cleaning</p>
              </div>
            </div>
            <div className="about-highlight">
              <span className="about-highlight-icon">💧</span>
              <div>
                <strong>Waterless Technology</strong>
                <p>Zero water consumption, eco-friendly</p>
              </div>
            </div>
            <div className="about-highlight">
              <span className="about-highlight-icon">⚡</span>
              <div>
                <strong>Energy Recovery</strong>
                <p>Restore up to 15%+ lost generation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Results() {
  return (
    <section id="results" className="section results">
      <div className="container">
        <div className="section-header-center">
          <span className="section-label">Before & After</span>
          <h2 className="section-title">See the difference our robots make</h2>
          <p className="section-desc">
            Drag the slider to compare dirty panels before cleaning vs. pristine
            panels after our autonomous robots finish the job.
          </p>
        </div>
        <div className="ba-grid">
          {BEFORE_AFTER.map((item) => (
            <BeforeAfter
              key={item.title}
              title={item.title}
              before={item.before}
              after={item.after}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Gallery() {
  return (
    <section id="gallery" className="section gallery">
      <div className="container">
        <div className="section-header-center">
          <span className="section-label">Our Work</span>
          <h2 className="section-title">Robots in the field</h2>
          <p className="section-desc">
            Real deployments, real results — our autonomous cleaning robots
            operating across solar installations.
          </p>
        </div>
        <div className="gallery-grid">
          {GALLERY.map((item) => (
            <figure key={item.src} className="gallery-item">
              <div className="gallery-img-wrap">
                <img src={item.src} alt={item.alt} loading="lazy" />
              </div>
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoSection() {
  return (
    <section id="video" className="section video-section">
      <div className="container">
        <div className="section-header-center">
          <span className="section-label">Watch</span>
          <h2 className="section-title">See our robots in action</h2>
          <p className="section-desc">
            Watch how ANANTA ROBOTICS autonomous cleaners work on real solar
            panel installations.
          </p>
        </div>
        <VideoShowcase videos={VIDEOS} />
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="section testimonials">
      <div className="container">
        <div className="section-header-center">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">What our customers say</h2>
          <p className="section-desc">
            Real feedback from solar panel owners across Surat who trust
            ANANTA ROBOTICS for automated cleaning.
          </p>
        </div>
        <TestimonialsCarousel testimonials={TESTIMONIALS} />
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="cta">
      <div className="container">
        <div className="cta-card">
          <div className="cta-main">
            <span className="cta-label">Get in Touch</span>
            <h2>Ready to recover your lost solar energy?</h2>
            <p>Fill the form and our team will contact you with a customized solution.</p>
            <ContactForm />
            <div className="cta-trust">
              <span>✓ Free consultation</span>
              <span>✓ Custom ROI analysis</span>
              <span>✓ Surat, Gujarat</span>
            </div>
          </div>

          <div className="cta-side">
            <h3>Contact Information</h3>
            <ul className="cta-info-list">
              <li>
                <span className="cta-info-icon">📍</span>
                <div>
                  <strong>Location</strong>
                  <p>Surat, Gujarat</p>
                </div>
              </li>
              <li>
                <span className="cta-info-icon">📞</span>
                <div>
                  <strong>Phone</strong>
                  <a href="tel:+919512494999">+91 95124 94999</a>
                </div>
              </li>
              <li>
                <span className="cta-info-icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:anantarobotics925@gmail.com">anantarobotics925@gmail.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="footer-logo-link">
              <Logo variant="full" />
            </a>
            <p>
              Innovating the Future of Human Life. Autonomous solar panel
              cleaning robots — waterless, labour-free, built in Surat, Gujarat.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>Surat, Gujarat</li>
              <li><a href="tel:+919512494999">+91 95124 94999</a></li>
              <li><a href="mailto:anantarobotics925@gmail.com">anantarobotics925@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© Copyright 2026 – ANANTA ROBOTICS. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Seo />
      <Navbar />
      <Hero />
      <Stats />
      <About />
      <Results />
      <Gallery />
      <VideoSection />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
