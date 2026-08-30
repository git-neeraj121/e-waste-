import express from 'express';
import { getUserStats } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', auth, getUserStats);

export default router;
