import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import API from '../api/axios'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email format'); return }
    setStep(2)
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword) { setError('New password is required'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(newPassword)) { setError('Password must contain an uppercase letter'); return }
    if (!/[0-9]/.test(newPassword)) { setError('Password must contain a number'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await API.post('/api/auth/forgot-password', { email, newPassword })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="forgot-page fade-in">
        <div className="forgot-card">
          <div className="forgot-success">
            <div className="forgot-success-icon"><FiCheckCircle /></div>
            <h2>Password Reset!</h2>
            <p>Your password has been successfully changed. You can now sign in with your new password.</p>
            <Link to="/login" className="btn-gold">Go to Login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-page fade-in">
      <div className="forgot-card">
        <div className="forgot-header">
          <Link to="/login" className="forgot-back"><FiArrowLeft /> Back to Login</Link>
          <h1 className="forgot-title">Reset <span className="gold">Password</span></h1>
          <p className="forgot-subtitle">
            {step === 1
              ? 'Enter your email address to reset your password.'
              : 'Enter your new password below.'}
          </p>
        </div>

        <div className="forgot-steps">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="forgot-form" id="forgot-email-form">
            <div className="forgot-field">
              <div className="field-icon"><FiMail /></div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                id="forgot-email-input"
              />
            </div>
            {error && <p className="forgot-error">{error}</p>}
            <button type="submit" className="btn-gold forgot-submit" id="forgot-next-btn">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="forgot-form" id="forgot-password-form">
            <div className="forgot-email-display">
              <FiMail /> <span>{email}</span>
              <button type="button" className="change-email-btn" onClick={() => setStep(1)}>Change</button>
            </div>

            <div className="forgot-field">
              <div className="field-icon"><FiLock /></div>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                id="forgot-new-password"
              />
            </div>

            <div className="forgot-field">
              <div className="field-icon"><FiLock /></div>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                id="forgot-confirm-password"
              />
            </div>

            <div className="password-rules">
              <p className={newPassword.length >= 8 ? 'rule-pass' : ''}>• At least 8 characters</p>
              <p className={/[A-Z]/.test(newPassword) ? 'rule-pass' : ''}>• One uppercase letter</p>
              <p className={/[0-9]/.test(newPassword) ? 'rule-pass' : ''}>• One number</p>
              <p className={newPassword && newPassword === confirmPassword ? 'rule-pass' : ''}>• Passwords match</p>
            </div>

            {error && <p className="forgot-error">{error}</p>}

            <button type="submit" className="btn-gold forgot-submit" disabled={loading} id="forgot-reset-btn">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
