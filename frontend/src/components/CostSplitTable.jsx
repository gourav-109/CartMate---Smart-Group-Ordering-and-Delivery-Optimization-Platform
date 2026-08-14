import React from 'react';
import API from '../services/api';
import { CheckCircle2, Circle, TrendingDown } from 'lucide-react';

export const CostSplitTable = ({ groupId, participants, combinedOrderTotal, onStatusToggled }) => {
  const handleToggleSettled = async (userId) => {
    try {
      await API.patch(`/groups/${groupId}/toggle-settled`, { userId });
      if (onStatusToggled) onStatusToggled();
    } catch (err) {
      console.error('Failed to toggle settled status:', err);
    }
  };

  const totalMrp = participants.reduce((sum, p) => sum + (p.totalMrp || 0), 0);

  return (
    <div className="table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ color: 'var(--blinkit-yellow)' }}>Proportional Cost Split Matrix</h4>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Combined Checkout Total: <strong>₹{combinedOrderTotal}</strong>
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Items MRP</th>
            <th>Proportional Share</th>
            <th>Final Payment</th>
            <th>Net Savings</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => {
            const sharePct = totalMrp > 0 ? ((p.totalMrp / totalMrp) * 100).toFixed(1) : 0;
            return (
              <tr key={p._id || p.user?._id}>
                <td>
                  <strong>{p.user?.name || 'Member'}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.localityName}</div>
                </td>
                <td>₹{p.totalMrp}</td>
                <td>{sharePct}%</td>
                <td>
                  <strong style={{ color: 'var(--blinkit-yellow)', fontSize: '1rem' }}>₹{p.finalPayment || 0}</strong>
                </td>
                <td>
                  <span style={{ color: 'var(--savings-green)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <TrendingDown size={14} /> ₹{p.savings || 0}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleSettled(p.user?._id || p._id)}
                    className="btn-secondary"
                    style={{
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: p.settled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 203, 70, 0.1)',
                      color: p.settled ? '#4ade80' : 'var(--blinkit-yellow)',
                      border: p.settled ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(248, 203, 70, 0.3)'
                    }}
                  >
                    {p.settled ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {p.settled ? 'Settled' : 'Pending'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
