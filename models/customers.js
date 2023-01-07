import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phoneNo: String,
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
});

export default mongoose.model('Customer', userSchema);
