import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { RequestCard } from '../components/RequestCard';
import { MapPicker } from '../components/MapPicker';
import { User, MapPin, ShieldCheck, Star, Edit2, Save, X, ShoppingBag, Clock, CheckCircle2, TrendingDown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [myPosts, setMyPosts] = useState([]);
  const [joinedPosts, setJoinedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'history', 'reviews'

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editLocality, setEditLocality] = useState(user?.localityName || 'Hostel 1, NIT Jamshedpur');
  const [editBio, setEditBio] = useState(user?.bio || 'NIT Jamshedpur student & Blinkit group shopper');
  const [editLat, setEditLat] = useState(user?.location?.coordinates?.[1] || 22.7780);
  const [editLng, setEditLng] = useState(user?.location?.coordinates?.[0] || 86.1438);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/requests/my-requests');
      setMyPosts(res.data.myPosts || []);
      setJoinedPosts(res.data.joinedPosts || []);
    } catch (err) {
      console.error('Failed to fetch user requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await API.patch('/auth/profile', {
        name: editName,
        localityName: editLocality,
        bio: editBio,
        lat: editLat,
        lng: editLng
      });
      updateUserProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading user profile...</div>;

  const activePostsList = myPosts.filter((r) => !r.isDeletedFromFeed && (r.status === 'OPEN' || r.status === 'FULL'));
  const historyPostsList = myPosts.filter((r) => r.isDeletedFromFeed || r.status === 'COMPLETED' || r.status === 'CLOSED');

  const totalCompletedOrders = user.completedOrdersCount || 0;
  const userRatings = user.ratings || [];
  const averageRating = user.averageRating || 5.0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Profile Header & Stats Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="avatar" style={{ width: '76px', height: '76px', fontSize: '2.2rem', border: '3px solid var(--blinkit-yellow)', boxShadow: '0 4px 16px rgba(248, 203, 70, 0.3)' }}>
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-main)' }}>{user.name}</h2>
                <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)', fontSize: '0.82rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                  {user.customId || '#CM-84920'}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} style={{ color: 'var(--blinkit-yellow)' }} /> {user.localityName || 'Hostel 1, NIT Jamshedpur'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                ✉️ {user.email}
              </div>
              {user.bio && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                  "{user.bio}"
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            {/* Trust & Rating Badge */}
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.75rem 1.25rem', borderRadius: '14px', textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <ShieldCheck size={20} /> {totalCompletedOrders} Orders Completed
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--blinkit-yellow)', fontWeight: '700', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                <Star size={14} style={{ fill: 'var(--blinkit-yellow)' }} /> {averageRating} / 5.0 ({userRatings.length} Reviews)
              </div>
            </div>

            <button
              onClick={() => {
                setEditName(user.name);
                setEditLocality(user.localityName);
                setEditBio(user.bio || '');
                setEditLat(user.location?.coordinates?.[1] || 22.7780);
                setEditLng(user.location?.coordinates?.[0] || 86.1438);
                setIsEditing(!isEditing);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
            >
              {isEditing ? <X size={15} /> : <Edit2 size={15} />} {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '14px' }}>
            <h4 style={{ color: 'var(--blinkit-yellow)', marginBottom: '1rem', fontSize: '1rem' }}>Edit Personal & Hostel Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Hostel / Locality Name</label>
                <input type="text" value={editLocality} onChange={(e) => setEditLocality(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Bio / Department</label>
              <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="e.g. 3rd Year CSE | Hostel 1 resident" />
            </div>

            {/* Interactive Map Picker for Precise Hostel Location */}
            <MapPicker
              initialLat={editLat}
              initialLng={editLng}
              initialLocality={editLocality}
              onLocationSelect={({ localityName, lat, lng }) => {
                setEditLocality(localityName);
                setEditLat(lat);
                setEditLng(lng);
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" disabled={saveLoading} className="btn-primary">
                <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'active' ? 'var(--blinkit-yellow)' : 'var(--text-muted)',
            fontWeight: '700',
            fontSize: '0.95rem',
            borderBottom: activeTab === 'active' ? '3px solid var(--blinkit-yellow)' : 'none',
            cursor: 'pointer'
          }}
        >
          Active Orders ({activePostsList.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'history' ? 'var(--blinkit-yellow)' : 'var(--text-muted)',
            fontWeight: '700',
            fontSize: '0.95rem',
            borderBottom: activeTab === 'history' ? '3px solid var(--blinkit-yellow)' : 'none',
            cursor: 'pointer'
          }}
        >
          Order History & Completed ({historyPostsList.length})
        </button>

        <button
          onClick={() => setActiveTab('joined')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'joined' ? 'var(--blinkit-yellow)' : 'var(--text-muted)',
            fontWeight: '700',
            fontSize: '0.95rem',
            borderBottom: activeTab === 'joined' ? '3px solid var(--blinkit-yellow)' : 'none',
            cursor: 'pointer'
          }}
        >
          Joined as Member ({joinedPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'reviews' ? 'var(--blinkit-yellow)' : 'var(--text-muted)',
            fontWeight: '700',
            fontSize: '0.95rem',
            borderBottom: activeTab === 'reviews' ? '3px solid var(--blinkit-yellow)' : 'none',
            cursor: 'pointer'
          }}
        >
          Member Reviews ({userRatings.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading your records...</div>
      ) : activeTab === 'active' ? (
        activePostsList.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '14px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingBag size={40} style={{ color: 'var(--blinkit-yellow)', marginBottom: '0.75rem', opacity: 0.8 }} />
            <h3>No active group orders posted right now.</h3>
            <Link to="/new-request" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Create Order Post
            </Link>
          </div>
        ) : (
          <div className="cards-grid">
            {activePostsList.map((post) => (
              <RequestCard key={post._id} requestPost={post} onPostDeleted={fetchMyData} />
            ))}
          </div>
        )
      ) : activeTab === 'history' ? (
        historyPostsList.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '14px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No past or completed orders found in history.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historyPostsList.map((post) => {
              const ordNo = post.orderNumber || `#CM-ORD-${post._id.slice(-5).toUpperCase()}`;
              return (
                <div
                  key={post._id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: '800', color: 'var(--blinkit-yellow)', fontSize: '1rem' }}>{ordNo}</span>
                      <span className={`status-badge ${post.status === 'COMPLETED' ? 'status-open' : 'status-closed'}`}>
                        {post.status}
                      </span>
                      {post.isDeletedFromFeed && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          Archived Post
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      📍 {post.localityName} • Combined Total: <strong>₹{post.combinedOrderTotal}</strong> • Your Items MRP: <strong>₹{post.totalMrp}</strong>
                    </div>

                    {post.items && post.items.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        Items: {post.items.map((i) => `${i.name} (₹${i.mrp})`).join(', ')}
                      </div>
                    )}
                  </div>

                  <Link to={`/groups/${post.groupId || post._id}`} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
                    View Cost Summary
                  </Link>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'joined' ? (
        joinedPosts.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '14px', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't joined any other host's group orders yet. Find open posts on the home feed!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {joinedPosts.map((g) => (
              <div
                key={g._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '800', color: 'var(--blinkit-yellow)' }}>
                      {g.request?.orderNumber || `#CM-ORD-${g._id.slice(-5).toUpperCase()}`}
                    </span>
                    <span className={`status-badge ${g.status === 'COMPLETED' ? 'status-open' : 'status-full'}`}>{g.status}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Host: <strong>{g.owner?.name}</strong> ({g.owner?.localityName}) • Combined Total: <strong>₹{g.combinedOrderTotal}</strong>
                  </div>
                </div>
                <Link to={`/groups/${g._id}`} className="btn-primary" style={{ fontSize: '0.82rem' }}>
                  Open Group
                </Link>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Reviews Tab */
        userRatings.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '14px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No reviews received yet. Complete group orders with neighbors to build your trust score!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {userRatings.map((review, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{review.fromUserName || 'Blinkit Shopper'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--blinkit-yellow)', fontWeight: '700', fontSize: '0.9rem' }}>
                    {[...Array(review.score || 5)].map((_, i) => (
                      <Star key={i} size={14} style={{ fill: 'var(--blinkit-yellow)' }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  "{review.comment || 'Great experience sharing an order!'}"
                </p>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
