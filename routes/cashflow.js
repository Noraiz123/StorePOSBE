import express from 'express';
import { createCashflow, deleteCashflow, getCashFlows, updateCashflow } from '../controllers/cashflow.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getCashFlows);
router.post('/', auth, createCashflow);
router.patch('/:id', auth, updateCashflow);
router.delete('/:id', auth, deleteCashflow);

export default router;
