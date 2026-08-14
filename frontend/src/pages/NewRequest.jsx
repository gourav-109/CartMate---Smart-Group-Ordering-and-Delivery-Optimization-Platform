import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { ShoppingBag, Plus, Trash2, Clock, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';

export const NewRequest = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mandatory fields
  const [totalMrp, setTotalMrp] = useState('93');
  const [standaloneTotal, setStandaloneTotal] = useState('128');
  const [combinedOrderTotal, setCombinedOrderTotal] = useState('221');
  const [localityName, setLocalityName] = useState(user?.localityName || 'Koramangala 4th Block, Bengaluru');

  // Set default deadline to 5 hours from now
  const defaultDeadline = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [deadline, setDeadline] = useState(defaultDeadline);

  // Optional item list
  const [items, setItems] = useState([
    { name: 'Amul Taaza Milk 500ml', mrp: 27 },
    { name: 'Britannia Whole Wheat Bread', mrp: 45 },
    { name: 'Maggie 2-Min Noodles 4-Pack', mrp: 21 }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemMrp, setNewItemMrp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemMrp) return;
    setItems([...items, { name: newItemName, mrp: parseFloat(newItemMrp) }]);
    setNewItemName('');
    setNewItemMrp('');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate deadline (max 48 hours)
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const maxDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    if (deadlineDate <= now) {
      setError('Deadline must be a future time');
      setLoading(false);
      return;
    }

    if (deadlineDate > maxDeadline) {
      setError('Deadline cannot exceed 2 days (48 hours) from now');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post('/requests', {
        store: 'Blinkit',
        totalMrp: parseFloat(totalMrp),
        standaloneTotal: parseFloat(standaloneTotal),
        combinedOrderTotal: parseFloat(combinedOrderTotal),
        localityName,
        deadline,
        items
      });

      navigate(`/groups/${res.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '1.5rem auto', width: '100%' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Feed
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--blinkit-yellow)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛒 Post New Blinkit Order Request
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Share your Blinkit basket totals so nearby neighbors can combine orders and split handling fees!
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* COMPULSORY FIELDS SECTION */}
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--blinkit-yellow)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              📌 Mandatory Post Details
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>
                  Total Products MRP (₹)<span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  value={totalMrp}
                  onChange={(e) => setTotalMrp(e.target.value)}
                  placeholder="e.g. 93"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Standalone Fee Alone (₹)<span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  value={standaloneTotal}
                  onChange={(e) => setStandaloneTotal(e.target.value)}
                  placeholder="e.g. 128"
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Blinkit total if ordered alone</span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label>
                Combined Order Total Price (Expected) in ₹<span className="required-star">*</span>
              </label>
              <input
                type="number"
                value={combinedOrderTotal}
                onChange={(e) => setCombinedOrderTotal(e.target.value)}
                placeholder="e.g. 221"
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Combined order checkout total with shared single fee</span>
            </div>

            <div className="form-group">
              <label>
                Your Locality Name<span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={localityName}
                onChange={(e) => setLocalityName(e.target.value)}
                placeholder="e.g. Koramangala 4th Block, Bengaluru"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Order Deadline (Max 2 Days)<span className="required-star">*</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Order will automatically close after this time</span>
            </div>
          </div>

          {/* OPTIONAL ITEM LIST SECTION */}
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
              🛍️ Itemized Basket Preview (Optional)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Optionally list products in your cart for transparency.
            </p>

            {items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ color: 'var(--blinkit-yellow)' }}>₹{item.mrp}</strong>
                      <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'none', color: '#f87171' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name (e.g. Milk)"
                style={{ flex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="number"
                value={newItemMrp}
                onChange={(e) => setNewItemMrp(e.target.value)}
                placeholder="MRP (₹)"
                style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              />
              <button type="button" onClick={handleAddItem} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}>
            <ShoppingBag size={18} /> {loading ? 'Posting Request...' : 'Publish Blinkit Order Post'}
          </button>
        </form>
      </div>
    </div>
  );
};
