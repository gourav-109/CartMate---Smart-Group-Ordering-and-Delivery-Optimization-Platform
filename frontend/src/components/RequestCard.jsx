import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { MapPin, Clock, Users, ArrowRight, TrendingDown, Edit, Trash2, UserPlus, ShieldCheck, Star, CheckCircle, MessageSquare } from 'lucide-react';

export const RequestCard = ({ requestPost, onOpenJoinModal, onPostDeleted }) => {
  const { user, activeCart } = useContext(AuthContext);
  const navigate = useNavigate();

  const isOwner = user && (requestPost.user?._id || requestPost.user) === user._id;
  const isMember = requestPost.isUserMember;
  const joinRequestStatus = requestPost.userJoinRequestStatus;

  const handleDelete = async () => {
    if (!window.confirm('Delete this order post? It will be immediately removed from the active feed and archived to your Order History.')) return;
    try {
      await API.delete(`/requests/${requestPost._id}`);
      if (onPostDeleted) onPostDeleted();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order post');
    }
  };

  // Calculate live savings preview if viewing user has an active cart
  let livePreview = null;
  if (activeCart && activeCart.totalMrp > 0 && !isOwner) {
    const totalMrpCombined = requestPost.totalMrp + activeCart.totalMrp;
    const projectedCombinedTotal = totalMrpCombined + 35;
    const userShareRatio = activeCart.totalMrp / totalMrpCombined;
    const userFinalPayment = Math.round(userShareRatio * projectedCombinedTotal * 100) / 100;
    const userSavings = Math.round((activeCart.standaloneTotal - userFinalPayment) * 100) / 100;

    livePreview = {
      combinedTotal: projectedCombinedTotal,
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

  const posterName = requestPost.user?.name || 'Blinkit Shopper';
  const posterCustomId = requestPost.user?.customId || '#CM-84920';
  const posterCompletedOrders = requestPost.user?.completedOrdersCount || 0;
  const posterRating = requestPost.user?.averageRating || 5.0;
  const orderNumber = requestPost.orderNumber || `#CM-ORD-${requestPost._id.slice(-5).toUpperCase()}`;

  return (
    <div className="request-card">
      <div>
        {/* Top Header */}
        <div className="card-header">
          <div className="user-info">
            <div className="avatar">{posterName.charAt(0)}</div>
            <div>
              <div className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {posterName}
                <span style={{ fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  {posterCustomId}
                </span>
              </div>
              <div className="user-location">
                <MapPin size={11} style={{ color: 'var(--blinkit-yellow)' }} /> {requestPost.localityName}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            <span className="distance-badge">{requestPost.distanceKm !== undefined ? `${requestPost.distanceKm} km` : '0.2 km'}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--blinkit-yellow)', fontWeight: '700', letterSpacing: '0.3px' }}>
              {orderNumber}
            </span>
          </div>
        </div>

        {/* Status & Trust Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.6rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span className={`status-badge ${requestPost.status === 'OPEN' ? 'status-open' : requestPost.status === 'FULL' ? 'status-full' : 'status-closed'}`}>
              {requestPost.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Users size={12} /> {requestPost.participantCount || 1}/4 Members
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.15rem', fontWeight: '700' }}>
              <ShieldCheck size={13} /> {posterCompletedOrders} Done
            </span>
            <span style={{ color: 'var(--blinkit-yellow)', display: 'flex', alignItems: 'center', gap: '0.1rem', fontWeight: '700' }}>
              <Star size={11} style={{ fill: 'var(--blinkit-yellow)' }} /> {posterRating}
            </span>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', margin: '0.6rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Host Cart MRP:</span>
            <strong style={{ color: 'var(--blinkit-yellow)' }}>₹{requestPost.totalMrp}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Standalone Fee Alone:</span>
            <strong>₹{requestPost.standaloneTotal}</strong>
          </div>

          {requestPost.items && requestPost.items.length > 0 && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>Items:</strong> {requestPost.items.map((i) => i.name).join(', ')}
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
              Combined Total: ₹{livePreview.combinedTotal} | Your Split: <strong>₹{livePreview.userFinalPayment}</strong> (vs ₹{activeCart.standaloneTotal} alone)
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
          <Clock size={12} /> Deadline: {formatDeadline(requestPost.deadline)}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {isOwner ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate(`/groups/${requestPost.groupId || requestPost._id}`)}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
            >
              Manage Order <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate(`/edit-request/${requestPost._id}`)}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.7rem' }}
              title="Edit Entire Order Post"
            >
              <Edit size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger"
              style={{ padding: '0.5rem 0.7rem' }}
              title="Delete Order (Saved to History)"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : isMember ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate(`/groups/${requestPost.groupId || requestPost._id}`)}
              className="btn-success"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
            >
              <CheckCircle size={15} /> Joined — Open Group & Chat
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Clearly Visible Request to Join Button separate from Chat */}
            {joinRequestStatus === 'PENDING' ? (
              <button
                disabled
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', opacity: 0.8, fontSize: '0.82rem', borderColor: 'var(--blinkit-yellow)' }}
              >
                ⏳ Join Request Pending
              </button>
            ) : (
              <button
                onClick={() => onOpenJoinModal(requestPost)}
                className="btn-success"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
              >
                <UserPlus size={15} /> Request to Join Order
              </button>
            )}

            <button
              onClick={() => navigate(`/groups/${requestPost.groupId || requestPost._id}`)}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem' }}
              title="View Group & Chat Room"
            >
              <MessageSquare size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
