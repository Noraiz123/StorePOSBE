import express from 'express';
import { getStores, createStore, updateStore, deleteStore } from '../controllers/store.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getStores);
router.post('/', auth, createStore);
router.patch('/:id', auth, updateStore);
router.delete('/:id', auth, deleteStore);

export default router;
