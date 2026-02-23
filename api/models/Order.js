import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    items: [
      {
        medicineId: mongoose.Schema.Types.ObjectId,
        medicineName: String,
        quantity: Number,
        price: Number,
        subtotal: Number,
      },
    ],
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    subtotal: Number,
    tax: Number,
    emergencyFee: Number,
    deliveryFee: Number,
    total: Number,
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'cod'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    estimatedDeliveryTime: Number, // in minutes
    actualDeliveryTime: Date,
    cancellationReason: String,
    notes: String,
    rating: {
      score: Number,
      comment: String,
      ratedAt: Date,
    },
    tracking: {
      currentLocation: {
        latitude: Number,
        longitude: Number,
      },
      deliveryAgent: {
        id: String,
        name: String,
        phone: String,
      },
      updates: [
        {
          status: String,
          timestamp: Date,
          location: {
            latitude: Number,
            longitude: Number,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ pharmacyId: 1, status: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderId: 1 });

export default mongoose.model('Order', OrderSchema);
