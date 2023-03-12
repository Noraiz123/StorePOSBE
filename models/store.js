import mongoose from 'mongoose';

const ordersSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Store', ordersSchema);
