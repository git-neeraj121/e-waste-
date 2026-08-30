import express from 'express';
import { detectWaste } from '../controllers/detectionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Allow authenticated users to scan e-waste images
router.post('/', auth, detectWaste);

export default router;
