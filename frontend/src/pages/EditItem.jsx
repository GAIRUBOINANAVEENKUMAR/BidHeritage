import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiImage, FiTag, FiDollarSign, FiCalendar, FiFileText, FiUpload } from 'react-icons/fi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './EditItem.css';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    category: '',
    history: '',
    basePrice: '',
    auctionDate: '',
  });
  const [currentImage, setCurrentImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/api/items/${id}`);
        const item = res.data?.item || res.data;
        /* check ownership */
        const sellerId = item.seller?._id || item.seller || item.userId;
        if (user && sellerId !== user._id) {
          navigate('/showcase');
          return;
        }
        setForm({
          name: item.name || '',
          category: item.category || '',
          history: item.history || item.description || '',
          basePrice: item.basePrice || '',
          auctionDate: item.auctionDate ? item.auctionDate.split('T')[0] : '',
        });
        setCurrentImage(item.image || '');
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to load item.' });
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('category', form.category);
      fd.append('history', form.history);
      fd.append('basePrice', form.basePrice);
      fd.append('auctionDate', form.auctionDate);
      if (imageFile) fd.append('image', imageFile);
      await axios.put(`/api/items/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg({ type: 'success', text: 'Item updated successfully!' });
      setTimeout(() => navigate('/showcase'), 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update item.' });
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `/uploads/${img}`;
  };

  const displayImg = imagePreview || getImageUrl(currentImage);

  if (loading) {
    return (
      <div className="ei-loading">
        <div className="ei-spinner" />
        <p>Loading item…</p>
      </div>
    );
  }

  return (
    <div className="edit-item-page">
      <div className="ei-container">
        <div className="ei-header">
          <h1 className="ei-title">Edit Auction Item</h1>
          <p className="ei-subtitle">Update your item details and images</p>
        </div>

        {msg.text && <div className={`ei-msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit} className="ei-form">
          <div className="ei-grid">
            {/* Left — fields */}
            <div className="ei-fields">
              <div className="ei-field">
                <label><FiTag /> Item Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="ei-field">
                <label><FiFileText /> Category</label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  <option value="Paintings">Paintings</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Watches">Watches</option>
                  <option value="Sculptures">Sculptures</option>
                  <option value="Coins">Coins</option>
                  <option value="Books">Books</option>
                  <option value="Antiques">Antiques</option>
                  <option value="Collectibles">Collectibles</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="ei-field">
                <label><FiDollarSign /> Base Price (₹)</label>
                <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange} required min="1" />
              </div>
              <div className="ei-field">
                <label><FiCalendar /> Auction End Date</label>
                <input type="date" name="auctionDate" value={form.auctionDate} onChange={handleChange} required />
              </div>
              <div className="ei-field ei-full">
                <label><FiFileText /> History / Description</label>
                <textarea name="history" value={form.history} onChange={handleChange} rows={5} placeholder="Tell the story behind this piece…" />
              </div>
            </div>

            {/* Right — image */}
            <div className="ei-image-section">
              <label><FiImage /> Item Image</label>
              <div className="ei-image-area">
                {displayImg ? (
                  <img src={displayImg} alt="Preview" className="ei-preview-img" />
                ) : (
                  <div className="ei-no-image">
                    <FiImage size={40} />
                    <span>No image</span>
                  </div>
                )}
              </div>
              <label className="ei-upload-btn">
                <FiUpload /> {imageFile ? 'Change Image' : 'Upload New Image'}
                <input type="file" accept="image/*" onChange={handleImage} hidden />
              </label>
              {imageFile && <p className="ei-file-name">{imageFile.name}</p>}
            </div>
          </div>

          <div className="ei-actions">
            <button type="button" className="ei-cancel-btn" onClick={() => navigate(-1)}>
              <FiX /> Cancel
            </button>
            <button type="submit" className="ei-save-btn" disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
