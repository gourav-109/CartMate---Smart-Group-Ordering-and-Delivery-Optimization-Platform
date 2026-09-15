import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UserCheck, UserX, X, AlertCircle, Star } from 'lucide-react';

export const JoinRequestsReviewDrawer = ({ isOpen, onClose, requestId, onParticipantAccepted }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const res = await API.get(`/requests/${requestId}/join-requests`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen, requestId]);

  if (!isOpen) return null;

  const handleRespond = async (joinRequestId, action) => {
    setActionLoading(joinRequestId);
    setError('');

    try {
      await API.patch(`/requests/${requestId}/respond-request`, {
        joinRequestId,
        action
      });

      fetchRequests();
      if (action === 'ACCEPT' && onParticipantAccepted) {
        onParticipantAccepted();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action.toLowerCase()} request`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--blinkit-yellow)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={20} /> Review Participant Join Requests
          </h3>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No join requests received yet. Nearby NIT Jamshedpur hostel residents can send requests from their feed!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
            {requests.map((reqItem) => {
              const applicantName = reqItem.applicant?.name || 'Applicant';
              const customId = reqItem.applicant?.customId || '#CM-84920';
              const locality = reqItem.applicant?.localityName || 'NIT Jamshedpur';
              const rating = reqItem.applicant?.averageRating || 5.0;

              return (
                <div
                  key={reqItem._id}
                  style={{
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                        {applicantName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '0.96rem' }}>{applicantName}</strong>
                          <span style={{ fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                            {customId}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <span>📍 {locality}</span>
                          <span>•</span>
                          <span style={{ color: 'var(--blinkit-yellow)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                            <Star size={11} style={{ fill: 'var(--blinkit-yellow)' }} /> {rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`status-badge ${
                        reqItem.status === 'ACCEPTED'
                          ? 'status-open'
                          : reqItem.status === 'REJECTED'
                          ? 'status-closed'
                          : 'status-full'
                      }`}
                    >
                      {reqItem.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', margin: '0.5rem 0', background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                    <div>
                      Cart MRP: <strong style={{ color: 'var(--blinkit-yellow)' }}>₹{reqItem.totalMrp}</strong> | Standalone Price: <strong>₹{reqItem.standaloneTotal}</strong>
                    </div>
                    {reqItem.message && <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic', fontSize: '0.8rem' }}>"{reqItem.message}"</div>}
                  </div>

                  {reqItem.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <button
                        onClick={() => handleRespond(reqItem._id, 'REJECT')}
                        disabled={actionLoading === reqItem._id}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        <UserX size={14} /> Reject
                      </button>
                      <button
                        onClick={() => handleRespond(reqItem._id, 'ACCEPT')}
                        disabled={actionLoading === reqItem._id}
                        className="btn-success"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        <UserCheck size={14} /> Accept & Add to Order
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
