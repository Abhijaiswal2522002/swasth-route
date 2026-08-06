import mongoose from 'mongoose';

const SosRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prescriptionUrl: {
      type: String,
    },
    voiceNoteUrl: {
      type: String,
    },
    textNote: {
      type: String,
    },
    location: {
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
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ['pending', 'offered', 'accepted', 'cancelled', 'expired'],
      default: 'pending',
    },
    broadcastedPharmacies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
      },
    ],
    offers: [
      {
        pharmacyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Pharmacy',
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        estimatedMinutes: {
          type: Number,
          required: true,
        },
        notes: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    acceptedOfferId: mongoose.Schema.Types.ObjectId,
    acceptedPharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  { timestamps: true }
);

// Indexes
SosRequestSchema.index({ location: '2dsphere' });
SosRequestSchema.index({ userId: 1 });
SosRequestSchema.index({ status: 1 });

export default mongoose.model('SosRequest', SosRequestSchema);
