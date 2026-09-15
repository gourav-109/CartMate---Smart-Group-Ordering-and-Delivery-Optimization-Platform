import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Request from '../models/Request.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cartmate_secret_key_123', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/send-otp
// @desc    Generate OTP verification code for email verification
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required for OTP verification' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    res.json({
      message: `OTP verification code generated for ${email}`,
      otp: otpCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP verification code' });
  }
});

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, localityName, bio, lat, lng } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userLocation = {
      type: 'Point',
      coordinates: [
        lng !== undefined ? parseFloat(lng) : 86.1438,
        lat !== undefined ? parseFloat(lat) : 22.7780
      ]
    };

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const customId = `CM-${randomDigits}`;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      customId,
      localityName: localityName || 'Hostel 1, NIT Jamshedpur',
      bio: bio || 'NIT Jamshedpur student & Blinkit group shopper',
      location: userLocation,
      completedOrdersCount: 0,
      averageRating: 5.0,
      ratings: []
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      customId: user.customId,
      completedOrdersCount: user.completedOrdersCount,
      localityName: user.localityName,
      bio: user.bio,
      averageRating: user.averageRating,
      ratings: user.ratings,
      location: user.location,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Server error during signup' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      customId: user.customId || 'CM-10001',
      completedOrdersCount: user.completedOrdersCount || 0,
      localityName: user.localityName || 'Hostel 1, NIT Jamshedpur',
      bio: user.bio || '',
      averageRating: user.averageRating || 5.0,
      ratings: user.ratings || [],
      location: user.location,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/auth/profile
// @desc    Update user profile details
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, localityName, bio, lat, lng } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (localityName) user.localityName = localityName;
    if (bio !== undefined) user.bio = bio;
    if (lng !== undefined && lat !== undefined) {
      user.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }

    await user.save();

    // Dynamically update localityName and location for all open requests of this user
    if (lng !== undefined && lat !== undefined) {
      await Request.updateMany(
        { user: user._id, status: { $in: ['OPEN', 'FULL'] } },
        {
          localityName: user.localityName,
          location: user.location
        }
      );
    }

    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   GET /api/auth/users/:id
// @desc    Get public profile and ratings for another user
router.get('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name customId completedOrdersCount localityName location bio averageRating ratings createdAt')
      .populate('ratings.fromUser', 'name customId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// @route   POST /api/auth/users/:id/rate
// @desc    Submit a rating & review for a user
router.post('/users/:id/rate', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be a number between 1 and 5' });
    }

    if (targetUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check if current user already rated this user
    const existingIndex = targetUser.ratings.findIndex(
      (r) => r.fromUser.toString() === req.user._id.toString()
    );

    if (existingIndex >= 0) {
      targetUser.ratings[existingIndex].score = score;
      targetUser.ratings[existingIndex].comment = comment || '';
      targetUser.ratings[existingIndex].createdAt = new Date();
    } else {
      targetUser.ratings.push({
        fromUser: req.user._id,
        fromUserName: req.user.name,
        score,
        comment: comment || '',
        createdAt: new Date()
      });
    }

    // Recalculate average rating
    const totalScore = targetUser.ratings.reduce((sum, r) => sum + r.score, 0);
    targetUser.averageRating = Math.round((totalScore / targetUser.ratings.length) * 10) / 10;

    await targetUser.save();

    res.json({
      message: 'Rating submitted successfully!',
      averageRating: targetUser.averageRating,
      ratingsCount: targetUser.ratings.length,
      ratings: targetUser.ratings
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
});

export default router;
