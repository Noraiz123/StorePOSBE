import express from 'express';
import { createDigitalSales } from '../controllers/digitalSales.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createDigitalSales);

export default router;
