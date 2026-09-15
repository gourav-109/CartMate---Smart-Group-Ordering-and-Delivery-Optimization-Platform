import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cartmate_token') || null);
  const [loading, setLoading] = useState(true);

  // Theme State ('dark-space' or 'light-cloud')
  const [theme, setTheme] = useState(() => localStorage.getItem('cartmate_theme') || 'dark-space');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cartmate_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark-space' ? 'light-cloud' : 'dark-space'));
  };

  // Multi-cart Active Sessions Management
  const [savedCarts, setSavedCarts] = useState(() => {
    const saved = localStorage.getItem('cartmate_saved_carts');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 'cart-1', name: 'Evening Hostel Snacks', totalMrp: 123, standaloneTotal: 158 },
          { id: 'cart-2', name: 'Late Night Munchies', totalMrp: 240, standaloneTotal: 275 },
          { id: 'cart-3', name: 'Daily Milk & Grocery', totalMrp: 93, standaloneTotal: 128 }
        ];
  });

  const [activeCartId, setActiveCartId] = useState(() => {
    return localStorage.getItem('cartmate_active_cart_id') || 'cart-1';
  });

  useEffect(() => {
    localStorage.setItem('cartmate_saved_carts', JSON.stringify(savedCarts));
  }, [savedCarts]);

  useEffect(() => {
    localStorage.setItem('cartmate_active_cart_id', activeCartId);
  }, [activeCartId]);

  const activeCart = savedCarts.find((c) => c.id === activeCartId) || savedCarts[0] || {
    id: 'cart-default',
    name: 'Default Cart',
    totalMrp: 123,
    standaloneTotal: 158
  };

  const addSavedCart = (newCart) => {
    const cartObj = {
      id: `cart-${Date.now()}`,
      name: newCart.name || `Cart ${savedCarts.length + 1}`,
      totalMrp: parseFloat(newCart.totalMrp) || 0,
      standaloneTotal: parseFloat(newCart.standaloneTotal) || 0
    };
    setSavedCarts((prev) => [...prev, cartObj]);
    setActiveCartId(cartObj.id);
  };

  const updateActiveCart = (updatedCartData) => {
    setSavedCarts((prev) =>
      prev.map((c) =>
        c.id === activeCart.id
          ? {
              ...c,
              totalMrp: parseFloat(updatedCartData.totalMrp),
              standaloneTotal: parseFloat(updatedCartData.standaloneTotal),
              name: updatedCartData.name || c.name
            }
          : c
      )
    );
  };

  const deleteSavedCart = (cartId) => {
    if (savedCarts.length <= 1) return; // Keep at least one cart
    const filtered = savedCarts.filter((c) => c.id !== cartId);
    setSavedCarts(filtered);
    if (activeCartId === cartId) {
      setActiveCartId(filtered[0].id);
    }
  };

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

  const updateUserProfile = (updatedData) => {
    setUser(updatedData);
  };

  const logout = () => {
    localStorage.removeItem('cartmate_token');
    setToken(null);
    setUser(null);
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
        updateUserProfile,
        theme,
        toggleTheme,
        savedCarts,
        activeCart,
        activeCartId,
        setActiveCartId,
        addSavedCart,
        updateActiveCart,
        deleteSavedCart
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
