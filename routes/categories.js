import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getCategories);
router.post('/', auth, createCategory);
router.patch('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

export default router;
