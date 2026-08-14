import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Request from './models/Request.js';
import Group from './models/Group.js';
import Message from './models/Message.js';
import JoinRequest from './models/JoinRequest.js';

dotenv.config();

export const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Request.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
    await JoinRequest.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Creating demo users...');
    const user1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: passwordHash,
      localityName: 'Koramangala 4th Block, Bengaluru',
      location: { type: 'Point', coordinates: [77.6245, 12.9352] }
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: passwordHash,
      localityName: 'Koramangala 5th Block, Bengaluru',
      location: { type: 'Point', coordinates: [77.6210, 12.9320] } // ~400 meters away
    });

    const user3 = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: passwordHash,
      localityName: 'Koramangala 6th Block, Bengaluru',
      location: { type: 'Point', coordinates: [77.6280, 12.9380] } // ~600 meters away
    });

    const user4 = await User.create({
      name: 'Ananya Gupta',
      email: 'ananya@example.com',
      password: passwordHash,
      localityName: 'HSR Layout Sector 1, Bengaluru',
      location: { type: 'Point', coordinates: [77.6350, 12.9120] } // ~2.8 km away
    });

    console.log('Creating demo Blinkit order requests...');
    const now = new Date();
    const deadlineToday = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours from now

    // Request 1: Exact User Example (Aarav - MRP 93, standalone 128)
    const req1 = await Request.create({
      user: user1._id,
      store: 'Blinkit',
      totalMrp: 93,
      standaloneTotal: 128,
      combinedOrderTotal: 221,
      localityName: 'Koramangala 4th Block, Bengaluru',
      deadline: deadlineToday,
      items: [
        { name: 'Amul Taaza Milk 500ml', mrp: 27 },
        { name: 'Britannia Whole Wheat Bread', mrp: 45 },
        { name: 'Maggie 2-Min Noodles 4-Pack', mrp: 21 }
      ],
      status: 'OPEN',
      location: user1.location
    });

    const group1 = await Group.create({
      request: req1._id,
      owner: user1._id,
      combinedOrderTotal: 221,
      sharedHandlingFee: 35,
      status: 'PENDING',
      participants: [
        {
          user: user1._id,
          totalMrp: 93,
          standaloneTotal: 128,
          items: [
            { name: 'Amul Taaza Milk 500ml', mrp: 27 },
            { name: 'Britannia Whole Wheat Bread', mrp: 45 },
            { name: 'Maggie 2-Min Noodles 4-Pack', mrp: 21 }
          ],
          shareRatio: 0.4306,
          finalPayment: 95.15,
          savings: 32.85,
          settled: false
        }
      ],
      meetingPoint: {
        name: 'Sony World Junction, Koramangala 4th Block',
        coordinates: [77.6245, 12.9352]
      },
      suggestedMidpoint: {
        name: 'Suggested Midpoint (Sony World)',
        coordinates: [77.6245, 12.9352]
      }
    });

    // Request 2: Priya (Koramangala 5th Block)
    const req2 = await Request.create({
      user: user2._id,
      store: 'Blinkit',
      totalMrp: 180,
      standaloneTotal: 215,
      combinedOrderTotal: 310,
      localityName: 'Koramangala 5th Block, Bengaluru',
      deadline: new Date(now.getTime() + 8 * 60 * 60 * 1000),
      items: [
        { name: 'Fortune Sunlite Oil 1L', mrp: 140 },
        { name: 'Catch Red Chilli Powder 100g', mrp: 40 }
      ],
      status: 'OPEN',
      location: user2.location
    });

    await Group.create({
      request: req2._id,
      owner: user2._id,
      combinedOrderTotal: 310,
      sharedHandlingFee: 35,
      status: 'PENDING',
      participants: [
        {
          user: user2._id,
          totalMrp: 180,
          standaloneTotal: 215,
          items: [
            { name: 'Fortune Sunlite Oil 1L', mrp: 140 },
            { name: 'Catch Red Chilli Powder 100g', mrp: 40 }
          ],
          settled: false
        }
      ],
      meetingPoint: {
        name: 'Koramangala 5th Block Post Office',
        coordinates: [77.6210, 12.9320]
      }
    });

    // Request 3: Rohan (Koramangala 6th Block)
    const req3 = await Request.create({
      user: user3._id,
      store: 'Blinkit',
      totalMrp: 310,
      standaloneTotal: 345,
      combinedOrderTotal: 490,
      localityName: 'Koramangala 6th Block, Bengaluru',
      deadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      items: [
        { name: 'Ferrero Rocher 16 Pieces', mrp: 310 }
      ],
      status: 'OPEN',
      location: user3.location
    });

    await Group.create({
      request: req3._id,
      owner: user3._id,
      combinedOrderTotal: 490,
      sharedHandlingFee: 35,
      status: 'PENDING',
      participants: [
        {
          user: user3._id,
          totalMrp: 310,
          standaloneTotal: 345,
          items: [{ name: 'Ferrero Rocher 16 Pieces', mrp: 310 }],
          settled: false
        }
      ],
      meetingPoint: {
        name: 'Jyoti Nivas College Gate, Koramangala 6th Block',
        coordinates: [77.6280, 12.9380]
      }
    });

    console.log('Seed database completed successfully!');
    console.log('Sample Users (password for all: password123):');
    console.log('1. aarav@example.com (Koramangala 4th Block)');
    console.log('2. priya@example.com (Koramangala 5th Block)');
    console.log('3. rohan@example.com (Koramangala 6th Block)');
    console.log('4. ananya@example.com (HSR Layout Sector 1)');
  } catch (error) {
    console.error('Seed script error:', error);
  }
};

