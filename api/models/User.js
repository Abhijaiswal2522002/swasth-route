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
    avatar: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
    role: {
      type: String,
      enum: ['user', 'admin', 'rider'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Index for faster queries
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });

export default mongoose.model('User', UserSchema);
