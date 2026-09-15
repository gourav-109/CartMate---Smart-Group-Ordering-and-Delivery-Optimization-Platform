import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Send, X, AlertCircle, ShoppingBag } from 'lucide-react';

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

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  const posterName = requestPost.user?.name || 'Blinkit Shopper';
  const posterLocality = requestPost.localityName || 'Hostel 1, NIT Jamshedpur';
  const orderNumber = requestPost.orderNumber || `#CM-ORD-${requestPost._id.slice(-5).toUpperCase()}`;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--blinkit-yellow)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShoppingBag size={18} /> Request to Join Blinkit Order
          </h3>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'var(--bg-dark)', padding: '0.9rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Host Post:</div>
              <div style={{ fontWeight: '700', fontSize: '0.98rem' }}>{posterName}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {posterLocality}</div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--blinkit-yellow)', background: 'rgba(248, 203, 70, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
              {orderNumber}
            </span>
          </div>
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
            <label>Your Total if Ordered Alone (₹)<span className="required-star">*</span></label>
            <input
              type="number"
              value={standaloneTotal}
              onChange={(e) => setStandaloneTotal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Chat Note to Host</label>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Suggest a convenient campus meeting spot (e.g. Hostel 1 Gate) or ask questions..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Send size={15} /> {loading ? 'Sending Request...' : 'Send Join Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
