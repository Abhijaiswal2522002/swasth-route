import mongoose from 'mongoose';

const MedicineRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      latitude: Number,
      longitude: Number,
    },
    paymentMethod: {
      type: String,
      enum: ['Prepaid', 'COD'],
      default: 'COD',
    },
    status: {
      type: String,
      enum: ['Pending', 'Offered', 'Accepted', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    price: {
      type: Number,
    },
    offeredPrice: {
      type: Number,
    },
    expectedDate: {
      type: String,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }
  },
  { timestamps: true }
);

// Index for nearby queries (using the deliveryAddress coordinates)
MedicineRequestSchema.index({ 'deliveryAddress.latitude': 1, 'deliveryAddress.longitude': 1 });
MedicineRequestSchema.index({ status: 1 });
MedicineRequestSchema.index({ userId: 1 });

export default mongoose.model('MedicineRequest', MedicineRequestSchema);
