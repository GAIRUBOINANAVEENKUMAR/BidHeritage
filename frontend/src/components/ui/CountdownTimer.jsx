import { useState, useEffect } from 'react'
import './CountdownTimer.css'

export default function CountdownTimer({ targetDate, compact = false, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const diff = new Date(targetDate) - new Date()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calculateTimeLeft()
      setTimeLeft(tl)
      if (!tl) {
        clearInterval(timer)
        onExpired?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return <span className="countdown-expired">Auction Ended</span>
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 1

  if (compact) {
    return (
      <span className={`countdown-compact ${isUrgent ? 'urgent' : ''}`}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    )
  }

  return (
    <div className={`countdown ${isUrgent ? 'countdown-urgent' : ''}`}>
      <div className="countdown-unit">
        <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="countdown-label">Days</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="countdown-label">Hours</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="countdown-label">Mins</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-value countdown-seconds">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="countdown-label">Secs</span>
      </div>
    </div>
  )
}
