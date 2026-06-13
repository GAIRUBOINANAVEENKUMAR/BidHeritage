import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiPackage, FiEdit, FiChevronDown } from 'react-icons/fi'
import './Navbar.css'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  const navLinks = isAuthenticated
    ? [
        { to: '/home', label: 'Browse' },
        { to: '/live-auctions', label: 'Live Auctions' },
        { to: '/sell', label: 'Sell' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ]

  const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  const cleanPhoto = photo
    .replace(/\\/g, '/')
    .replace(/^uploads\//, '');
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${cleanPhoto}`;
};

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/home' : '/'} className="navbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Bid<span className="logo-highlight">Heritage</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="profile-dropdown" ref={profileRef}>
              <button
                className="profile-toggle"
                onClick={() => setProfileOpen(!profileOpen)}
                id="profile-toggle-btn"
              >
                {user?.photo ? (
                  // <img
                  //   src={`${import.meta.env.VITE_API_URL || ''}/uploads/${user.photo}`}
                  //   alt={user.username}
                  //   className="profile-avatar"
                  // />
                  <img
                  src={getPhotoUrl(user?.photo)}
                  alt={user?.username}
                  className="profile-avatar"
                  onError={(e) => {
                 console.log("Image failed:", e.target.src);
                    }}
                 />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="profile-name">{user?.username}</span>
                <FiChevronDown className={`chevron ${profileOpen ? 'rotated' : ''}`} />
              </button>

              {profileOpen && (
                <div className="profile-menu" id="profile-dropdown-menu">
                  <Link to="/dashboard" className="menu-item" onClick={() => setProfileOpen(false)}>
                    <FiGrid /> Dashboard
                  </Link>
                  <Link to="/showcase" className="menu-item" onClick={() => setProfileOpen(false)}>
                    <FiPackage /> My Items
                  </Link>
                  <Link to="/profile" className="menu-item" onClick={() => setProfileOpen(false)}>
                    <FiEdit /> Profile
                  </Link>
                  <hr className="menu-divider" />
                  <button className="menu-item menu-logout" onClick={handleLogout} id="logout-btn">
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-nav btn-login" id="login-nav-btn">Sign In</Link>
              <Link to="/register" className="btn-nav btn-register" id="register-nav-btn">Register</Link>
            </div>
          )}

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="hamburger-btn"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  )
}
