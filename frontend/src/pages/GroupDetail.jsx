import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { CostSplitTable } from '../components/CostSplitTable';
import { ChatBox } from '../components/ChatBox';
import { JoinRequestsReviewDrawer } from '../components/JoinRequestsReviewDrawer';
import { JoinRequestModal } from '../components/JoinRequestModal';
import { RateUserModal } from '../components/RateUserModal';
import { Users, MapPin, Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle, RefreshCw, UserCheck, Trash2, Edit, UserPlus, Star } from 'lucide-react';

export const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedUserToRate, setSelectedUserToRate] = useState(null);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchGroup();
    }
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading group details...</div>;
  }

  if (error || !group) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#f87171', marginBottom: '1rem' }} />
        <h2>Order Group Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error || 'This order group does not exist.'}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Feed
        </button>
      </div>
    );
  }

  const isOwner = user && (group.owner?._id || group.owner) === user._id;
  const isMember = group.isUserMember || group.participants?.some((p) => (p.user?._id || p.user)?.toString() === user?._id?.toString());
  const myParticipantObj = group.participants?.find((p) => (p.user?._id || p.user)?.toString() === user?._id?.toString());
  const participantCount = group.participants ? group.participants.length : 1;
  const orderNumber = group.request?.orderNumber || `#CM-ORD-${(group.request?._id || group._id).slice(-5).toUpperCase()}`;

  const handleUpdateStatus = async (newStatus) => {
    try {
      await API.patch(`/requests/${group.request?._id || group.request}/status`, { status: newStatus });
      fetchGroup();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this order post? It will be removed from the active feed and archived in your Order History.')) return;
    try {
      await API.delete(`/requests/${group.request?._id || group.request}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order post');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Feed
      </button>

      {/* Personalized Member Savings Card */}
      {myParticipantObj && (
        <div style={{ background: 'var(--savings-green-bg)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: 'var(--savings-green)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800' }}>
              🎉 You are saving ₹{myParticipantObj.savings} on this order!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Your items total MRP is <strong>₹{myParticipantObj.itemMRP || myParticipantObj.totalMrp}</strong>. Standalone checkout alone would have cost you <strong>₹{myParticipantObj.standaloneTotalAlone || myParticipantObj.standaloneTotal}</strong>.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Your Split Payment:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--blinkit-yellow)', marginTop: '0.15rem' }}>₹{myParticipantObj.finalPayment}</div>
          </div>
        </div>
      )}

      {/* Non-member Join Callout Banner */}
      {!isOwner && !isMember && (
        <div style={{ background: 'linear-gradient(135deg, rgba(248, 203, 70, 0.2), rgba(16, 185, 129, 0.2))', border: '1px solid var(--blinkit-yellow)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: 'var(--blinkit-yellow)', fontSize: '1.15rem', marginBottom: '0.2rem' }}>
              Want to split delivery & packaging fees on this Blinkit order?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Send a join request with your cart MRP to be added to this combined checkout!
            </p>
          </div>

          {group.userJoinRequest?.status === 'PENDING' ? (
            <button disabled className="btn-secondary" style={{ borderColor: 'var(--blinkit-yellow)', color: 'var(--blinkit-yellow)' }}>
              ⏳ Join Request Pending Host Approval
            </button>
          ) : (
            <button onClick={() => setIsJoinModalOpen(true)} className="btn-success" style={{ padding: '0.7rem 1.4rem', fontSize: '0.95rem' }}>
              <UserPlus size={18} /> Request to Join Order
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--blinkit-yellow)' }}>
                🛒 Combined Blinkit Order Group
              </h2>
              <span style={{ background: 'rgba(248, 203, 70, 0.15)', color: 'var(--blinkit-yellow)', fontWeight: '800', fontSize: '0.82rem', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(248, 203, 70, 0.4)' }}>
                {orderNumber}
              </span>
              <span className={`status-badge ${group.status === 'MATCHED' ? 'status-open' : group.status === 'COMPLETED' ? 'status-full' : 'status-closed'}`}>
                {group.status}
              </span>
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span>📍 Locality: <strong>{group.request?.localityName || 'Hostel 1, NIT Jamshedpur'}</strong></span>
              <span>👤 Host: <strong>{group.owner?.name}</strong> ({group.owner?.customId || '#CM-84920'})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users size={14} /> <strong>{participantCount} / 4</strong> Members
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={fetchGroup} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }} title="Refresh Group">
              <RefreshCw size={16} />
            </button>

            {isOwner && (
              <>
                <button onClick={() => navigate(`/edit-request/${group.request?._id || group.request}`)} className="btn-secondary">
                  <Edit size={15} /> Edit Order
                </button>
                <button onClick={() => setIsReviewDrawerOpen(true)} className="btn-success">
                  <UserCheck size={15} /> Join Requests
                </button>
                {group.status !== 'COMPLETED' && (
                  <button onClick={() => handleUpdateStatus('COMPLETED')} className="btn-primary" title="Mark order completed at any member count">
                    <CheckCircle size={15} /> Mark Completed
                  </button>
                )}
                {group.status !== 'CLOSED' && group.status !== 'COMPLETED' && (
                  <button onClick={() => handleUpdateStatus('CLOSED')} className="btn-secondary" title="Stop accepting new members">
                    <XCircle size={15} /> Mark Closed
                  </button>
                )}
                <button onClick={handleDeletePost} className="btn-danger" title="Delete Post (Saved to History)">
                  <Trash2 size={15} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Lifecycle Stepper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', position: 'relative' }}>
          {['PENDING', 'MATCHED', 'ORDER_PLACED', 'COMPLETED'].map((step, idx) => {
            const stepOrder = ['PENDING', 'MATCHED', 'ORDER_PLACED', 'COMPLETED'];
            const currentIndex = stepOrder.indexOf(group.status);
            const isCompletedStep = idx <= currentIndex;

            return (
              <div key={step} style={{ textAlign: 'center', zIndex: 2 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCompletedStep ? 'var(--blinkit-yellow)' : 'var(--bg-dark)',
                    border: isCompletedStep ? 'none' : '1px solid var(--border-color)',
                    color: isCompletedStep ? '#090d16' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    margin: '0 auto 0.4rem auto'
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: isCompletedStep ? '700' : '400', color: isCompletedStep ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {step.replace('_', ' ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Meeting Spot Section */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blinkit-yellow)', marginBottom: '0.2rem', fontSize: '0.95rem' }}>
            <MapPin size={17} /> Suggested Campus Midpoint Meeting Spot
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Calculated ideal midpoint across members' locations: <strong>[{group.suggestedMidpoint?.coordinates ? group.suggestedMidpoint.coordinates.join(', ') : '86.1438, 22.7780'}]</strong>
          </p>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            💡 <em>Hostel residents can freely agree on any convenient pickup location (e.g. Hostel 1 Common Room or Gate) in the chat below.</em>
          </div>
        </div>

        {/* Member Rating Button if completed */}
        {group.status === 'COMPLETED' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {group.participants
              .filter((p) => (p.user?._id || p.user) !== user?._id)
              .map((p) => {
                const targetObj = p.user && typeof p.user === 'object' ? p.user : { _id: p.user, name: p.userName || 'Member' };
                return (
                  <button
                    key={targetObj._id}
                    onClick={() => setSelectedUserToRate(targetObj)}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', borderColor: 'var(--blinkit-yellow)', color: 'var(--blinkit-yellow)' }}
                  >
                    <Star size={13} style={{ fill: 'var(--blinkit-yellow)' }} /> Rate {targetObj.name?.split(' ')[0]}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Main Grid: Cost Split & Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Cost Split Matrix */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem' }}>
          <CostSplitTable
            groupId={group._id}
            participants={group.participants || []}
            combinedOrderTotal={group.combinedOrderTotal}
            onStatusToggled={fetchGroup}
          />
        </div>

        {/* Real-time Group Chat */}
        <ChatBox groupId={group._id} />
      </div>

      {/* Join Requests Drawer for Postee */}
      <JoinRequestsReviewDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        requestId={group.request?._id || group.request}
        onParticipantAccepted={() => {
          fetchGroup();
        }}
      />

      {/* Join Request Modal for Non-Members */}
      {group.request && (
        <JoinRequestModal
          isOpen={isJoinModalOpen}
          requestPost={{ ...group.request, user: group.owner }}
          onClose={() => setIsJoinModalOpen(false)}
          onSuccess={() => {
            setIsJoinModalOpen(false);
            fetchGroup();
          }}
        />
      )}

      {/* Rate Member Modal */}
      <RateUserModal
        isOpen={Boolean(selectedUserToRate)}
        targetUser={selectedUserToRate}
        onClose={() => setSelectedUserToRate(null)}
        onSuccess={() => {
          fetchGroup();
        }}
      />
    </div>
  );
};
