import mongoose from 'mongoose';

const cashflowSchema = mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: false },
    total: { type: Number, required: true },
    details: { type: String, required: false },
    received: { type: Number, required: true },
    remaining: { type: Number, required: true },
    type: {
      type: String,
      enum: ['Payable', 'Receivable'],
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Cashflow', cashflowSchema);
