import mongoose from 'mongoose';

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
    localityName: {
      type: String,
      default: 'Koramangala, Bengaluru'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.6245, 12.9352] // Bangalore Koramangala default
      }
    }
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);
