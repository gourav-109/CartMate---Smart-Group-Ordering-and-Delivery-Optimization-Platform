import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalMrp: {
      type: Number,
      required: true
    },
    standaloneTotal: {
      type: Number,
      required: true
    },
    items: [
      {
        name: { type: String },
        mrp: { type: Number }
      }
    ],
    message: {
      type: String,
      default: 'Hey! I would like to combine my Blinkit order with yours.'
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

export default mongoose.model('JoinRequest', joinRequestSchema);
