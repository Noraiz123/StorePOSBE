import express from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenses.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getExpenses);
router.post('/', auth, createExpense);
router.patch('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

export default router;
