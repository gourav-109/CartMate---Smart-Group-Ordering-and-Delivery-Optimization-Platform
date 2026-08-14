import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, MapPin, AlertCircle } from 'lucide-react';

export const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localityName, setLocalityName] = useState('Koramangala 4th Block, Bengaluru');
  const [presetCoords, setPresetCoords] = useState('77.6245,12.9352');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const [lngStr, latStr] = presetCoords.split(',');

    try {
      await signup({
        name,
        email,
        password,
        localityName,
        lng: parseFloat(lngStr),
        lat: parseFloat(latStr)
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto 0 auto', width: '100%' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--blinkit-yellow)' }}>
          Create CartMate Account
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Join nearby shoppers to save on Blinkit handling fees!
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Singh"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vikram@example.com"
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

          <div className="form-group">
            <label>Current Locality Name</label>
            <input
              type="text"
              value={localityName}
              onChange={(e) => setLocalityName(e.target.value)}
              placeholder="e.g. Koramangala 4th Block, Bengaluru"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin size={14} /> Demo Location Coordinates
            </label>
            <select value={presetCoords} onChange={(e) => setPresetCoords(e.target.value)}>
              <option value="77.6245,12.9352">Koramangala 4th Block (77.6245, 12.9352)</option>
              <option value="77.6210,12.9320">Koramangala 5th Block (77.6210, 12.9320)</option>
              <option value="77.6280,12.9380">Koramangala 6th Block (77.6280, 12.9380)</option>
              <option value="77.6350,12.9120">HSR Layout Sector 1 (77.6350, 12.9120)</option>
              <option value="72.9080,19.1170">Powai, Mumbai (72.9080, 19.1170)</option>
              <option value="77.2167,28.6289">Connaught Place, New Delhi (77.2167, 28.6289)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.75rem' }}>
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--blinkit-yellow)', fontWeight: '700' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
