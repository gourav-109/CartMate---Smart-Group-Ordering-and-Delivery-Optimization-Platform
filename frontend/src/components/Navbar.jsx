import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, PlusCircle, LogOut, User, MapPin } from 'lucide-react';

export const Navbar = ({ onOpenActiveCartModal }) => {
  const { user, logout, activeCart } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          🛒 CartMate <span className="brand-badge">Blinkit SIH</span>
        </Link>

        {user ? (
          <div className="nav-links">
            <button
              className="btn-secondary"
              onClick={onOpenActiveCartModal}
              title="Set your active Blinkit cart to see live savings previews"
            >
              <ShoppingBag size={16} style={{ color: 'var(--blinkit-yellow)' }} />
              Active Cart: ₹{activeCart ? activeCart.totalMrp : 0} MRP
            </button>

            <Link to="/new-request" className="btn-primary">
              <PlusCircle size={16} /> Post Order
            </Link>

            <div className="user-info" style={{ marginLeft: '0.5rem' }}>
              <div className="avatar">{user.name.charAt(0)}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-location">
                  <MapPin size={12} /> {user.localityName || 'Koramangala'}
                </div>
              </div>
            </div>

            <button onClick={handleLogout} className="btn-secondary" title="Logout" style={{ padding: '0.6rem' }}>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="nav-links">
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
