import express from 'express';
import { getProductsStats } from '../controllers/productsStats.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getProductsStats);

export default router;
