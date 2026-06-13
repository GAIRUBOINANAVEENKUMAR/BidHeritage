import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiEdit, FiTrash2, FiPlus, FiPackage, FiSearch, FiClock, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Showcase.css';

const Showcase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items/user/my-items');
      setItems(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/items/${deleteModal.id}`);
      setItems(prev => prev.filter(i => i._id !== deleteModal.id));
      setDeleteModal({ open: false, id: null, name: '' });
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusClass = (item) => {
    if (item.status === 'sold' || item.isSold) return 'sold';
    const now = new Date();
    const end = new Date(item.auctionDate || item.endDate);
    if (end < now) return 'expired';
    return 'active';
  };

  const getStatusLabel = (item) => {
    const cls = getStatusClass(item);
    return cls.charAt(0).toUpperCase() + cls.slice(1);
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/300x220/1a1a2e/d4a853?text=No+Image';
    if (img.startsWith('http')) return img;
    return `/uploads/${img}`;
  };

  const filtered = items.filter(i =>
    i.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="sc-loading">
        <div className="sc-spinner" />
        <p>Loading your showcase…</p>
      </div>
    );
  }

  return (
    <div className="showcase-page">
      {/* Header */}
      <div className="sc-header">
        <div>
          <h1 className="sc-title"><FiPackage /> My Showcase</h1>
          <p className="sc-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your collection</p>
        </div>
        <Link to="/sell" className="sc-add-btn"><FiPlus /> List New Item</Link>
      </div>

      {/* Toolbar */}
      <div className="sc-toolbar">
        <div className="sc-search-wrap">
          <FiSearch />
          <input
            type="text"
            placeholder="Search your items…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="sc-view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grid view">
            <FiGrid />
          </button>
          <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} title="Table view">
            <FiList />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="sc-empty">
          <FiPackage size={56} />
          <h3>No items yet</h3>
          <p>Start selling! List your first vintage piece and join the auction.</p>
          <Link to="/sell" className="sc-cta-btn"><FiPlus /> List Your First Item</Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="sc-grid">
          {filtered.map(item => (
            <div key={item._id} className="sc-card">
              <div className="sc-card-img-wrap" onClick={() => navigate(`/item/${item._id}`)}>
                <img src={getImageUrl(item.image)} alt={item.name} />
                <span className={`sc-status-badge ${getStatusClass(item)}`}>
                  {getStatusLabel(item)}
                </span>
              </div>
              <div className="sc-card-body">
                <h4 className="sc-card-title">{item.name}</h4>
                <div className="sc-card-prices">
                  <div>
                    <span className="sc-price-label">Base Price</span>
                    <span className="sc-price-val">₹{item.basePrice?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="sc-price-label">Current Bid</span>
                    <span className="sc-price-val sc-gold">₹{(item.currentBid || item.basePrice)?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="sc-card-date">
                  <FiClock /> {new Date(item.auctionDate || item.createdAt).toLocaleDateString()}
                </div>
                <div className="sc-card-actions">
                  <button className="sc-action-edit" onClick={() => navigate(`/edit/${item._id}`)}>
                    <FiEdit /> Edit
                  </button>
                  <button className="sc-action-delete" onClick={() => setDeleteModal({ open: true, id: item._id, name: item.name })}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="sc-table-wrap">
          <table className="sc-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Base Price</th>
                <th>Current Bid</th>
                <th>Status</th>
                <th>Auction Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id}>
                  <td>
                    <img src={getImageUrl(item.image)} alt={item.name} className="sc-table-img" />
                  </td>
                  <td className="sc-table-name" onClick={() => navigate(`/item/${item._id}`)}>{item.name}</td>
                  <td>₹{item.basePrice?.toLocaleString()}</td>
                  <td className="sc-gold">₹{(item.currentBid || item.basePrice)?.toLocaleString()}</td>
                  <td><span className={`sc-status-badge ${getStatusClass(item)}`}>{getStatusLabel(item)}</span></td>
                  <td>{new Date(item.auctionDate || item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="sc-table-actions">
                      <button className="sc-action-edit" onClick={() => navigate(`/edit/${item._id}`)}><FiEdit /></button>
                      <button className="sc-action-delete" onClick={() => setDeleteModal({ open: true, id: item._id, name: item.name })}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="sc-modal-overlay" onClick={() => !deleting && setDeleteModal({ open: false, id: null, name: '' })}>
          <div className="sc-modal" onClick={e => e.stopPropagation()}>
            <div className="sc-modal-icon"><FiAlertTriangle /></div>
            <h3>Delete Item?</h3>
            <p>Are you sure you want to delete <strong>"{deleteModal.name}"</strong>? This action cannot be undone.</p>
            <div className="sc-modal-actions">
              <button className="sc-modal-cancel" onClick={() => setDeleteModal({ open: false, id: null, name: '' })} disabled={deleting}>
                Cancel
              </button>
              <button className="sc-modal-confirm" onClick={handleDelete} disabled={deleting}>
                <FiTrash2 /> {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase;
