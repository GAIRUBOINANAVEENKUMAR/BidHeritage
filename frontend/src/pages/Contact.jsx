import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi'
import API from '../api/axios'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.message.trim()) errs.message = 'Message is required'
    else if (form.message.trim().split(/\s+/).length < 5) errs.message = 'Message must be at least 5 words'
    return errs
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      await API.post('/api/contact', form)
      setSuccess(true)
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to send message. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="contact-page fade-in">
      <div className="contact-hero">
        <h1 className="contact-title">Get In <span className="gold">Touch</span></h1>
        <p className="contact-subtitle">Have questions about BidHeritage? We'd love to hear from you.</p>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <h2 className="contact-info-heading">Contact Information</h2>
          <p className="contact-info-desc">Reach out through any of these channels and we'll respond within 24 hours.</p>

          <div className="contact-info-cards">
            <div className="info-card">
              <div className="info-card-icon"><FiMail /></div>
              <div>
                <h4>Email</h4>
                <p>gairunaveen@gmail.com</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-icon"><FiPhone /></div>
              <div>
                <h4>Phone</h4>
                <p>+91 90591 xxxxx</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-icon"><FiMapPin /></div>
              <div>
                <h4>Address</h4>
                <p>Guntur, Andhra Pradesh, India</p>
              </div>
            </div>
          </div>

          <div className="contact-socials">
            <h4>Follow Us</h4>
            <div className="contact-social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FiGithub /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram /></a>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          {success ? (
            <div className="contact-success">
              <div className="success-icon-wrap"><FiCheckCircle /></div>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you shortly.</p>
              <button className="btn-gold" onClick={() => setSuccess(false)}>Send Another Message</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} id="contact-form">
              <h2 className="form-heading">Send a Message</h2>

              <div className="contact-field">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  type="text" id="contact-name" name="name"
                  placeholder="Enter your name"
                  value={form.name} onChange={handleChange}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  type="email" id="contact-email" name="email"
                  placeholder="Enter your email"
                  value={form.email} onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message" name="message" rows="5"
                  placeholder="Write your message here..."
                  value={form.message} onChange={handleChange}
                  className={errors.message ? 'input-error' : ''}
                />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>

              {errors.submit && <div className="submit-error">{errors.submit}</div>}

              <button type="submit" className="btn-gold contact-submit" disabled={loading} id="contact-submit-btn">
                {loading ? 'Sending...' : <><FiSend /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
