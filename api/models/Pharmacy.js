import mongoose from 'mongoose';

const PharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    licenseNumber: String,
    licenseExpiry: Date,
    pharmacistName: String,
    inventory: [
      {
        medicineId: mongoose.Schema.Types.ObjectId,
        medicineName: String,
        quantity: Number,
        price: Number,
        reorderLevel: Number,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'suspended'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10, // percentage
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    documents: [
      {
        type: String,
        url: String,
        uploadedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
PharmacySchema.index({ location: '2dsphere' });
PharmacySchema.index({ 'address.city': 1, status: 1 });

export default mongoose.model('Pharmacy', PharmacySchema);
