import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, X } from 'lucide-react';

export const ActiveCartModal = ({ isOpen, onClose }) => {
  const { activeCart, updateActiveCart } = useContext(AuthContext);

  const [totalMrp, setTotalMrp] = useState(activeCart ? activeCart.totalMrp : 123);
  const [standaloneTotal, setStandaloneTotal] = useState(activeCart ? activeCart.standaloneTotal : 158);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateActiveCart({
      totalMrp: parseFloat(totalMrp) || 0,
      standaloneTotal: parseFloat(standaloneTotal) || 0,
      items: [{ name: 'Current Active Cart', mrp: parseFloat(totalMrp) || 0 }]
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--blinkit-yellow)' }}>
            <ShoppingBag size={20} /> Set Your Active Blinkit Cart
          </h3>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Enter the MRP and standalone checkout price of items currently in your Blinkit app basket to see **LIVE green savings previews** on all nearby order posts!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Your Cart Items Total MRP (₹)<span className="required-star">*</span>
            </label>

            <input
              type="number"
              value={totalMrp}
              onChange={(e) => setTotalMrp(e.target.value)}
              placeholder="e.g. 123"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Your Standalone Checkout Price Alone with Handling Fee (₹)<span className="required-star">*</span>
            </label>
            <input
              type="number"
              value={standaloneTotal}
              onChange={(e) => setStandaloneTotal(e.target.value)}
              placeholder="e.g. 158"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Final checkout amount shown on Blinkit if ordered alone (includes handling & delivery)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Active Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
