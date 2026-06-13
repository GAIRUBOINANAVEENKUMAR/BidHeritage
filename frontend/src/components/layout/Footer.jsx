import { Link } from 'react-router-dom'
import { FiGithub, FiInstagram, FiLinkedin, FiHeart } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">◆</span>
              <span className="footer-logo-text">Bid<span className="footer-logo-hl">Heritage</span></span>
            </Link>
            <p className="footer-desc">
              Your premier destination for vintage and antique treasures. Discover history, bid with passion, and own a piece of the past.
            </p>
            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub"><FiGithub /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram"><FiInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn"><FiLinkedin /></a>
            </div>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Explore</h4>
            <Link to="/home" className="footer-link">Browse Items</Link>
            <Link to="/live-auctions" className="footer-link">Live Auctions</Link>
            <Link to="/sell" className="footer-link">Sell an Item</Link>
            <Link to="/about" className="footer-link">About Us</Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Account</h4>
            <Link to="/dashboard" className="footer-link">Dashboard</Link>
            <Link to="/profile" className="footer-link">Profile</Link>
            <Link to="/showcase" className="footer-link">My Items</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Legal</h4>
            <span className="footer-link">Terms of Service</span>
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Cookie Policy</span>
            <span className="footer-link">Disclaimer</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BidHeritage. All rights reserved.</p>
          <p className="footer-credit">
            Built with <FiHeart className="heart-icon" /> by G. Naveen Kumar
          </p>
        </div>
      </div>
    </footer>
  )
}
