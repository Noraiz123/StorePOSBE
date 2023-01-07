import mongoose from 'mongoose';

const cashflowSchema = mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  total: { type: Number, required: true },
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
},{
  timestamps: true,
});

export default mongoose.model('Cashflow', cashflowSchema);
