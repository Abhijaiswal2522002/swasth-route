import mongoose from 'mongoose';

const EarningSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: false,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
      required: false,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'payout', 'adjustment'],
      default: 'order',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed',
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Earning', EarningSchema);
