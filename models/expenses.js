import mongoose from 'mongoose';

const ordersSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    details: { type: String, required: false },
    type: { type: String, required: true },
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

export default mongoose.model('Expenses', ordersSchema);
