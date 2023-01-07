import mongoose from 'mongoose';

const ordersSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model('Store', ordersSchema);
