import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    addresses: [
      {
        label: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        latitude: Number,
        longitude: Number,
        isDefault: Boolean,
      },
    ],
    favorites: [
      {
        pharmacyId: mongoose.Schema.Types.ObjectId,
        medicineId: mongoose.Schema.Types.ObjectId,
      },
    ],
    orders: [
      {
        orderId: mongoose.Schema.Types.ObjectId,
        status: String,
      },
    ],
    paymentMethods: [
      {
        type: String,
        lastFour: String,
        isDefault: Boolean,
      },
    ],
    rating: {
      type: Number,
      default: 5,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Index for faster queries
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });

export default mongoose.model('User', UserSchema);
