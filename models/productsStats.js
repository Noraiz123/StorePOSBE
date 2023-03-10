import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true,
    },
    sold: Number,
    available: Number,
    sales: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ProductsStats', userSchema);
