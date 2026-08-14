import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cartmate_token') || null);
  const [loading, setLoading] = useState(true);

  // Active floating Blinkit cart for live savings calculation on feed
  const [activeCart, setActiveCart] = useState(() => {
    const saved = localStorage.getItem('cartmate_active_cart');
    return saved ? JSON.parse(saved) : { totalMrp: 123, standaloneTotal: 158, items: [{ name: 'Blinkit Sample Basket', mrp: 123 }] };
  });

  useEffect(() => {
    if (activeCart) {
      localStorage.setItem('cartmate_active_cart', JSON.stringify(activeCart));
    } else {
      localStorage.removeItem('cartmate_active_cart');
    }
  }, [activeCart]);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('cartmate_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (formData) => {
    const res = await API.post('/auth/signup', formData);
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('cartmate_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('cartmate_token');
    setToken(null);
    setUser(null);
  };

  const updateActiveCart = (cartData) => {
    setActiveCart(cartData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        activeCart,
        updateActiveCart
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
