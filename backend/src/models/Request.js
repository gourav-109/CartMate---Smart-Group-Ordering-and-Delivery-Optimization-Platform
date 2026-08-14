import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
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
      required: [true, 'Locality name is required']
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
    closedAt: {
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
        required: true
      }
    }
  },
  { timestamps: true }
);

requestSchema.index({ location: '2dsphere' });

export default mongoose.model('Request', requestSchema);
