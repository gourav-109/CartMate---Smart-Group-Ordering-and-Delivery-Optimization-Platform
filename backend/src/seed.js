import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import url from 'url';
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

    console.log('Creating demo users at NIT Jamshedpur...');
    const user1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: passwordHash,
      customId: 'CM-84920',
      completedOrdersCount: 14,
      localityName: 'Hostel 1, NIT Jamshedpur',
      bio: 'B.Tech 3rd Year CSE | Frequent late-night snack group orderer',
      averageRating: 4.9,
      ratings: [
        {
          fromUserName: 'Priya Patel',
          score: 5,
          comment: 'Super fast settlement on UPI and met right at Hostel 1 entrance!'
        },
        {
          fromUserName: 'Rohan Verma',
          score: 5,
          comment: 'Great coordinator for midnight Maggi & drinks.'
        }
      ],
      location: { type: 'Point', coordinates: [86.1438, 22.7780] }
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: passwordHash,
      customId: 'CM-91024',
      completedOrdersCount: 9,
      localityName: 'Hostel 4 Canteen, NIT Jamshedpur',
      bio: 'B.Tech 2nd Year ECE | Always up to split daily dairy & grocery orders',
      averageRating: 4.8,
      ratings: [
        {
          fromUserName: 'Aarav Sharma',
          score: 5,
          comment: 'Very polite and always on time at Hostel 4 canteen!'
        }
      ],
      location: { type: 'Point', coordinates: [86.1450, 22.7790] }
    });

    const user3 = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: passwordHash,
      customId: 'CM-34012',
      completedOrdersCount: 22,
      localityName: 'Outer Circle Gate, NIT Jamshedpur',
      bio: 'Hostel 9 resident | Regular Blinkit power user',
      averageRating: 5.0,
      ratings: [
        {
          fromUserName: 'Aarav Sharma',
          score: 5,
          comment: 'Legendary group orderer. Saved me ₹300+ in delivery fees this semester!'
        }
      ],
      location: { type: 'Point', coordinates: [86.1420, 22.7770] }
    });

    const user4 = await User.create({
      name: 'Ananya Gupta',
      email: 'ananya@example.com',
      password: passwordHash,
      customId: 'CM-55410',
      completedOrdersCount: 5,
      localityName: 'Adityapur Local Market, Jamshedpur',
      bio: 'Adityapur resident near campus | Splits weekend pantry staples',
      averageRating: 4.7,
      ratings: [],
      location: { type: 'Point', coordinates: [86.1490, 22.7820] }
    });

    console.log('Creating active demo Blinkit order requests...');
    const now = new Date();
    const deadlineToday = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    // Request 1: Aarav (Hostel 1 - MRP 93, standalone 128)
    const req1 = await Request.create({
      orderNumber: 'CM-ORD-8492',
      user: user1._id,
      store: 'Blinkit',
      totalMrp: 93,
      standaloneTotal: 128,
      combinedOrderTotal: 221,
      localityName: 'Hostel 1, NIT Jamshedpur',
      deadline: deadlineToday,
      items: [
        { name: 'Amul Taaza Milk 500ml', mrp: 27 },
        { name: 'Britannia Whole Wheat Bread', mrp: 45 },
        { name: 'Maggi 2-Min Noodles 4-Pack', mrp: 21 }
      ],
      status: 'OPEN',
      isDeletedFromFeed: false,
      location: user1.location
    });

    await Group.create({
      request: req1._id,
      owner: user1._id,
      combinedOrderTotal: 221,
      sharedHandlingFee: 35,
      status: 'PENDING',
      isDeletedFromFeed: false,
      participants: [
        {
          user: user1._id,
          userName: user1.name,
          totalMrp: 93,
          standaloneTotal: 128,
          items: [
            { name: 'Amul Taaza Milk 500ml', mrp: 27 },
            { name: 'Britannia Whole Wheat Bread', mrp: 45 },
            { name: 'Maggi 2-Min Noodles 4-Pack', mrp: 21 }
          ],
          shareRatio: 0.4306,
          finalPayment: 95.15,
          savings: 32.85,
          settled: false
        }
      ],
      meetingPoint: {
        name: 'Hostel 1 Common Room / Main Gate',
        coordinates: [86.1438, 22.7780]
      },
      suggestedMidpoint: {
        name: 'Hostel 1 Ground',
        coordinates: [86.1438, 22.7780]
      }
    });

    // Request 2: Priya (Hostel 4)
    const req2 = await Request.create({
      orderNumber: 'CM-ORD-9102',
      user: user2._id,
      store: 'Blinkit',
      totalMrp: 180,
      standaloneTotal: 215,
      combinedOrderTotal: 310,
      localityName: 'Hostel 4 Canteen, NIT Jamshedpur',
      deadline: new Date(now.getTime() + 8 * 60 * 60 * 1000),
      items: [
        { name: 'Fortune Sunlite Oil 1L', mrp: 140 },
        { name: 'Catch Red Chilli Powder 100g', mrp: 40 }
      ],
      status: 'OPEN',
      isDeletedFromFeed: false,
      location: user2.location
    });

    await Group.create({
      request: req2._id,
      owner: user2._id,
      combinedOrderTotal: 310,
      sharedHandlingFee: 35,
      status: 'PENDING',
      isDeletedFromFeed: false,
      participants: [
        {
          user: user2._id,
          userName: user2.name,
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
        name: 'Hostel 4 Canteen Entrance',
        coordinates: [86.1450, 22.7790]
      }
    });

    // Request 3: Rohan (Outer Circle Gate)
    const req3 = await Request.create({
      orderNumber: 'CM-ORD-3401',
      user: user3._id,
      store: 'Blinkit',
      totalMrp: 310,
      standaloneTotal: 345,
      combinedOrderTotal: 490,
      localityName: 'Outer Circle Gate, NIT Jamshedpur',
      deadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      items: [
        { name: 'Ferrero Rocher 16 Pieces', mrp: 310 }
      ],
      status: 'OPEN',
      isDeletedFromFeed: false,
      location: user3.location
    });

    await Group.create({
      request: req3._id,
      owner: user3._id,
      combinedOrderTotal: 490,
      sharedHandlingFee: 35,
      status: 'PENDING',
      isDeletedFromFeed: false,
      participants: [
        {
          user: user3._id,
          userName: user3.name,
          totalMrp: 310,
          standaloneTotal: 345,
          items: [{ name: 'Ferrero Rocher 16 Pieces', mrp: 310 }],
          settled: false
        }
      ],
      meetingPoint: {
        name: 'Outer Circle Gate Security Desk',
        coordinates: [86.1420, 22.7770]
      }
    });

    // Request 4: Completed Order in History for Aarav & Priya
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const reqPast = await Request.create({
      orderNumber: 'CM-ORD-7721',
      user: user1._id,
      store: 'Blinkit',
      totalMrp: 210,
      standaloneTotal: 245,
      combinedOrderTotal: 330,
      localityName: 'Hostel 1, NIT Jamshedpur',
      deadline: pastDate,
      items: [
        { name: 'Lays Magic Masala 50g', mrp: 20 },
        { name: 'Coca-Cola 750ml', mrp: 40 },
        { name: 'Doritos Cheese Nachos', mrp: 50 },
        { name: 'Cadbury Dairy Milk Silk', mrp: 100 }
      ],
      status: 'COMPLETED',
      completedAt: pastDate,
      isDeletedFromFeed: true, // Archived to history
      location: user1.location
    });

    await Group.create({
      request: reqPast._id,
      owner: user1._id,
      combinedOrderTotal: 330,
      sharedHandlingFee: 35,
      status: 'COMPLETED',
      isDeletedFromFeed: true,
      participants: [
        {
          user: user1._id,
          userName: user1.name,
          totalMrp: 110,
          standaloneTotal: 145,
          items: [
            { name: 'Lays Magic Masala 50g', mrp: 20 },
            { name: 'Doritos Cheese Nachos', mrp: 50 },
            { name: 'Coca-Cola 750ml', mrp: 40 }
          ],
          finalPayment: 172.85,
          savings: 27.15,
          settled: true
        },
        {
          user: user2._id,
          userName: user2.name,
          totalMrp: 100,
          standaloneTotal: 135,
          items: [
            { name: 'Cadbury Dairy Milk Silk', mrp: 100 }
          ],
          finalPayment: 157.15,
          savings: 27.85,
          settled: true
        }
      ],
      meetingPoint: {
        name: 'Hostel 1 Common Area',
        coordinates: [86.1438, 22.7780]
      }
    });

    console.log('Seed database completed successfully!');
  } catch (error) {
    console.error('Seed script error:', error);
  }
};

// Execute automatically ONLY when run directly via CLI (e.g. npm run seed)
const isMainModule = process.argv[1] && url.fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  seedData().then(() => {
    setTimeout(() => process.exit(0), 500);
  });
}
