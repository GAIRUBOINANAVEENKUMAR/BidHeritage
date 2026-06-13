import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import {
  FiUser,
  FiMapPin,
  FiLock,
  FiCamera,
} from 'react-icons/fi';
import './Register.css';

/* ---------- Country → State map ---------- */
const countryStates = {
  India: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Rajasthan'],
  USA: ['California', 'New York', 'Texas', 'Florida', 'Illinois'],
  UK: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'],
};

const initialForm = {
  username: '',
  email: '',
  phone: '',
  dob: '',
  country: '',
  state: '',
  district: '',
  address: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset state when country changes
      if (name === 'country') next.state = '';
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  /* ---------- Validation ---------- */
  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Invalid email format';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone))
      errs.phone = 'Invalid phone number';
    if (!formData.dob) errs.dob = 'Date of birth is required';
    if (!formData.country) errs.country = 'Country is required';
    if (!formData.state) errs.state = 'State is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8)
      errs.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(formData.password))
      errs.password = 'Must include an uppercase letter';
    else if (!/\d/.test(formData.password))
      errs.password = 'Must include a number';
    if (!formData.confirmPassword)
      errs.confirmPassword = 'Confirm your password';
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
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
      Object.entries(formData).forEach(([key, val]) => {
        if (key !== 'confirmPassword') body.append(key, val);
      });
      if (photo) body.append('photo', photo);

      const res = await axios.post('/api/auth/register', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Auto-login after registration
      const { token, user } = res.data;
      if (token) {
        await login(formData.email, formData.password);
      }
      navigate('/home');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stateOptions = formData.country ? countryStates[formData.country] || [] : [];

  /* ---------- Field helper ---------- */
  const renderField = (name, label, type = 'text', extra = {}) => (
    <div className={`reg-form-group ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}>
        {label} <span className="required">*</span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        {...extra}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1>Join BidHeritage</h1>
          <p>Create your account and start collecting</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {apiError && <div className="register-error">{apiError}</div>}

          {/* ── Personal Info ── */}
          <div className="form-section-title">
            <FiUser /> Personal Information
          </div>
          <div className="form-row">
            {renderField('username', 'Username')}
            {renderField('email', 'Email', 'email')}
          </div>
          <div className="form-row">
            {renderField('phone', 'Phone Number', 'tel', {
              placeholder: '+91 9876543210',
            })}
            {renderField('dob', 'Date of Birth', 'date')}
          </div>

          {/* ── Address ── */}
          <div className="form-section-title">
            <FiMapPin /> Address
          </div>
          <div className="form-row">
            <div className={`reg-form-group ${errors.country ? 'has-error' : ''}`}>
              <label htmlFor="country">
                Country <span className="required">*</span>
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Select Country</option>
                {Object.keys(countryStates).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.country && (
                <span className="field-error">{errors.country}</span>
              )}
            </div>

            <div className={`reg-form-group ${errors.state ? 'has-error' : ''}`}>
              <label htmlFor="state">
                State <span className="required">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!formData.country}
              >
                <option value="">Select State</option>
                {stateOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <span className="field-error">{errors.state}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            {renderField('district', 'District')}
          </div>

          <div className="form-row single">
            <div className={`reg-form-group ${errors.address ? 'has-error' : ''}`}>
              <label htmlFor="address">
                Full Address <span className="required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Street, City, Pin Code…"
              />
              {errors.address && (
                <span className="field-error">{errors.address}</span>
              )}
            </div>
          </div>

          {/* ── Photo ── */}
          <div className="form-section-title">
            <FiCamera /> Profile Photo
          </div>
          <label className="photo-upload-area" htmlFor="photo-input">
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              onChange={handlePhoto}
            />
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" />
              ) : (
                <span className="photo-preview-placeholder">
                  <FiCamera />
                </span>
              )}
            </div>
            <div className="photo-upload-text">
              <h4>Upload Photo</h4>
              <p>JPG, PNG up to 5 MB</p>
            </div>
          </label>

          {/* ── Security ── */}
          <div className="form-section-title">
            <FiLock /> Security
          </div>
          <div className="form-row">
            {renderField('password', 'Password', 'password', {
              autoComplete: 'new-password',
            })}
            {renderField('confirmPassword', 'Confirm Password', 'password', {
              autoComplete: 'new-password',
            })}
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          Already have an account?{' '}
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
