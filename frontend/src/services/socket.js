import { io } from 'socket.io-client';

const URL = window.location.origin.replace('5173', '5000');

export const socket = io(URL, {
  autoConnect: false
});
