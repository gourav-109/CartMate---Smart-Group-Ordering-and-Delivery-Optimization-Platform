import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { setupSocketIO } from './socket/chatSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Connect Database and auto-seed if empty
await connectDB();
try {
  const User = (await import('./models/User.js')).default;
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Database empty. Running automatic initial seed...');
    const { seedData } = await import('./seed.js');
    if (typeof seedData === 'function') await seedData();
  }
} catch (err) {
  console.log('Auto-seed check error:', err.message);
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', chatRoutes);

// Root route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CartMate Backend Service Operational' });
});

// Setup Socket.IO
setupSocketIO(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 CartMate Server running on http://localhost:${PORT}`);
  console.log(`=================================================`);
});
