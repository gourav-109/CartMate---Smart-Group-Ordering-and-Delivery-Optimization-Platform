import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { CostSplitTable } from '../components/CostSplitTable';
import { ChatBox } from '../components/ChatBox';
import { JoinRequestsReviewDrawer } from '../components/JoinRequestsReviewDrawer';
import { Users, MapPin, Clock, ArrowLeft, CheckCircle, AlertCircle, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';

export const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);

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
        <h2>Group Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error || 'This order group does not exist.'}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Feed
        </button>
      </div>
    );
  }

  const isOwner = user && group.owner?._id === user._id;

  const handleUpdateStatus = async (newStatus) => {
    try {
      await API.patch(`/requests/${group.request?._id || group.request}/status`, { status: newStatus });
      fetchGroup();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const participantCount = group.participants ? group.participants.length : 1;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} className="btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Feed
      </button>

      {/* Header Banner */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--blinkit-yellow)' }}>
                🛒 Combined Blinkit Order Group
              </h2>
              <span className={`status-badge ${group.status === 'MATCHED' ? 'status-open' : group.status === 'COMPLETED' ? 'status-full' : 'status-closed'}`}>
                {group.status}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>📍 Locality: <strong>{group.request?.localityName || 'Koramangala'}</strong></span>
              <span>👤 Poster: <strong>{group.owner?.name}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users size={14} /> <strong>{participantCount} / 4</strong> Members
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={fetchGroup} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }} title="Refresh Group">
              <RefreshCw size={16} />
            </button>

            {isOwner && (
              <>
                <button onClick={() => setIsReviewDrawerOpen(true)} className="btn-success">
                  <UserCheck size={16} /> Review Join Requests
                </button>
                {group.status !== 'COMPLETED' && group.status !== 'CLOSED' && (
                  <button onClick={() => handleUpdateStatus('COMPLETED')} className="btn-primary">
                    <CheckCircle size={16} /> Mark Completed
                  </button>
                )}
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
                    background: isCompletedStep ? 'var(--blinkit-yellow)' : '#334155',
                    color: isCompletedStep ? '#0f172a' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
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
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blinkit-yellow)', marginBottom: '0.2rem' }}>
            <MapPin size={18} /> Suggested Geographic Midpoint Meeting Spot
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Calculated ideal midpoint across members' current locations: <strong>[{group.suggestedMidpoint?.coordinates ? group.suggestedMidpoint.coordinates.join(', ') : '77.6245, 12.9352'}]</strong>
          </p>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            💡 <em>Note: Participants can freely discuss and finalize any convenient meeting spot in the chat below.</em>
          </div>
        </div>
      </div>

      {/* Main Grid: Cost Split & Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Cost Split Matrix */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem' }}>
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
    </div>
  );
};
