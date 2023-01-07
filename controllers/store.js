import StoresModal from '../models/store.js';
import mongoose from 'mongoose';

export const getStores = async (req, res) => {
  try {
    const storeModals = await StoresModal.find();
    res.status(200).json(storeModals);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createStore = async (req, res) => {
  const category = req.body;

  const newStoreModal = new StoresModal(category);
  try {
    await newStoreModal.save();

    res.status(200).json(newStoreModal);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateStore = async (req, res) => {
  const { id } = req.params;
  const store = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No store with id: ${id}`);

  const updatedStore = { ...store, _id: id };

  await StoresModal.findByIdAndUpdate(id, updatedStore, { new: true });

  res.json(updatedStore);
};

export const deleteStore = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No store with id: ${id}`);

  await StoresModal.findByIdAndRemove(id);

  res.json({ message: 'store deleted successfully.' });
};
