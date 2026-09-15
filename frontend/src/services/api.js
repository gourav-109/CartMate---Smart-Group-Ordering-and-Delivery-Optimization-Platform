import axios from 'axios';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cartmate-smart-group-ordering-and.onrender.com').replace(/\/$/, '');

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cartmate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
