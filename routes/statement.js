import express from 'express';
import auth from '../middleware/auth.js';
import {GetProfitLossStatement} from "../controllers/statement.js";

const router = express.Router();

router.get('/', auth, GetProfitLossStatement);

export default router;
