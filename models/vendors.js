import mongoose from 'mongoose';

const vendorsSchema = mongoose.Schema({
  name: { type: String, required: true },
  phoneNo: { type: String, required: false },
  description: String,
});

export default mongoose.model('Vendor', vendorsSchema);
