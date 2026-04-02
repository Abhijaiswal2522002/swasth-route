import mongoose from 'mongoose';

const RiderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['bicycle', 'bike', 'scooter', 'car'],
      default: 'bike',
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['offline', 'available', 'busy'],
      default: 'offline',
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },
    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    serviceEfficiency: {
      type: Number, // Percentage or score
      default: 100,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Geo-spatial index for proximity queries
RiderSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Rider', RiderSchema);
