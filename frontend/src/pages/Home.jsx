import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiPackage } from 'react-icons/fi';
import axios from '../api/axios';
import ItemCard from '../components/ui/ItemCard';
import './Home.css';

const categories = [
  'All',
  'Art',
  'Furniture',
  'Jewelry',
  'Collectibles',
  'Books',
  'Other',
];

export default function Home() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeCategory !== 'All') params.category = activeCategory;

      const res = await axios.get('/api/items', { params });
      setItems(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    const debounce = setTimeout(fetchItems, 350);
    return () => clearTimeout(debounce);
  }, [fetchItems]);

  return (
    <div className="home-page">
      {/* ── Header / Search ── */}
      <header className="home-header">
        <h1 className="home-title">Explore Auctions</h1>
        <div className="home-search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search vintage treasures…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* ── Category Filter ── */}
      <nav className="home-categories">
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Items ── */}
      <section className="home-items-section">
        {loading ? (
          <div className="home-loading">
            <div className="spinner" />
            <p>Loading treasures…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="home-empty">
            <div className="empty-icon">
              <FiPackage />
            </div>
            <h3>No Items Found</h3>
            <p>
              {search
                ? `No results for "${search}". Try a different search.`
                : 'There are no items in this category yet. Be the first to list one!'}
            </p>
          </div>
        ) : (
          <>
            <p className="results-info">
              Showing <strong>{items.length}</strong> item
              {items.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
            </p>
            <div className="items-grid">
              {items.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Floating Sell Button ── */}
      <Link to="/sell" className="floating-sell-btn" aria-label="Sell an item">
        <FiPlus />
        <span className="tooltip">Sell an Item</span>
      </Link>
    </div>
  );
}
