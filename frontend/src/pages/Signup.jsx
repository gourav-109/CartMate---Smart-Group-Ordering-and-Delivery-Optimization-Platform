import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { MapPicker } from '../components/MapPicker';
import { UserPlus, MapPin, AlertCircle, Key, CheckCircle, ShieldCheck, Mail } from 'lucide-react';

export const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localityName, setLocalityName] = useState('Hostel 1, NIT Jamshedpur');
  const [lat, setLat] = useState(22.7780);
  const [lng, setLng] = useState(86.1438);

  // Email Verification OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setOtpLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/send-otp', { email });
      setGeneratedOtp(res.data.otp);
      setOtpSent(true);
    } catch (err) {
      setError('Failed to generate email OTP verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp.trim() === generatedOtp) {
      setIsEmailVerified(true);
      setError('');
    } else {
      setError('Incorrect OTP code entered. Please check the code provided above.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setError('Please verify your email address using the 6-digit OTP code before proceeding');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup({
        name,
        email,
        password,
        localityName,
        lng,
        lat
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '2rem auto', width: '100%' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.4rem', color: 'var(--blinkit-yellow)' }}>
          Create Cartmate Account
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Join nearby NIT Jamshedpur hostel residents & neighbors to combine Blinkit orders!
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
            <label>Email Address (with OTP Verification)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                }}
                placeholder="vikram@nitjsr.ac.in or vikram@gmail.com"
                required
                disabled={isEmailVerified}
              />
              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !email}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
                >
                  {otpLoading ? 'Sending...' : 'Send OTP'}
                </button>
              )}
            </div>
          </div>

          {/* OTP VERIFICATION STEP */}
          {otpSent && !isEmailVerified && (
            <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--blinkit-yellow)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--blinkit-yellow)', fontWeight: '700', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={14} /> Verification Code: <span style={{ color: '#fff', fontSize: '1.05rem', letterSpacing: '3px', background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{generatedOtp}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  maxLength={6}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleVerifyOtp} className="btn-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {isEmailVerified && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.55rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle size={16} /> Email Address Verified
            </div>
          )}

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
            <label>Hostel / Campus Locality Name</label>
            <input
              type="text"
              value={localityName}
              onChange={(e) => setLocalityName(e.target.value)}
              placeholder="e.g. Hostel 1, NIT Jamshedpur"
              required
            />
          </div>

          {/* Interactive Campus Map for Visual Address Verification */}
          <MapPicker
            initialLat={lat}
            initialLng={lng}
            initialLocality={localityName}
            onLocationSelect={({ localityName: pickedName, lat: pickedLat, lng: pickedLng }) => {
              setLocalityName(pickedName);
              setLat(pickedLat);
              setLng(pickedLng);
            }}
          />

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem', fontSize: '1rem' }}>
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Sign Up for Cartmate'}
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
