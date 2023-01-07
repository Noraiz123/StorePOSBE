import VendorsModal from '../models/vendors.js';
import mongoose from 'mongoose';
import UsersModal from '../models/users.js';

export const getVendors = async (req, res) => {
  try {
    let vendorModal;
    vendorModal = await VendorsModal.find();
    res.status(200).json(vendorModal);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createVendor = async (req, res) => {
  const vendor = req.body;

  let newVendorModal;
  newVendorModal = new VendorsModal(vendor);
  try {
    await newVendorModal.save();

    res.status(200).json(newVendorModal);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateVendor = async (req, res) => {
  const { id } = req.params;
  const vendor = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No vendor with id: ${id}`);

  const updatedVendor = { ...vendor, _id: id };

  await VendorsModal.findByIdAndUpdate(id, updatedVendor, { new: true });

  res.json(updatedVendor);
};

export const deleteVendor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No vendor with id: ${id}`);

  await VendorsModal.findByIdAndRemove(id);

  res.json({ message: 'vendor deleted successfully.' });
};
