import mongoose from 'mongoose';

const ordersSchema = mongoose.Schema(
  {
    amount: { type: Number, required: true },
    details: { type: String, required: false },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DigitalSale', ordersSchema);
