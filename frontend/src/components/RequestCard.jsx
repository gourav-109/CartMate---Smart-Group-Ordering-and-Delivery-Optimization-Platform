import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Clock, Users, ArrowRight, TrendingDown } from 'lucide-react';

export const RequestCard = ({ requestPost, onOpenJoinModal }) => {
  const { user, activeCart } = useContext(AuthContext);
  const navigate = useNavigate();

  const isOwner = user && requestPost.user?._id === user._id;

  // Calculate live savings preview if viewing user has an active cart
  let livePreview = null;
  if (activeCart && activeCart.totalMrp > 0 && !isOwner) {
    const totalMrpCombined = requestPost.totalMrp + activeCart.totalMrp;
    const combinedTotal = requestPost.combinedOrderTotal; // Expected combined total
    const userShareRatio = activeCart.totalMrp / totalMrpCombined;
    const userFinalPayment = Math.round(userShareRatio * combinedTotal * 100) / 100;
    const userSavings = Math.round((activeCart.standaloneTotal - userFinalPayment) * 100) / 100;

    livePreview = {
      combinedTotal,
      userFinalPayment,
      userSavings
    };
  }

  // Format deadline
  const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="request-card">
      <div>
        <div className="card-header">
          <div className="user-info">
            <div className="avatar">{requestPost.user?.name ? requestPost.user.name.charAt(0) : 'U'}</div>
            <div>
              <div className="user-name">{requestPost.user?.name || 'Blinkit Shopper'}</div>
              <div className="user-location">
                <MapPin size={12} /> {requestPost.localityName}
              </div>
            </div>
          </div>
          <span className="distance-badge">{requestPost.distanceKm || 0.4} km away</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
          <span className={`status-badge ${requestPost.status === 'OPEN' ? 'status-open' : requestPost.status === 'FULL' ? 'status-full' : 'status-closed'}`}>
            {requestPost.status}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Users size={12} /> {requestPost.participantCount || 1}/4 Participants
          </span>
        </div>

        <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', margin: '0.6rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>Postee Items MRP:</span>
            <strong style={{ color: 'var(--blinkit-yellow)' }}>₹{requestPost.totalMrp}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            <span>Standalone Fee (Alone):</span>
            <strong>₹{requestPost.standaloneTotal}</strong>
          </div>

          {requestPost.items && requestPost.items.length > 0 && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <strong>Cart Preview:</strong> {requestPost.items.map((i) => i.name).join(', ')}
            </div>
          )}
        </div>

        {/* Live Green Savings Preview Badge */}
        {livePreview && (
          <div className="savings-box">
            <div className="savings-amount">
              <TrendingDown size={18} /> SAVE ₹{livePreview.userSavings > 0 ? livePreview.userSavings : 0} 🎉
            </div>
            <div className="split-detail">
              Combined Total: ₹{livePreview.combinedTotal} | Your Proportional Split: <strong>₹{livePreview.userFinalPayment}</strong> (vs ₹{activeCart.standaloneTotal} alone)
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
          <Clock size={13} /> Order Deadline: {formatDeadline(requestPost.deadline)}
        </div>
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        {isOwner ? (
          <button
            onClick={() => navigate(`/groups/${requestPost.groupId || requestPost._id}`)}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Manage Your Post & Group <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => (requestPost.groupId ? navigate(`/groups/${requestPost.groupId}`) : onOpenJoinModal(requestPost))}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {requestPost.groupId ? 'View Group & Chat' : 'Send Chat / Join Request'} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
