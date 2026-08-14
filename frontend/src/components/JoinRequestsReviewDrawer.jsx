import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UserCheck, UserX, X, AlertCircle } from 'lucide-react';

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
      if (action === 'ACCEPT') {
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
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Review Participant Requests</h3>
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
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No join requests received yet. Nearby users can send requests from their feed!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {requests.map((reqItem) => (
              <div
                key={reqItem._id}
                style={{
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{reqItem.applicant?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {reqItem.applicant?.localityName}</div>
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

                <div style={{ fontSize: '0.85rem', margin: '0.5rem 0', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div>
                    <strong>Items MRP:</strong> ₹{reqItem.totalMrp} | <strong>Standalone Total:</strong> ₹{reqItem.standaloneTotal}
                  </div>
                  {reqItem.message && <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>"{reqItem.message}"</div>}
                </div>

                {reqItem.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => handleRespond(reqItem._id, 'REJECT')}
                      disabled={actionLoading === reqItem._id}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <UserX size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleRespond(reqItem._id, 'ACCEPT')}
                      disabled={actionLoading === reqItem._id}
                      className="btn-success"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <UserCheck size={14} /> Accept & Add to Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
