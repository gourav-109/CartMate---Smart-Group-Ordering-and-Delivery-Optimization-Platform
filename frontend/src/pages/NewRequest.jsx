import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { MapPicker } from '../components/MapPicker';
import { toDatetimeLocalValue } from '../utils/datetimeLocal';
import { ShoppingBag, Plus, Trash2, Clock, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';

export const NewRequest = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mandatory fields
  const [totalMrp, setTotalMrp] = useState('93');
  const [standaloneTotal, setStandaloneTotal] = useState('128');
  const [combinedOrderTotal, setCombinedOrderTotal] = useState('221');
  const [localityName, setLocalityName] = useState(user?.localityName || 'Hostel 1, NIT Jamshedpur');
  const [lat, setLat] = useState(user?.location?.coordinates?.[1] || 22.7780);
  const [lng, setLng] = useState(user?.location?.coordinates?.[0] || 86.1438);

  // Set default deadline to 5 hours from now (local wall time for datetime-local)
  const defaultDeadline = toDatetimeLocalValue(new Date(Date.now() + 5 * 60 * 60 * 1000));
  const [deadline, setDeadline] = useState(defaultDeadline);

  // Item list
  const [items, setItems] = useState([
    { name: 'Amul Taaza Milk 500ml', mrp: 27 },
    { name: 'Britannia Whole Wheat Bread', mrp: 45 },
    { name: 'Maggi 2-Min Noodles 4-Pack', mrp: 21 }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemMrp, setNewItemMrp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemMrp) return;
    const addedMrp = parseFloat(newItemMrp);
    const updatedItems = [...items, { name: newItemName, mrp: addedMrp }];
    setItems(updatedItems);
    
    // Automatically update totalMrp sum if appropriate
    const newSum = updatedItems.reduce((s, i) => s + (i.mrp || 0), 0);
    setTotalMrp(newSum.toString());
    setStandaloneTotal((newSum + 35).toString());
    setCombinedOrderTotal((newSum + 35 + 93).toString());

    setNewItemName('');
    setNewItemMrp('');
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    if (updated.length > 0) {
      const newSum = updated.reduce((s, i) => s + (i.mrp || 0), 0);
      setTotalMrp(newSum.toString());
      setStandaloneTotal((newSum + 35).toString());
    }
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
        items,
        lat,
        lng
      });

      navigate(`/groups/${res.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1.5rem auto', width: '100%' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Feed
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.55rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--blinkit-yellow)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛒 Post New Blinkit Group Order
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Share your basket total so nearby NIT Jamshedpur hostel residents can combine carts and split delivery & small-cart fees!
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* COMPULSORY FIELDS SECTION */}
          <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--blinkit-yellow)', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              📌 Mandatory Post Totals
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>
                  Your Items Total MRP (₹)<span className="required-star">*</span>
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
                  Standalone Total Alone (₹)<span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  value={standaloneTotal}
                  onChange={(e) => setStandaloneTotal(e.target.value)}
                  placeholder="e.g. 128"
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Price on Blinkit if ordered alone with fees</span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label>
                Combined Checkout Total Expected (₹)<span className="required-star">*</span>
              </label>
              <input
                type="number"
                value={combinedOrderTotal}
                onChange={(e) => setCombinedOrderTotal(e.target.value)}
                placeholder="e.g. 221"
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estimated single checkout amount with shared fees</span>
            </div>

            <div className="form-group">
              <label>
                Hostel / Locality Name<span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={localityName}
                onChange={(e) => setLocalityName(e.target.value)}
                placeholder="e.g. Hostel 1, NIT Jamshedpur"
                required
              />
            </div>

            {/* Interactive Campus Map Location Picker */}
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

            <div className="form-group">
              <label>
                Order Deadline (Max 48 Hours)<span className="required-star">*</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Order automatically closes after this time</span>
            </div>
          </div>

          {/* ITEM LIST SECTION */}
          <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
              🛍️ Itemized Basket Preview
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              List products in your cart for full transparency with group members.
            </p>

            {items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '0.45rem 0.85rem', borderRadius: '7px', fontSize: '0.86rem' }}>
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
                placeholder="Product name (e.g. Milk, Maggi)"
                style={{ flex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '7px', color: 'white', fontSize: '0.85rem' }}
              />
              <input
                type="number"
                value={newItemMrp}
                onChange={(e) => setNewItemMrp(e.target.value)}
                placeholder="MRP (₹)"
                style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '7px', color: 'white', fontSize: '0.85rem' }}
              />
              <button type="button" onClick={handleAddItem} className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}>
            <ShoppingBag size={18} /> {loading ? 'Publishing Order...' : 'Publish Blinkit Order Post'}
          </button>
        </form>
      </div>
    </div>
  );
};
