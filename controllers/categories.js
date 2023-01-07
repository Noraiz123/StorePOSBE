import CategoriesModal from '../models/categories.js';
import mongoose from 'mongoose';
import UsersModal from '../models/users.js';

export const getCategories = async (req, res) => {
  try {
    let categoriesModals;

    categoriesModals = await CategoriesModal.find();
    res.status(200).json(categoriesModals);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  const category = req.body;
  let newCategoryModal;
  newCategoryModal = new CategoriesModal(category);
  try {
    await newCategoryModal.save();

    res.status(200).json(newCategoryModal);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const category = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No category with id: ${id}`);

  const updatedCategory = { ...category, _id: id };

  await CategoriesModal.findByIdAndUpdate(id, updatedCategory, { new: true });

  res.json(updatedCategory);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No category with id: ${id}`);

  await CategoriesModal.findByIdAndRemove(id);

  res.json({ message: 'Category deleted successfully.' });
};
