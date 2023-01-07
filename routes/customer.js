import express from 'express';
import { deleteCustomer, getCustomers, createCustomer, updateCustomer } from '../controllers/customers.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getCustomers);
router.post('/', auth, createCustomer);
router.patch('/:id', auth, updateCustomer);
router.delete('/:id', auth, deleteCustomer);

export default router;
