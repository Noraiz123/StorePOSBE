import mongoose from 'mongoose';

const ordersSchema = mongoose.Schema({
  status: { type: String, required: true },
  invoiceNo: { type: Number, required: true },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  salesman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  change: {
    type: Number,
  },
  paid: {
    type: Number,
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
      paidPrice: Number,
      currentPrice: Number,
      currentDiscount: Number,
      bagQuantity: Number,
      variated: { type: Boolean, default: false },
      quantity: {
        type: Number,
        validate: {
          validator: async function (value, other) {
            console.log(other, value, this);
            if (value) {
              const product = await mongoose.models['Products'].findOne({ _id: this.product });
              if (product?.quantity >= value) {
                return true;
              } else {
                return false;
              }
            }
          },
          message: 'Order quantity {VALUE} must be less than product quantity',
        },
      },
    },
  ],
  total: { type: Number },
  totalRetailPrice: { type: Number },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model('Orders', ordersSchema);
