import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './BidPanel.css'

export default function BidPanel({ item, bids = [], onPlaceBid, connected }) {
  const { isAuthenticated, user } = useAuth()
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentHighest = item?.currentBid || item?.basePrice || 0
  const minimumBid = currentHighest + 1
  const isActive = new Date(item?.auctionDate) > new Date()
  const isSeller = user?._id === item?.seller?._id || user?._id === item?.seller

  const handleBid = async () => {
    const amount = parseFloat(bidAmount)
    if (!amount || amount < minimumBid) {
      setError(`Minimum bid is ₹${minimumBid.toLocaleString()}`)
      return
    }
    setError('')
    setLoading(true)
    try {
      await onPlaceBid(amount)
      setBidAmount('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to place bid')
    }
    setLoading(false)
  }

  const quickBids = [100, 500, 1000]

  return (
    <div className="bid-panel" id="bid-panel">
      <div className="bid-panel-header">
        <h3 className="bid-panel-title">Place Your Bid</h3>
        {connected !== undefined && (
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {connected ? 'Live' : 'Connecting...'}
          </div>
        )}
      </div>

      <div className="bid-current">
        <span className="bid-current-label">
          {item?.currentBid > 0 ? 'Current Highest Bid' : 'Starting Price'}
        </span>
        <span className="bid-current-value">₹{currentHighest.toLocaleString()}</span>
        {item?.bidCount > 0 && (
          <span className="bid-count">{item.bidCount} bid{item.bidCount !== 1 ? 's' : ''} placed</span>
        )}
      </div>

      {isActive && isAuthenticated && !isSeller ? (
        <>
          <div className="bid-input-group">
            <span className="bid-currency">₹</span>
            <input
              type="number"
              className="bid-input"
              placeholder={`Min ₹${minimumBid.toLocaleString()}`}
              value={bidAmount}
              onChange={(e) => { setBidAmount(e.target.value); setError('') }}
              min={minimumBid}
              id="bid-amount-input"
            />
          </div>

          <div className="quick-bids">
            {quickBids.map((inc) => (
              <button
                key={inc}
                className="quick-bid-btn"
                onClick={() => setBidAmount(String(currentHighest + inc))}
              >
                +₹{inc}
              </button>
            ))}
          </div>

          {error && <p className="bid-error">{error}</p>}

          <button
            className="bid-submit"
            onClick={handleBid}
            disabled={loading}
            id="place-bid-btn"
          >
            {loading ? 'Placing Bid...' : `Place Bid${bidAmount ? ` — ₹${parseFloat(bidAmount).toLocaleString()}` : ''}`}
          </button>
        </>
      ) : (
        <div className="bid-disabled-msg">
          {!isActive && 'This auction has ended.'}
          {isActive && !isAuthenticated && 'Please login to place a bid.'}
          {isActive && isSeller && "You can't bid on your own item."}
        </div>
      )}

      {bids.length > 0 && (
        <div className="bid-history">
          <h4 className="bid-history-title">Recent Bids</h4>
          <div className="bid-history-list">
            {bids.slice(0, 5).map((bid, i) => (
              <div key={bid._id || i} className="bid-history-item">
                <div className="bid-history-user">
                  {bid.bidder?.username || 'Anonymous'}
                </div>
                <div className="bid-history-amount">₹{bid.amount?.toLocaleString()}</div>
                <div className="bid-history-time">
                  {new Date(bid.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
