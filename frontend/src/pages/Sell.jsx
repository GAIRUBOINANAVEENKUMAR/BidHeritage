import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import {
  FiUploadCloud,
  FiX,
  FiCheckCircle,
} from 'react-icons/fi';
import './Sell.css';

const categoryOptions = [
  'Art',
  'Furniture',
  'Jewelry',
  'Collectibles',
  'Books',
  'Other',
];

export default function Sell() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    basePrice: '',
    auctionEndDate: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Redirect if not logged in
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleFileInput = (e) => {
    handleImageSelect(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageSelect(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ---------- Validation ---------- */
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Item name is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.description.trim())
      errs.description = 'Description is required';
    else if (formData.description.trim().split(/\s+/).length < 3)
      errs.description = 'Minimum 3 words required';
    if (!formData.basePrice) errs.basePrice = 'Base price is required';
    else if (Number(formData.basePrice) <= 0)
      errs.basePrice = 'Price must be greater than 0';
    if (!formData.auctionEndDate)
      errs.auctionEndDate = 'End date is required';
    else if (new Date(formData.auctionEndDate) <= new Date())
      errs.auctionEndDate = 'End date must be in the future';
    if (!image) errs.image = 'Image is required';
    return errs;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('category', formData.category);
      body.append('description', formData.description);
      body.append('basePrice', formData.basePrice);
      body.append('auctionEndDate', formData.auctionEndDate);
      if (image) body.append('image', image);

      await axios.post('/api/items', body, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/showcase');
      }, 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to list item. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Min date for datetime-local ---------- */
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="sell-page">
      {showToast && (
        <div className="sell-toast">
          <FiCheckCircle className="toast-icon" />
          Item listed successfully!
        </div>
      )}

      <div className="sell-card">
        <div className="sell-header">
          <h1>List Your Treasure</h1>
          <p>Share a piece of history with the world</p>
        </div>

        <form className="sell-form" onSubmit={handleSubmit} noValidate>
          {apiError && <div className="sell-error">{apiError}</div>}

          {/* Name */}
          <div className={`sell-form-group ${errors.name ? 'has-error' : ''}`}>
            <label>
              Item Name <span className="required">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Victorian Era Pocket Watch"
            />
            {errors.name && (
              <span className="sell-field-error">{errors.name}</span>
            )}
          </div>

          {/* Category + Price row */}
          <div className="sell-form-row">
            <div className={`sell-form-group ${errors.category ? 'has-error' : ''}`}>
              <label>
                Category <span className="required">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="sell-field-error">{errors.category}</span>
              )}
            </div>

            <div className={`sell-form-group ${errors.basePrice ? 'has-error' : ''}`}>
              <label>
                Base Price (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                placeholder="5000"
                min="1"
              />
              {errors.basePrice && (
                <span className="sell-field-error">{errors.basePrice}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className={`sell-form-group ${errors.description ? 'has-error' : ''}`}>
            <label>
              History / Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell the story behind this item. Its age, origin, condition…"
              rows={4}
            />
            {errors.description && (
              <span className="sell-field-error">{errors.description}</span>
            )}
          </div>

          {/* Auction End Date */}
          <div className={`sell-form-group ${errors.auctionEndDate ? 'has-error' : ''}`}>
            <label>
              Auction End Date <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              name="auctionEndDate"
              value={formData.auctionEndDate}
              onChange={handleChange}
              min={minDateTime}
            />
            {errors.auctionEndDate && (
              <span className="sell-field-error">{errors.auctionEndDate}</span>
            )}
          </div>

          {/* Image Upload */}
          <div className={`sell-form-group ${errors.image ? 'has-error' : ''}`}>
            <label>
              Item Image <span className="required">*</span>
            </label>
            <label
              className={`sell-upload-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileInput}
              />
              {imagePreview ? (
                <div className="upload-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-preview"
                    onClick={(e) => {
                      e.preventDefault();
                      removeImage();
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <FiUploadCloud />
                  </div>
                  <h4>Drag & drop or click to upload</h4>
                  <p>JPG, PNG, WebP — max 10 MB</p>
                </>
              )}
            </label>
            {errors.image && (
              <span className="sell-field-error">{errors.image}</span>
            )}
          </div>

          <button type="submit" className="sell-btn" disabled={loading}>
            {loading ? 'Listing Item…' : 'List Item for Auction'}
          </button>
        </form>
      </div>
    </div>
  );
}
