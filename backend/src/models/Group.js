import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String
    },
    totalMrp: { type: Number, required: true },
    itemMRP: { type: Number },
    standaloneTotal: { type: Number, required: true },
    standaloneTotalAlone: { type: Number },
    items: [
      {
        name: String,
        mrp: Number
      }
    ],
    shareRatio: { type: Number, default: 0 },
    shareAmount: { type: Number, default: 0 },
    feeCut: { type: Number, default: 0 },
    finalPayment: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    settled: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' }
  },
  { _id: true }
);

const groupSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    participants: [participantSchema],
    combinedOrderTotal: {
      type: Number,
      required: true
    },
    sharedHandlingFee: {
      type: Number,
      default: 35
    },
    status: {
      type: String,
      enum: ['PENDING', 'MATCHED', 'ORDER_PLACED', 'COMPLETED', 'CLOSED'],
      default: 'PENDING'
    },
    isDeletedFromFeed: {
      type: Boolean,
      default: false
    },
    meetingPoint: {
      name: { type: String, default: 'Hostel 1 Common Area / Main Gate' },
      coordinates: { type: [Number], default: [86.1438, 22.7780] }
    },
    suggestedMidpoint: {
      name: { type: String, default: 'Geographic Midpoint Spot' },
      coordinates: { type: [Number], default: [86.1438, 22.7780] }
    },
    meetingTime: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);
