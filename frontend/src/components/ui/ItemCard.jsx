import { Link } from 'react-router-dom'
import { FiClock, FiTrendingUp, FiEye } from 'react-icons/fi'
import CountdownTimer from './CountdownTimer'
import './ItemCard.css'

export default function ItemCard({ item }) {
  const imageUrl = item.image
    ? `${import.meta.env.VITE_API_URL || ''}/uploads/${item.image}`
    : null

  const isActive = new Date(item.auctionDate) > new Date()
  const displayPrice = item.currentBid > 0 ? item.currentBid : item.basePrice

  return (
    <div className={`item-card ${isActive ? '' : 'item-expired'}`} id={`item-card-${item._id}`}>
      <div className="item-card-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="item-card-image" loading="lazy" />
        ) : (
          <div className="item-card-no-image">
            <span>No Image</span>
          </div>
        )}
        {isActive && (
          <div className="item-card-badge live-badge">
            <span className="live-dot"></span> LIVE
          </div>
        )}
        {!isActive && (
          <div className="item-card-badge ended-badge">ENDED</div>
        )}
        <div className="item-card-category">{item.category || 'General'}</div>
      </div>

      <div className="item-card-body">
        <h3 className="item-card-title">{item.name}</h3>
        <p className="item-card-history">
          {item.history?.substring(0, 80)}{item.history?.length > 80 ? '...' : ''}
        </p>

        <div className="item-card-stats">
          <div className="stat">
            <FiTrendingUp />
            <span className="stat-label">{item.currentBid > 0 ? 'Current Bid' : 'Base Price'}</span>
            <span className="stat-value">₹{displayPrice?.toLocaleString()}</span>
          </div>
          {item.bidCount > 0 && (
            <div className="stat">
              <FiEye />
              <span className="stat-label">Bids</span>
              <span className="stat-value">{item.bidCount}</span>
            </div>
          )}
        </div>

        {isActive && (
          <div className="item-card-timer">
            <FiClock />
            <CountdownTimer targetDate={item.auctionDate} compact />
          </div>
        )}

        <div className="item-card-actions">
          <Link to={`/item/${item._id}`} className="btn-view-details" id={`view-${item._id}`}>
            View Details
          </Link>
          {isActive && (
            <Link to={`/item/${item._id}`} className="btn-place-bid" id={`bid-${item._id}`}>
              Place Bid
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
