import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { RequestCard } from '../components/RequestCard';
import { ActiveCartModal } from '../components/ActiveCartModal';
import { JoinRequestModal } from '../components/JoinRequestModal';
import { MapPin, ShoppingBag, PlusCircle, RefreshCw, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, activeCart } = useContext(AuthContext);

  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedPostForJoin, setSelectedPostForJoin] = useState(null);
  const [radiusKm, setRadiusKm] = useState(15);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/requests/nearby?radius=${radiusKm}`);
      setNearbyRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch nearby requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [radiusKm]);

  return (
    <div>
      {/* Floating Active Cart Session Banner */}
      <div className="cart-session-banner">
        <div className="cart-session-info">
          <span className="cart-session-badge">Active Cart Session</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
              Your Blinkit Cart MRP: <span style={{ color: 'var(--blinkit-yellow)' }}>₹{activeCart ? activeCart.totalMrp : 0}</span> | Standalone Total: <span>₹{activeCart ? activeCart.standaloneTotal : 0}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ⚡ Feed cards automatically calculate your **exact proportional split & green fee savings**!
            </div>
          </div>
        </div>

        <button onClick={() => setIsCartModalOpen(true)} className="btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
          <ShoppingBag size={15} /> Edit Active Cart
        </button>
      </div>

      {/* Main Feed Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📍 Nearby Blinkit Order Requests
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing quick-commerce orders near <strong>{user?.localityName || 'your location'}</strong> (Sorted nearest first)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'var(--bg-card)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span>Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--blinkit-yellow)', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
            >
              <option value="2">2 km</option>
              <option value="5">5 km</option>
              <option value="15">15 km</option>
              <option value="50">50 km</option>
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
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Finding nearby Blinkit order posts...
        </div>
      ) : nearbyRequests.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '3rem', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: 'var(--blinkit-yellow)', marginBottom: '1rem', opacity: 0.8 }} />
          <h3>No nearby open Blinkit posts found in {radiusKm} km</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Be the first in {user?.localityName || 'your area'} to post a Blinkit order request and invite neighbors!
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
