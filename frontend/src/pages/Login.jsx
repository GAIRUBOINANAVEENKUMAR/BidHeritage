import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/home');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative elements */}
      <div className="login-decor login-decor-1" />
      <div className="login-decor login-decor-2" />

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">BidHeritage</h1>
          <p>Welcome back, collector</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <label htmlFor="email">Email Address</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <label htmlFor="password">Password</label>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <span>
            Don&apos;t have an account?{' '}
            <Link to="/register">Create Account</Link>
          </span>
          <div className="login-divider">
            <span>or</span>
          </div>
          <span>
            <Link to="/forgot-password">Forgot your password?</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
