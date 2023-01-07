import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getAllProduct } from '../controllers/products.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getProducts);
router.post('/', auth, createProduct);
router.get('/all', auth, getAllProduct);
router.patch('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

export default router
