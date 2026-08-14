import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalMrp: { type: Number, required: true },
    standaloneTotal: { type: Number, required: true },
    items: [
      {
        name: String,
        mrp: Number
      }
    ],
    shareAmount: { type: Number, default: 0 },
    feeCut: { type: Number, default: 0 },
    finalPayment: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    settled: { type: Boolean, default: false }
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
    meetingPoint: {
      name: { type: String, default: 'Agreed Meeting Spot' },
      coordinates: { type: [Number], default: [77.6245, 12.9352] }
    },
    suggestedMidpoint: {
      name: { type: String, default: 'Geographic Midpoint Spot' },
      coordinates: { type: [Number] }
    },
    meetingTime: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);
