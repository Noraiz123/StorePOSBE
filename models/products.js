import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    singlePrice: { type: Number, required: false },
    barcode: { type: String },
    retailPrice: { type: Number, required: true },
    unitRetailPrice: { type: Number, required: false },
    color: { type: String },
    size: { type: String },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    unit: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendors' },
    discount: { type: Number, default: 0, max: 100 },
    quantity: { type: Number, default: 1 },
    bagQuantity: { type: Number, default: 0 },
    imgUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Products', userSchema);
