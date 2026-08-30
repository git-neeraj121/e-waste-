import express from 'express';
import { getFacilities, getFacilityById, createFacility } from '../controllers/facilityController.js';
import { validateFacility } from '../middleware/validator.js';

const router = express.Router();

router.get('/', getFacilities);
router.get('/:id', getFacilityById);
router.post('/', validateFacility, createFacility);

export default router;
