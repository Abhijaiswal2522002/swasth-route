import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    contactPerson: String,
    phone: {
      type: String,
      required: true,
    },
    email: String,
    address: String,
    gstNumber: String,
    totalPurchases: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for pharmacy-specific supplier lookups
SupplierSchema.index({ pharmacyId: 1, name: 1 });

export default mongoose.model('Supplier', SupplierSchema);
