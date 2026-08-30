import { Pickup } from '../models/Pickup.js';

export const getPickups = async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true';
    const pickups = await Pickup.findAll(showAll ? null : req.user.id);
    res.json(pickups);
  } catch (error) {
    next(error);
  }
};

export const createPickup = async (req, res, next) => {
  try {
    const { facilityId, userName, userPhone, pickupDate, timeSlot, address, items } = req.body;
    
    const newPickup = await Pickup.create(req.user.id, {
      facilityId,
      userName,
      userPhone,
      pickupDate,
      timeSlot,
      address,
      items
    });

    res.status(201).json(newPickup);
  } catch (error) {
    next(error);
  }
};

export const updatePickupStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await Pickup.updateStatus(req.params.id, status);
    
    if (!updated) {
      return res.status(404).json({ error: "Pickup request not found" });
    }
    
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
