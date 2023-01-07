import express from 'express';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../controllers/vendors.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getVendors);
router.post('/', auth, createVendor);
router.patch('/:id', auth, updateVendor);
router.delete('/:id', auth, deleteVendor);

export default router;
