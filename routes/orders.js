import express from 'express';
import { createOrder, deleteOrder, getOnHoldOrders, getOrders, updateOrder } from '../controllers/orders.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getOrders);
router.post('/', auth, createOrder);
router.patch('/:id', auth, updateOrder);
router.get('/onHold', auth, getOnHoldOrders);
router.delete('/:id', auth, deleteOrder);

export default router;
