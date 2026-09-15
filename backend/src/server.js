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
import User from './models/User.js';
import { seedData } from './seed.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cartmate Backend Service Operational' });
});

// Setup Socket.IO
setupSocketIO(io);

// Connect DB and launch server
const startServer = async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Running automatic initial seed...');
      await seedData();
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Cartmate Server running on http://localhost:${PORT}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

startServer();
