import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, PlusCircle, LogOut, User as UserIcon, MapPin, Sun, Moon, Sparkles } from 'lucide-react';

export const Navbar = ({ onOpenActiveCartModal }) => {
  const { user, logout, activeCart, theme, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          🛒 Cartmate <span className="brand-badge">Blinkit Group</span>
        </Link>

        {user ? (
          <div className="nav-links">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Toggle Deep Space / Cloud Light Theme"
            >
              {theme === 'dark-space' ? (
                <>
                  <Moon size={15} style={{ color: 'var(--blinkit-yellow)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Dark Space</span>
                </>
              ) : (
                <>
                  <Sun size={15} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Cloud Light</span>
                </>
              )}
            </button>

            {/* Active Cart Session Selector */}
            <button
              className="btn-secondary"
              onClick={onOpenActiveCartModal}
              title="Switch or Edit Active Cart Session"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShoppingBag size={15} style={{ color: 'var(--blinkit-yellow)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                {activeCart ? activeCart.name : 'Active Cart'}: ₹{activeCart ? activeCart.totalMrp : 0}
              </span>
            </button>

            {/* Post Order Button */}
            <Link to="/new-request" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
              <PlusCircle size={16} /> Post Order
            </Link>

            {/* User Profile Badge */}
            <Link to="/profile" className="user-info" style={{ marginLeft: '0.3rem', cursor: 'pointer' }} title="Go to My Profile">
              <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div>
                <div className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                  {user.name}
                  <span style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                    {user.customId || '#CM-10001'}
                  </span>
                </div>
                <div className="user-location" style={{ fontSize: '0.74rem' }}>
                  <MapPin size={11} style={{ color: 'var(--blinkit-yellow)' }} /> {user.localityName || 'NIT Jamshedpur'}
                </div>
              </div>
            </Link>

            <button onClick={handleLogout} className="btn-secondary" title="Logout" style={{ padding: '0.5rem 0.7rem' }}>
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {theme === 'dark-space' ? <Moon size={15} style={{ color: 'var(--blinkit-yellow)' }} /> : <Sun size={15} style={{ color: 'var(--accent-blue)' }} />}
            </button>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
