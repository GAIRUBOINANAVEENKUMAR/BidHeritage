import { Link } from 'react-router-dom'
import { FiHome, FiSearch } from 'react-icons/fi'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-bg-elements">
        <div className="floating-element e1">◆</div>
        <div className="floating-element e2">◇</div>
        <div className="floating-element e3">✦</div>
        <div className="floating-element e4">◈</div>
        <div className="floating-element e5">✧</div>
      </div>

      <div className="notfound-content fade-in">
        <h1 className="notfound-code">404</h1>
        <div className="notfound-divider"></div>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-text">
          The treasure you're looking for seems to have been lost in time.
          Let's get you back on track.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn-gold" id="notfound-home-btn">
            <FiHome /> Back to Home
          </Link>
          <Link to="/home" className="btn-outline" id="notfound-browse-btn">
            <FiSearch /> Browse Auctions
          </Link>
        </div>
      </div>
    </div>
  )
}
