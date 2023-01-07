import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModal from '../models/users.js';

const secret = 'test';

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email }).populate('store');

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });
    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
    if (oldUser.role === 'salesman') return res.status(400).json({ message: 'You are not allowed to login' });

    if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret);
    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const user = await UserModal.findOne({ _id: req.userId });
    let usersModals;
    if (user?.role === 'superAdmin') {
      usersModals = await UserModal.find().populate('store');
    } else if (user?.role === 'admin') {
      usersModals = await UserModal.find({ store: user.store }).populate('store');
    }
    res.status(200).json(usersModals);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModal.findOne({ _id: req.userId });

    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModal.create({
      ...req.body,
      store: user.role === 'superAdmin' ? req.body?.store : user.store,
      password: hashedPassword,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });

    console.log(error);
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);

  const updatedUser = { ...updateUser, _id: id };

  await UserModal.findByIdAndUpdate(id, updatedUser, { new: true });

  res.json(updatedUser);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);

  await UserModal.findByIdAndRemove(id);

  res.json({ message: 'User deleted successfully.' });
};
