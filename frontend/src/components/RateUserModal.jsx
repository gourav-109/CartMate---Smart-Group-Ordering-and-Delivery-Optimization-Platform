import React, { useState } from 'react';
import API from '../services/api';
import { Star, X, CheckCircle, AlertCircle } from 'lucide-react';

export const RateUserModal = ({ isOpen, onClose, targetUser, onSuccess }) => {
  const [score, setScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const targetId = targetUser._id || targetUser.id;
      const res = await API.post(`/auth/users/${targetId}/rate`, {
        score,
        comment
      });

      setSubmitted(true);
      if (onSuccess) onSuccess(res.data);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blinkit-yellow)' }}>
            ⭐ Rate Group Member
          </h3>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={48} style={{ color: 'var(--savings-green)', margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Rating Submitted!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Thank you for keeping the Cartmate community trusted and safe.
            </p>
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                {targetUser.name ? targetUser.name.charAt(0) : 'U'}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{targetUser.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {targetUser.customId || '#CM-84920'} • {targetUser.localityName || 'NIT Jamshedpur'}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Select Star Rating:
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverScore || score) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setScore(starVal)}
                        onMouseEnter={() => setHoverScore(starVal)}
                        onMouseLeave={() => setHoverScore(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          transition: 'transform 0.1s ease'
                        }}
                      >
                        <Star
                          size={32}
                          style={{
                            fill: isFilled ? 'var(--blinkit-yellow)' : 'transparent',
                            color: isFilled ? 'var(--blinkit-yellow)' : 'var(--text-muted)'
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--blinkit-yellow)', marginTop: '0.4rem' }}>
                  {score === 5 && '⭐⭐⭐⭐⭐ Exceptional (5.0)'}
                  {score === 4 && '⭐⭐⭐⭐ Great Experience (4.0)'}
                  {score === 3 && '⭐⭐⭐ Good / Average (3.0)'}
                  {score === 2 && '⭐⭐ Below Expectations (2.0)'}
                  {score === 1 && '⭐ Poor Experience (1.0)'}
                </div>
              </div>

              <div className="form-group">
                <label>Review Comment (Optional)</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Met on time at Hostel 1 gate, fast UPI settlement!"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
