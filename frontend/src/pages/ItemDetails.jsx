import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiClock, FiUser, FiTag, FiDollarSign, FiEdit, FiArrowLeft, FiTrendingUp, FiCalendar, FiInfo, FiLayers } from 'react-icons/fi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ItemDetails.css';

/* ── tiny countdown renderer ── */
const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTimeLeft({ ended: true }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (timeLeft.ended) return <span className="countdown-ended">Auction Ended</span>;
  return (
    <div className="countdown-timer">
      {['days', 'hours', 'minutes', 'seconds'].map(u => (
        <div key={u} className="countdown-unit">
          <span className="countdown-value">{String(timeLeft[u] ?? 0).padStart(2, '0')}</span>
          <span className="countdown-label">{u}</span>
        </div>
      ))}
    </div>
  );
};

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const imgRef = useRef(null);

  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidMsg, setBidMsg] = useState({ type: '', text: '' });
  const [zoomStyle, setZoomStyle] = useState({});

  /* fetch item + bids */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemRes, bidsRes] = await Promise.all([
          axios.get(`/api/items/${id}`),
          axios.get(`/api/bids/item/${id}`),
        ]);
        setItem(itemRes.data?.item || itemRes.data);
        setBids(bidsRes.data?.bids || bidsRes.data || []);
      } catch (err) {
        setError('Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /* Socket.IO real-time bid updates */
  useEffect(() => {
    let socket;
    try {
      const io = require('socket.io-client');
      socket = io(undefined, { transports: ['websocket'] });
      socket.emit('joinItem', id);
      socket.on('newBid', (data) => {
        setBids(prev => [data, ...prev]);
        setItem(prev => prev ? { ...prev, currentBid: data.amount } : prev);
      });
    } catch {
      /* socket.io not available – graceful fallback */
    }
    return () => { if (socket) socket.disconnect(); };
  }, [id]);

  /* image zoom handler */
  const handleMouseMove = (e) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.8)' });
  };
  const handleMouseLeave = () => setZoomStyle({});

  /* place bid */
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setBidLoading(true);
    setBidMsg({ type: '', text: '' });
    try {
      await axios.post('/api/bids', { itemId: id, amount: Number(bidAmount) });
      setBidMsg({ type: 'success', text: 'Bid placed successfully!' });
      setBidAmount('');
      const bidsRes = await axios.get(`/api/bids/item/${id}`);
      setBids(bidsRes.data?.bids || bidsRes.data || []);
      const itemRes = await axios.get(`/api/items/${id}`);
      setItem(itemRes.data?.item || itemRes.data);
    } catch (err) {
      setBidMsg({ type: 'error', text: err.response?.data?.message || 'Failed to place bid.' });
    } finally {
      setBidLoading(false);
    }
  };

  const isOwner = user && item && (item.seller?._id === user._id || item.seller === user._id || item.userId === user._id);
  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : item?.basePrice || 0;
  const minBid = highestBid + 1;


const getImageUrl = (img) => {
  if (!img) {
    return 'https://placehold.co/600x500/1a1a2e/d4a853?text=No+Image';
  }

  const cleanPath = img.replace(/\\/g, '/');

  return `http://localhost:5000/${cleanPath}`;
  //  return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
};

  if (loading) {
    return (
      <div className="id-loading-screen">
        <div className="id-spinner" />
        <p>Loading masterpiece…</p>
      </div>
    );
  }
  if (error || !item) {
    return (
      <div className="id-error-screen">
        <h2>Oops!</h2>
        <p>{error || 'Item not found.'}</p>
        <Link to="/auctions" className="id-back-btn"><FiArrowLeft /> Browse Auctions</Link>
      </div>
    );
  }

  return (
    <div className="item-details-page">
      {/* breadcrumb */}
      {/* <nav className="id-breadcrumb">
        <Link to="/">Home</Link> <span>/</span>
        <Link to="/auctions">Auctions</Link> <span>/</span>
        <span className="id-current">{item.name}</span>
      </nav> */}

      <div className="id-main-grid">
        {/* LEFT — Image */}
        <div className="id-image-section">
          <div className="id-image-wrapper" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <img ref={imgRef} src={getImageUrl(item.image)} alt={item.name} style={zoomStyle} className="id-main-image" />
            <div className="id-image-badge"><FiClock /> Live Auction</div>
          </div>
          {/* countdown */}
          <div className="id-countdown-box">
            <h4><FiClock /> Time Remaining</h4>
            <CountdownTimer endDate={item.auctionDate || item.endDate} />
          </div>
        </div>

        {/* RIGHT — Info + Bid */}
        <div className="id-info-section">
          <div className="id-category-badge"><FiTag /> {item.category || 'Vintage'}</div>
          <h1 className="id-title">{item.name}</h1>

          <div className="id-meta-row">
            <div className="id-meta-item"><FiUser /> <span>Seller:</span> {item.seller?.username || item.sellerName || 'Unknown'}</div>
            <div className="id-meta-item"><FiCalendar /> <span>Listed:</span> {new Date(item.createdAt || item.auctionDate).toLocaleDateString()}</div>
          </div>

          <div className="id-price-row">
            <div className="id-price-card">
              <span className="id-price-label">Base Price</span>
              <span className="id-price-value"><FiDollarSign />₹{item.basePrice?.toLocaleString()}</span>
            </div>
            <div className="id-price-card id-price-highlight">
              <span className="id-price-label">Current Bid</span>
              <span className="id-price-value"><FiTrendingUp />₹{(item.currentBid || item.basePrice)?.toLocaleString()}</span>
            </div>
          </div>

          <div className="id-description-box">
            <h3><FiInfo /> History & Description</h3>
            <p>{item.history || item.description || 'No description available for this item.'}</p>
          </div>

          {/* Bid Panel or Edit */}
          {isOwner ? (
            <button className="id-edit-btn" onClick={() => navigate(`/edit/${item._id}`)}>
              <FiEdit /> Edit Item
            </button>
          ) : (
            <div className="id-bid-panel">
              <h3><FiLayers /> Place Your Bid</h3>
              <p className="id-min-bid">Minimum bid: ₹{minBid.toLocaleString()}</p>
              <form onSubmit={handlePlaceBid} className="id-bid-form">
                <div className="id-bid-input-wrap">
                  <span className="id-currency">₹</span>
                  <input
                    type="number"
                    min={minBid}
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    placeholder={`${minBid} or more`}
                    required
                  />
                </div>
                <button type="submit" disabled={bidLoading} className="id-bid-submit">
                  {bidLoading ? 'Placing…' : 'Place Bid'}
                </button>
              </form>
              {bidMsg.text && <div className={`id-bid-msg ${bidMsg.type}`}>{bidMsg.text}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      <section className="id-bid-history">
        <h2><FiTrendingUp /> Bid History</h2>
        {bids.length === 0 ? (
          <div className="id-no-bids">
            <p>No bids yet. Be the first to bid on this masterpiece!</p>
          </div>
        ) : (
          <div className="id-table-wrap">
            <table className="id-bids-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bidder</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b, i) => (
                  <tr key={b._id || i} className={i === 0 ? 'id-top-bid' : ''}>
                    <td>{i + 1}</td>
                    <td><FiUser /> {b.bidder?.username || b.user?.username || 'Anonymous'}</td>
                    <td className="id-bid-amount">₹{b.amount?.toLocaleString()}</td>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ItemDetails;
