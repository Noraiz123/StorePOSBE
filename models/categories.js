import mongoose from 'mongoose';

const categoriesSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: String,
});

export default mongoose.model('Categories', categoriesSchema);
