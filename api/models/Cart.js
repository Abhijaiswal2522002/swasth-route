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
      unique: true, // One active cart per user
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Cart', CartSchema);
