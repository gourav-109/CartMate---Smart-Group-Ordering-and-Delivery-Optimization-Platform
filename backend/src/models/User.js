import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    fromUserName: {
      type: String,
      default: 'Blinkit Shopper'
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    customId: {
      type: String,
      unique: true
    },
    completedOrdersCount: {
      type: Number,
      default: 0
    },
    localityName: {
      type: String,
      default: 'Hostel 1, NIT Jamshedpur'
    },
    bio: {
      type: String,
      default: 'NIT Jamshedpur student & Blinkit group shopper'
    },
    ratings: [ratingSchema],
    averageRating: {
      type: Number,
      default: 5.0
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [86.1438, 22.7780] // NIT Jamshedpur default
      }
    }
  },
  { timestamps: true }
);

// Pre-save hook to generate unique customId if missing
userSchema.pre('save', function (next) {
  if (!this.customId) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    this.customId = `CM-${randomDigits}`;
  }
  next();
});

userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);
