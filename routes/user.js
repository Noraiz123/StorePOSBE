import express from 'express';
import { deleteUser, getUsers, signin, signup, updateUser } from '../controllers/users.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/sign_in', signin);
router.get('/', auth, getUsers);
router.post('/add', auth, signup);
router.put('/update/:id', auth, updateUser);
router.delete('/delete/:id', auth, deleteUser);

export default router;
