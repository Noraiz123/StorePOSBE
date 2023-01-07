import mongoose from 'mongoose';
import CustomersModal from '../models/customers.js';
import UsersModal from '../models/users.js';

export const getCustomers = async (req, res) => {
  try {
    const user = await UsersModal.findOne({ _id: req.userId });

    let customersModals;

    if (user && user.role === 'superAdmin') {
      customersModals = await CustomersModal.find();
    } else {
      customersModals = await CustomersModal.find({ store: user.store });
    }
    res.status(200).json(customersModals);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  const customer = req.body;

  const user = await UsersModal.findOne({ _id: req.userId });

  const newCustomerModal = new CustomersModal({
    ...customer,
    store: user?.store ? user.store : undefined,
    createdAt: new Date().toISOString(),
  });

  try {
    await newCustomerModal.save();
    res.status(201).json(newCustomerModal);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const updateCustomer = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No customer with id: ${id}`);

  const updatedCustomer = { ...updateCustomer, _id: id };

  await CustomersModal.findByIdAndUpdate(id, updatedCustomer, { new: true });

  res.json(updatedCustomer);
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No customer with id: ${id}`);

  await CustomersModal.findByIdAndRemove(id);

  res.json({ message: 'Customer deleted successfully.' });
};
