import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiZap,
  FiClock,
  FiX,
  FiEye,
} from 'react-icons/fi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './LiveAuction.css';

/* ── Safe socket import ── */
let useSocket = null;
try {
  useSocket = require('../hooks/useSocket').default;
} catch {
  // Socket hook not available — will run without real-time updates
}

/* ===================================================================
   Countdown helper
   =================================================================== */
function getTimeLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDate));

  useEffect(() => {
    const tick = setInterval(() => {
      const t = getTimeLeft(endDate);
      setTimeLeft(t);
      if (!t) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [endDate]);

  if (!timeLeft) {
    return <div className="auction-countdown"><span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>Auction Ended</span></div>;
  }

  return (
    <div className="auction-countdown">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hrs' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
      ].map(({ value, label }) => (
        <div className="countdown-unit" key={label}>
          <div className="countdown-value">{String(value).padStart(2, '0')}</div>
          <div className="countdown-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ===================================================================
   AuctionCard
   =================================================================== */
function AuctionCard({ item, onBid }) {
  const currentBid =
    item.currentBid || item.highestBid || item.basePrice || 0;
  const bidCount = item.bidCount ?? item.bids?.length ?? 0;
  const endDate = item.auctionEndDate || item.auctionDate || item.endDate;
  // const imageUrl = item.image?.startsWith('http')
  //   ? item.image
  //   : item.image
  //   ? `/${item.image}`
  //   : '';
  const imageUrl = item.image
  ? `${import.meta.env.VITE_API_URL}/${item.image.replace(/\\/g, '/')}`
  : '';
  console.log("Live Auction Image:", imageUrl);

  return (
    <div className="auction-card">
      {/* Image */}
      <div className="auction-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <div className="auction-no-image"><FiZap /></div>
        )}
        <div className="card-live-tag">
          <span className="card-live-dot" />
          LIVE
        </div>
      </div>

      {/* Body */}
      <div className="auction-card-body">
        <h3 className="auction-card-name" title={item.name}>
          {item.name}
        </h3>

        <div className="auction-card-stats">
          <div className="auction-price">
            <span className="auction-price-label">Current Bid</span>
            <span className="auction-price-value">
              ₹{Number(currentBid).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="auction-bid-count">
            <strong>{bidCount}</strong> bid{bidCount !== 1 ? 's' : ''}
          </div>
        </div>

        {endDate && <CountdownTimer endDate={endDate} />}

        <div className="auction-card-actions">
          <button className="auction-btn auction-btn-bid" onClick={() => onBid(item)}>
            <FiZap /> Place Bid
          </button>
           {/* <Link to={`/item/${item._id}`} className="btn-view-details" id={`view-${item._id}`}>
            View Details
          </Link> */}
          <Link
            to={`/item/${item._id}`}
            className="auction-btn auction-btn-details"
            id={`view-${item._id}`}
          >
            <FiEye /> Details
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   LiveAuction Page
   =================================================================== */
export default function LiveAuction() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bid modal state
  const [bidItem, setBidItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  /* ── Fetch active items ── */
  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get('/api/items', {
        params: { status: 'active' },
      });
      const data = res.data?.items || res.data || [];
      // Filter to only active auctions on client side as well
      const now = new Date();
      const active = data.filter((item) => {
        const end = new Date(
          item.auctionEndDate || item.auctionDate || item.endDate
        );
        return end > now;
      });
      setItems(active);
    } catch (err) {
      console.error('Failed to fetch live auctions:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ── Socket.IO real-time updates ── */
  useEffect(() => {
    if (!useSocket) return;
    try {
      const socket = useSocket();
      if (socket) {
        socket.on('bidPlaced', (data) => {
          setItems((prev) =>
            prev.map((item) => {
              if ((item._id || item.id) === data.itemId) {
                return {
                  ...item,
                  currentBid: data.amount,
                  highestBid: data.amount,
                  bidCount: (item.bidCount || 0) + 1,
                };
              }
              return item;
            })
          );
        });
        return () => socket.off('bidPlaced');
      }
    } catch {
      // Socket not available — silently ignore
    }
  }, []);

  /* ── Bid handlers ── */
  const openBidModal = (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBidItem(item);
    setBidAmount('');
    setBidError('');
  };

  const closeBidModal = () => {
    setBidItem(null);
    setBidAmount('');
    setBidError('');
  };

  const submitBid = async () => {
    if (!bidAmount || Number(bidAmount) <= 0) {
      setBidError('Enter a valid bid amount');
      return;
    }

    const currentBid =
      bidItem.currentBid || bidItem.highestBid || bidItem.basePrice || 0;
    if (Number(bidAmount) <= Number(currentBid)) {
      setBidError(`Bid must be higher than ₹${Number(currentBid).toLocaleString('en-IN')}`);
      return;
    }

    setBidLoading(true);
    try {
      // await axios.post(
      //   `/api/items/${bidItem._id || bidItem.id}/bid`,
      //   { amount: Number(bidAmount) },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      await axios.post('/api/bids',
        {
          itemId: bidItem._id || bidItem.id,
          amount: Number(bidAmount)
        },{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          (item._id || item.id) === (bidItem._id || bidItem.id)
            ? {
                ...item,
                currentBid: Number(bidAmount),
                highestBid: Number(bidAmount),
                bidCount: (item.bidCount || 0) + 1,
              }
            : item
        )
      );
      closeBidModal();
    } catch (err) {
      setBidError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to place bid'
      );
    } finally {
      setBidLoading(false);
    }
  };

  return (
    <div className="live-auction-page">
      {/* ── Header ── */}
      <header className="live-header">
        <div className="live-header-left">
          <h1>Live Auctions</h1>
          <p>Bid in real-time on exclusive vintage treasures</p>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          LIVE NOW
        </div>
      </header>

      {/* ── Grid ── */}
      <section className="live-grid-section">
        {loading ? (
          <div className="live-loading">
            <div className="live-spinner" />
            <p>Loading live auctions…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="live-empty">
            <div className="live-empty-icon">
              <FiClock />
            </div>
            <h3>No Live Auctions Right Now</h3>
            <p>Check back soon — new items go live every day!</p>
          </div>
        ) : (
          <div className="live-grid">
            {items.map((item) => (
              <AuctionCard
                key={item._id || item.id}
                item={item}
                onBid={openBidModal}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Bid Modal ── */}
      {bidItem && (
        <div className="bid-modal-overlay" onClick={closeBidModal}>
          <div
            className="bid-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="bid-modal-close" onClick={closeBidModal}>
              <FiX />
            </button>
            <h3>Place Your Bid</h3>
            <p className="bid-item-name">{bidItem.name}</p>
            <p className="bid-current">
              Current bid:{' '}
              <strong>
                ₹
                {Number(
                  bidItem.currentBid ||
                    bidItem.highestBid ||
                    bidItem.basePrice ||
                    0
                ).toLocaleString('en-IN')}
              </strong>
            </p>
            {bidError && <p className="bid-modal-error">{bidError}</p>}
            <input
              type="number"
              placeholder="Enter your bid amount (₹)"
              value={bidAmount}
              onChange={(e) => {
                setBidAmount(e.target.value);
                if (bidError) setBidError('');
              }}
              min="1"
              autoFocus
            />
            <div className="bid-modal-actions">
              <button
                className="auction-btn auction-btn-bid"
                onClick={submitBid}
                disabled={bidLoading}
                style={{ flex: 1 }}
              >
                {bidLoading ? 'Placing…' : 'Confirm Bid'}
              </button>
              <button
                className="auction-btn auction-btn-details"
                onClick={closeBidModal}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
