import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { MapPicker } from '../components/MapPicker';
import { ShoppingBag, Plus, Trash2, Save, ArrowLeft, AlertCircle } from 'lucide-react';

export const EditRequest = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [totalMrp, setTotalMrp] = useState('');
  const [standaloneTotal, setStandaloneTotal] = useState('');
  const [combinedOrderTotal, setCombinedOrderTotal] = useState('');
  const [localityName, setLocalityName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [items, setItems] = useState([]);
  const [lat, setLat] = useState(22.7780);
  const [lng, setLng] = useState(86.1438);

  const [newItemName, setNewItemName] = useState('');
  const [newItemMrp, setNewItemMrp] = useState('');

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/groups/${id}`);
        const reqDoc = res.data.request;

        setTotalMrp(reqDoc.totalMrp);
        setStandaloneTotal(reqDoc.standaloneTotal);
        setCombinedOrderTotal(reqDoc.combinedOrderTotal);
        setLocalityName(reqDoc.localityName);
        if (reqDoc.deadline) {
          setDeadline(new Date(reqDoc.deadline).toISOString().slice(0, 16));
        }
        setItems(reqDoc.items || []);
        if (reqDoc.location?.coordinates) {
          setLng(reqDoc.location.coordinates[0]);
          setLat(reqDoc.location.coordinates[1]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order post for editing');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemMrp) return;
    const addedMrp = parseFloat(newItemMrp);
    const updatedItems = [...items, { name: newItemName, mrp: addedMrp }];
    setItems(updatedItems);
    
    // Auto calculate total MRP
    const newSum = updatedItems.reduce((s, i) => s + (i.mrp || 0), 0);
    setTotalMrp(newSum.toString());
    setStandaloneTotal((newSum + 35).toString());
    
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
    setSaveLoading(true);
    setError('');

    try {
      await API.put(`/requests/${id}`, {
        totalMrp: parseFloat(totalMrp),
        standaloneTotal: parseFloat(standaloneTotal),
        combinedOrderTotal: parseFloat(combinedOrderTotal),
        localityName,
        deadline,
        items,
        lat,
        lng
      });

      navigate(`/groups/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order modifications');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading order post...</div>;

  return (
    <div style={{ maxWidth: '680px', margin: '1.5rem auto', width: '100%' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.55rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--blinkit-yellow)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✏️ Edit Entire Blinkit Order Post
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Modify order products (items), deadline date/time, total MRP, standalone fee, combined price, and campus locality!
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--blinkit-yellow)', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              📌 Order Totals & Locality Details
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Total Products MRP (₹)</label>
                <input
                  type="number"
                  value={totalMrp}
                  onChange={(e) => setTotalMrp(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Standalone Fee Alone (₹)</label>
                <input
                  type="number"
                  value={standaloneTotal}
                  onChange={(e) => setStandaloneTotal(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label>Combined Order Total Price (₹)</label>
              <input
                type="number"
                value={combinedOrderTotal}
                onChange={(e) => setCombinedOrderTotal(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Hostel / Locality Name</label>
              <input
                type="text"
                value={localityName}
                onChange={(e) => setLocalityName(e.target.value)}
                required
              />
            </div>

            {/* Map Picker for location adjustment */}
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
              <label>Order Deadline Date & Time</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {/* EDITABLE ITEMS LIST */}
          <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
              🛍️ Order Items Content
            </h4>

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
                placeholder="Item name"
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
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={saveLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}>
            <Save size={18} /> {saveLoading ? 'Saving Changes...' : 'Save Order Modifications'}
          </button>
        </form>
      </div>
    </div>
  );
};
