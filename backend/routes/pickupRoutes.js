import express from 'express';
import { getPickups, createPickup, updatePickupStatus } from '../controllers/pickupController.js';
import { validatePickup, validatePickupStatus } from '../middleware/validator.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All pickups endpoints are protected by authentication middleware
router.get('/', auth, getPickups);
router.post('/', auth, validatePickup, createPickup);
router.put('/:id', auth, validatePickupStatus, updatePickupStatus);

export default router;
