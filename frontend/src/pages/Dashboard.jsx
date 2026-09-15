import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { RequestCard } from '../components/RequestCard';
import { ActiveCartModal } from '../components/ActiveCartModal';
import { JoinRequestModal } from '../components/JoinRequestModal';
import { MapPin, ShoppingBag, PlusCircle, RefreshCw, Sparkles, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, savedCarts, activeCartId, setActiveCartId } = useContext(AuthContext);

  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedPostForJoin, setSelectedPostForJoin] = useState(null);

  // STRICT RADIUS CAP: Max 5km
  const [radiusKm, setRadiusKm] = useState(5);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const userLng = user?.location?.coordinates?.[0] || 86.1438;
      const userLat = user?.location?.coordinates?.[1] || 22.7780;
      const res = await API.get(`/requests/nearby?radius=${radiusKm}&lat=${userLat}&lng=${userLng}`);
      setNearbyRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch nearby requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [radiusKm, user?.location?.coordinates?.[0], user?.location?.coordinates?.[1], user?.localityName]);

  return (
    <div>
      {/* Floating Active Cart Session Banner with Multi-cart Switcher */}
      <div className="cart-session-banner">
        <div className="cart-session-info">
          <span className="cart-session-badge">Active Cart Session</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Current Cart:</span>
              <select
                value={activeCartId}
                onChange={(e) => setActiveCartId(e.target.value)}
                style={{
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--blinkit-yellow)',
                  fontWeight: '700',
                  borderRadius: '7px',
                  padding: '0.25rem 0.6rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {savedCarts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (₹{c.totalMrp} MRP / ₹{c.standaloneTotal} Alone)
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              ⚡ Feed cards dynamically compute your <strong>exact proportional split & green fee savings</strong> for this selected cart!
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCartModalOpen(true)}
          className="btn-primary"
          style={{ padding: '0.5rem 0.95rem', fontSize: '0.85rem' }}
        >
          <ShoppingBag size={15} /> Manage My Carts
        </button>
      </div>

      {/* Main Feed Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📍 Nearby Blinkit Order Posts
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
            <MapPin size={13} style={{ color: 'var(--blinkit-yellow)' }} />
            Showing orders near <strong>{user?.localityName || 'Hostel 1, NIT Jamshedpur'}</strong> (Nearest first)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'var(--bg-card)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span>Radius Cap:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              style={{ background: 'none', border: 'none', color: 'var(--blinkit-yellow)', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
            >
              <option value="0.5">0.5 km</option>
              <option value="1">1 km</option>
              <option value="2">2 km</option>
              <option value="3">3 km</option>
              <option value="5">5 km (Max Limit)</option>
            </select>
          </div>

          <button onClick={fetchNearby} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }} title="Refresh Feed">
            <RefreshCw size={16} />
          </button>

          <Link to="/new-request" className="btn-primary">
            <PlusCircle size={16} /> Post Order
          </Link>
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
          Finding nearby Blinkit group orders within {radiusKm} km of your hostel...
        </div>
      ) : nearbyRequests.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: 'var(--blinkit-yellow)', marginBottom: '1rem', opacity: 0.85 }} />
          <h3>No nearby open Blinkit posts found within {radiusKm} km</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Be the first near <strong>{user?.localityName || 'NIT Jamshedpur'}</strong> to create a Blinkit group order post!
          </p>
          <Link to="/new-request" className="btn-primary">
            <PlusCircle size={18} /> Create Order Post
          </Link>
        </div>
      ) : (
        <div className="cards-grid">
          {nearbyRequests.map((post) => (
            <RequestCard
              key={post._id}
              requestPost={post}
              onOpenJoinModal={(postObj) => setSelectedPostForJoin(postObj)}
              onPostDeleted={fetchNearby}
            />
          ))}
        </div>
      )}

      {/* Active Cart Edit Modal */}
      <ActiveCartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />

      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={Boolean(selectedPostForJoin)}
        requestPost={selectedPostForJoin}
        onClose={() => setSelectedPostForJoin(null)}
        onSuccess={() => {
          setSelectedPostForJoin(null);
          fetchNearby();
        }}
      />
    </div>
  );
};
