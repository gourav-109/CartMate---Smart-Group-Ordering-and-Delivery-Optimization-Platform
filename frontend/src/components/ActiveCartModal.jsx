import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, X, Plus, Trash2, CheckCircle2, Save } from 'lucide-react';

export const ActiveCartModal = ({ isOpen, onClose }) => {
  const { savedCarts, activeCart, activeCartId, setActiveCartId, addSavedCart, updateActiveCart, deleteSavedCart } = useContext(AuthContext);

  const [cartName, setCartName] = useState(activeCart ? activeCart.name : '');
  const [totalMrp, setTotalMrp] = useState(activeCart ? activeCart.totalMrp : 123);
  const [standaloneTotal, setStandaloneTotal] = useState(activeCart ? activeCart.standaloneTotal : 158);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCartName, setNewCartName] = useState('');
  const [newMrp, setNewMrp] = useState('123');
  const [newStandalone, setNewStandalone] = useState('158');

  useEffect(() => {
    if (activeCart) {
      setCartName(activeCart.name);
      setTotalMrp(activeCart.totalMrp);
      setStandaloneTotal(activeCart.standaloneTotal);
    }
  }, [activeCart, activeCartId, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (e) => {
    e.preventDefault();
    updateActiveCart({
      name: cartName,
      totalMrp: parseFloat(totalMrp) || 0,
      standaloneTotal: parseFloat(standaloneTotal) || 0
    });
    onClose();
  };

  const handleCreateNewCart = (e) => {
    e.preventDefault();
    if (!newMrp || !newStandalone) return;
    addSavedCart({
      name: newCartName || `Cart Profile ${savedCarts.length + 1}`,
      totalMrp: parseFloat(newMrp),
      standaloneTotal: parseFloat(newStandalone)
    });
    setIsAddingNew(false);
    setNewCartName('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--blinkit-yellow)' }}>
            <ShoppingBag size={20} /> Manage Active Blinkit Carts
          </h3>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Select or customize your current active cart session. Nearby orders in the feed will calculate your <strong>exact green savings</strong> based on your selected cart!
        </p>

        {/* List of Saved Carts */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>
            Select Active Cart Profile:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {savedCarts.map((cart) => {
              const isSelected = cart.id === activeCartId;
              return (
                <div
                  key={cart.id}
                  onClick={() => {
                    setActiveCartId(cart.id);
                    setCartName(cart.name);
                    setTotalMrp(cart.totalMrp);
                    setStandaloneTotal(cart.standaloneTotal);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(248, 203, 70, 0.15)' : 'var(--bg-dark)',
                    border: isSelected ? '1px solid var(--blinkit-yellow)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <CheckCircle2 size={18} style={{ color: isSelected ? 'var(--blinkit-yellow)' : 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: isSelected ? 'var(--blinkit-yellow)' : 'var(--text-main)' }}>
                        {cart.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Items MRP: ₹{cart.totalMrp} | Standalone Price: ₹{cart.standaloneTotal}
                      </div>
                    </div>
                  </div>

                  {savedCarts.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedCart(cart.id);
                      }}
                      style={{ background: 'none', color: '#f87171', padding: '0.3rem' }}
                      title="Delete Cart Profile"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Cart Toggle */}
        {!isAddingNew ? (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem', padding: '0.6rem' }}
          >
            <Plus size={16} /> Add Another Cart Profile
          </button>
        ) : (
          <form onSubmit={handleCreateNewCart} style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--blinkit-yellow)', marginBottom: '0.75rem' }}>
              Create New Cart Profile
            </h4>
            <div className="form-group">
              <input
                type="text"
                placeholder="Cart Profile Name (e.g. Midnight Canteen Munchies)"
                value={newCartName}
                onChange={(e) => setNewCartName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Items MRP (₹)</label>
                <input
                  type="number"
                  placeholder="Total MRP"
                  value={newMrp}
                  onChange={(e) => setNewMrp(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Standalone Total (₹)</label>
                <input
                  type="number"
                  placeholder="Price Alone"
                  value={newStandalone}
                  onChange={(e) => setNewStandalone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAddingNew(false)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                Create Cart Profile
              </button>
            </div>
          </form>
        )}

        {/* Edit Selected Active Cart */}
        <form onSubmit={handleUpdate}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Edit Selected Active Cart Details:
          </h4>
          <div className="form-group">
            <label>Cart Profile Label</label>
            <input
              type="text"
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Items MRP (₹)</label>
              <input
                type="number"
                value={totalMrp}
                onChange={(e) => setTotalMrp(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Standalone Total (₹)</label>
              <input
                type="number"
                value={standaloneTotal}
                onChange={(e) => setStandaloneTotal(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Close
            </button>
            <button type="submit" className="btn-primary">
              <Save size={15} /> Save Active Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
