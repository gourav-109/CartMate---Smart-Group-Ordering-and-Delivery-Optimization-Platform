import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Zap, AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot connect to backend server. Make sure the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail) => {
    setLoading(true);
    setError('');
    try {
      await login(presetEmail, 'password123');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please ensure the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto 0 auto', width: '100%' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.55rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.4rem', color: 'var(--blinkit-yellow)' }}>
          🛒 Login to Cartmate
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Combine Blinkit quick-commerce orders & split handling fees with NIT Jamshedpur neighbors!
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aarav@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.8rem', fontSize: '0.95rem' }}>
            <LogIn size={18} /> {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center', fontWeight: '700' }}>
            ⚡ 1-Click NIT Jamshedpur Demo Logins:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button type="button" onClick={() => handleQuickLogin('aarav@example.com')} className="btn-secondary" style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'center' }}>
              👤 Aarav (Hostel 1)
            </button>
            <button type="button" onClick={() => handleQuickLogin('priya@example.com')} className="btn-secondary" style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'center' }}>
              👤 Priya (Hostel 4)
            </button>
            <button type="button" onClick={() => handleQuickLogin('rohan@example.com')} className="btn-secondary" style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'center' }}>
              👤 Rohan (Outer Circle)
            </button>
            <button type="button" onClick={() => handleQuickLogin('ananya@example.com')} className="btn-secondary" style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem', justifyContent: 'center' }}>
              👤 Ananya (Adityapur)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--blinkit-yellow)', fontWeight: '700' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
