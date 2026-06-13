import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiTrendingUp, FiAward, FiDollarSign, FiPlus, FiSearch, FiUser, FiClock, FiArrowRight } from 'react-icons/fi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ itemsListed: 0, activeBids: 0, itemsWon: 0, totalSpent: 0 });
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, bidsRes] = await Promise.all([
          axios.get('/api/users/dashboard'),
          axios.get('/api/bids/my-bids'),
        ]);
        setStats(statsRes.data || {});
        setMyBids(bidsRes.data?.bids || bidsRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { label: 'Items Listed', value: stats.itemsListed ?? 0, icon: <FiPackage />, color: '#d4a853' },
    { label: 'Active Bids', value: stats.activeBids ?? 0, icon: <FiTrendingUp />, color: '#3498db' },
    { label: 'Items Won', value: stats.itemsWon ?? 0, icon: <FiAward />, color: '#2ecc71' },
    { label: 'Total Spent', value: `₹${(stats.totalSpent ?? 0).toLocaleString()}`, icon: <FiDollarSign />, color: '#e74c3c' },
  ];

  const quickActions = [
    { label: 'List New Item', icon: <FiPlus />, to: '/sell' },
    { label: 'Browse Auctions', icon: <FiSearch />, to: '/auctions' },
    { label: 'My Profile', icon: <FiUser />, to: '/profile' },
  ];

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/80x80/1a1a2e/d4a853?text=Item';
    if (img.startsWith('http')) return img;
    return `/uploads/${img}`;
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Welcome back, <span>{user?.username || 'Collector'}</span></h1>
          <p className="dash-subtitle">Here's your auction activity at a glance</p>
        </div>
        <div className="dash-header-actions">
          {quickActions.map(a => (
            <Link key={a.to} to={a.to} className="dash-quick-btn">
              {a.icon} {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dash-stats-grid">
        {statCards.map((c, i) => (
          <div key={i} className="dash-stat-card" style={{ '--accent': c.color }}>
            <div className="dash-stat-icon" style={{ background: `${c.color}15`, color: c.color }}>
              {c.icon}
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-value">{c.value}</span>
              <span className="dash-stat-label">{c.label}</span>
            </div>
            <div className="dash-stat-glow" style={{ background: c.color }} />
          </div>
        ))}
      </div>

      {/* My Active Bids */}
      <section className="dash-bids-section">
        <div className="dash-section-header">
          <h2><FiTrendingUp /> My Active Bids</h2>
          <Link to="/my-bids" className="dash-see-all">See All <FiArrowRight /></Link>
        </div>

        {myBids.length === 0 ? (
          <div className="dash-empty">
            <FiSearch size={48} />
            <h3>No active bids</h3>
            <p>Start exploring auctions and place your first bid!</p>
            <Link to="/auctions" className="dash-cta-btn">Browse Auctions</Link>
          </div>
        ) : (
          <div className="dash-bids-grid">
            {myBids.slice(0, 6).map((bid, i) => {
              const item = bid.item || bid;
              return (
                <div key={bid._id || i} className="dash-bid-card" onClick={() => navigate(`/item/${item._id || bid.itemId}`)}>
                  <div className="dash-bid-img-wrap">
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  </div>
                  <div className="dash-bid-info">
                    <h4>{item.name || 'Auction Item'}</h4>
                    <div className="dash-bid-details">
                      <div className="dash-bid-detail">
                        <span className="dash-bid-label">Your Bid</span>
                        <span className="dash-bid-value">₹{bid.amount?.toLocaleString()}</span>
                      </div>
                      <div className="dash-bid-detail">
                        <span className="dash-bid-label">Highest Bid</span>
                        <span className="dash-bid-value dash-bid-highest">₹{(item.currentBid || bid.amount)?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className={`dash-bid-status ${bid.amount >= (item.currentBid || 0) ? 'winning' : 'outbid'}`}>
                      {bid.amount >= (item.currentBid || 0) ? '🏆 Winning' : '⚠️ Outbid'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
