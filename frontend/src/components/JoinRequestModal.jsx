import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Send, X, AlertCircle } from 'lucide-react';

export const JoinRequestModal = ({ isOpen, onClose, requestPost, onSuccess }) => {
  const { activeCart } = useContext(AuthContext);

  const [totalMrp, setTotalMrp] = useState(activeCart ? activeCart.totalMrp : 123);
  const [standaloneTotal, setStandaloneTotal] = useState(activeCart ? activeCart.standaloneTotal : 158);
  const [message, setMessage] = useState('Hey! I would like to combine my Blinkit order with yours.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeCart) {
      setTotalMrp(activeCart.totalMrp);
      setStandaloneTotal(activeCart.standaloneTotal);
    }
  }, [activeCart, isOpen]);

  if (!isOpen || !requestPost) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post(`/requests/${requestPost._id}/join-request`, {
        totalMrp: parseFloat(totalMrp),
        standaloneTotal: parseFloat(standaloneTotal),
        message,
        items: activeCart ? activeCart.items : []
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Request to Join Blinkit Order</h3>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Posting User:</div>
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>{requestPost.user?.name || 'Blinkit Shopper'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {requestPost.localityName}</div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Cart Total MRP (₹)<span className="required-star">*</span></label>
            <input
              type="number"
              value={totalMrp}
              onChange={(e) => setTotalMrp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Standalone Total if Ordered Alone (₹)<span className="required-star">*</span></label>
            <input
              type="number"
              value={standaloneTotal}
              onChange={(e) => setStandaloneTotal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Chat Request Note to Poster</label>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Suggest a meeting spot or ask questions..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Send size={16} /> {loading ? 'Sending...' : 'Send Chat Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
