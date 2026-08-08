import mongoose from 'mongoose';

const AmbulanceBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider', // Referencing the Rider profile of the ambulance driver
    },
    ambulanceType: {
      type: String,
      enum: ['basic', 'advanced', 'icu'],
      required: true,
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    pickupAddress: {
      type: String,
      default: 'SOS Location',
    },
    destinationHospital: {
      name: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'en_route', 'picked_up', 'completed', 'cancelled'],
      default: 'pending',
    },
    price: {
      type: Number,
      required: true,
    },
    emergencyDescription: {
      type: String,
      default: '',
    },
    firstAidInstructions: {
      type: [String],
      default: [],
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Indexes
AmbulanceBookingSchema.index({ pickupLocation: '2dsphere' });
AmbulanceBookingSchema.index({ userId: 1 });
AmbulanceBookingSchema.index({ driverId: 1 });
AmbulanceBookingSchema.index({ status: 1 });

export default mongoose.model('AmbulanceBooking', AmbulanceBookingSchema);
