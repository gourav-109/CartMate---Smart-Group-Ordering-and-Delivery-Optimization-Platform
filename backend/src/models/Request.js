import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    store: {
      type: String,
      default: 'Blinkit'
    },
    totalMrp: {
      type: Number,
      required: [true, 'Total MRP is required']
    },
    standaloneTotal: {
      type: Number,
      required: [true, 'Standalone checkout total is required']
    },
    combinedOrderTotal: {
      type: Number,
      required: [true, 'Combined order total is required']
    },
    localityName: {
      type: String,
      required: [true, 'Locality name is required'],
      default: 'Hostel 1, NIT Jamshedpur'
    },
    deadline: {
      type: Date,
      required: [true, 'Order deadline is required']
    },
    items: [
      {
        name: { type: String, trim: true },
        mrp: { type: Number }
      }
    ],
    status: {
      type: String,
      enum: ['OPEN', 'FULL', 'CLOSED', 'COMPLETED'],
      default: 'OPEN'
    },
    isDeletedFromFeed: {
      type: Boolean,
      default: false
    },
    closedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [86.1438, 22.7780]
      }
    }
  },
  { timestamps: true }
);

// Pre-save hook to generate unique orderNumber if missing
requestSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const timestampPart = Date.now().toString().slice(-4);
    const randomPart = Math.floor(100 + Math.random() * 900);
    this.orderNumber = `CM-ORD-${timestampPart}${randomPart}`;
  }
  next();
});

requestSchema.index({ location: '2dsphere' });

export default mongoose.model('Request', requestSchema);
