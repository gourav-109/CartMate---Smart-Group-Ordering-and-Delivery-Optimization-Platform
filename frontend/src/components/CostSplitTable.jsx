import React from 'react';
import API from '../services/api';
import { CheckCircle2, Circle, TrendingDown, Star } from 'lucide-react';

export const CostSplitTable = ({ groupId, participants, combinedOrderTotal, onStatusToggled }) => {
  const handleToggleSettled = async (userId) => {
    try {
      await API.patch(`/groups/${groupId}/toggle-settled`, { userId });
      if (onStatusToggled) onStatusToggled();
    } catch (err) {
      console.error('Failed to toggle settled status:', err);
    }
  };

  const totalMrpCombined = participants.reduce(
    (sum, p) => sum + (p.itemMRP !== undefined ? p.itemMRP : (p.totalMrp || 0)),
    0
  );

  return (
    <div className="table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ color: 'var(--blinkit-yellow)', fontSize: '1.05rem', fontWeight: '800' }}>
          📊 Proportional Cost Split Matrix
        </h4>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Combined Checkout Total: <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>₹{combinedOrderTotal}</strong>
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Items MRP</th>
            <th>Proportional Share</th>
            <th>Final Payment</th>
            <th>Net Savings</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, idx) => {
            const rawUser = p.user;
            const userName =
              p.userName ||
              (rawUser && typeof rawUser === 'object' ? rawUser.name : null) ||
              'Blinkit Member';
            const customId =
              (rawUser && typeof rawUser === 'object' ? rawUser.customId : null) ||
              p.customId ||
              `#CM-${84920 + idx}`;
            const locality =
              (rawUser && typeof rawUser === 'object' ? rawUser.localityName : null) ||
              'Hostel 1, NIT JSR';
            const userRating =
              (rawUser && typeof rawUser === 'object' ? rawUser.averageRating : null) || 5.0;

            const currentItemMRP = p.itemMRP !== undefined ? p.itemMRP : p.totalMrp;
            const sharePct = totalMrpCombined > 0 ? ((currentItemMRP / totalMrpCombined) * 100).toFixed(1) : 0;
            const userId = rawUser && typeof rawUser === 'object' ? rawUser._id : (rawUser || p._id);
            const isPaid = p.settled || p.paymentStatus === 'PAID';

            return (
              <tr key={userId || idx}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="avatar" style={{ width: '34px', height: '34px', fontSize: '0.88rem' }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)' }}>{userName}</strong>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                          {customId}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                        <span>📍 {locality}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--blinkit-yellow)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          <Star size={11} style={{ fill: 'var(--blinkit-yellow)' }} /> {userRating}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <strong style={{ fontSize: '0.92rem' }}>₹{currentItemMRP}</strong>
                </td>
                <td>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>{sharePct}%</span>
                </td>
                <td>
                  <strong style={{ color: 'var(--blinkit-yellow)', fontSize: '1.05rem' }}>₹{p.finalPayment || 0}</strong>
                </td>
                <td>
                  <span style={{ color: 'var(--savings-green)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <TrendingDown size={14} /> ₹{p.savings || 0}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleSettled(userId)}
                    className="btn-secondary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 203, 70, 0.12)',
                      color: isPaid ? '#34d399' : 'var(--blinkit-yellow)',
                      border: isPaid ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(248, 203, 70, 0.3)'
                    }}
                  >
                    {isPaid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {isPaid ? 'Settled' : 'Pending'}
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
