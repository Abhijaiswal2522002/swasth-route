import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pharmacy',
  },
  medicineName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: {
      type: String,
      default: 'default',
    },
    pincode: {
      type: String,
      default: 'default',
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

// One active cart per user per location area
CartSchema.index({ userId: 1, city: 1, pincode: 1 }, { unique: true });

export default mongoose.model('Cart', CartSchema);
