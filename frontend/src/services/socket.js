import { io } from 'socket.io-client';

const URL = (import.meta.env.VITE_BACKEND_URL || 'https://cartmate-smart-group-ordering-and.onrender.com').replace(/\/$/, '');

export const socket = io(URL, {
  autoConnect: false
});
