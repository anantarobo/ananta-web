import { useState } from 'react'
import { submitLead } from '../lib/submitLead'
import Toast from './Toast'

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  city: '',
  description: '',
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast({ message: '', type: 'success' })
  }

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()
    const city = form.city.trim()
    const description = form.description.trim()

    if (!name || !email || !phone || !city || !description) {
      showToast('Please fill all required fields.', 'error')
      return
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }

    setLoading(true)

    try {
      await submitLead({ name, email, phone, city, description })
      setForm(INITIAL)
      showToast('Thank you! We will contact you soon.', 'success')
    } catch (err) {
      showToast(err.message || 'Could not submit form. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="contact-form-card">
          <div className="contact-form-header">
            <h3>Send us a message</h3>
            <p>We usually respond within 24 hours.</p>
          </div>

          <div className="contact-form-grid">
            <label className="contact-field">
              <span>Full Name *</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={updateField('name')}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </label>

            <label className="contact-field">
              <span>Phone *</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={updateField('phone')}
                placeholder="+91 98765 43210"
                required
                autoComplete="tel"
              />
            </label>

            <label className="contact-field contact-field--full">
              <span>Email *</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </label>

            <label className="contact-field contact-field--full">
              <span>City *</span>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={updateField('city')}
                placeholder="Surat, Ahmedabad..."
                required
                autoComplete="address-level2"
              />
            </label>

            <label className="contact-field contact-field--full">
              <span>Description *</span>
              <textarea
                name="description"
                value={form.description}
                onChange={updateField('description')}
                placeholder="Tell us about your solar plant and requirements..."
                rows={4}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary contact-form-submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Submit Inquiry →'}
          </button>
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  )
}
