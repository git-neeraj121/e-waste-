export const validateFacility = (req, res, next) => {
  const { name, address, city, state, lat, lng } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Valid facility name is required' });
  }
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return res.status(400).json({ error: 'Valid address is required' });
  }
  if (!city || typeof city !== 'string' || city.trim() === '') {
    return res.status(400).json({ error: 'Valid city is required' });
  }
  if (!state || typeof state !== 'string' || state.trim() === '') {
    return res.status(400).json({ error: 'Valid state is required' });
  }
  if (lat === undefined || isNaN(parseFloat(lat))) {
    return res.status(400).json({ error: 'Valid latitude coordinates (numeric) required' });
  }
  if (lng === undefined || isNaN(parseFloat(lng))) {
    return res.status(400).json({ error: 'Valid longitude coordinates (numeric) required' });
  }

  next();
};

export const validatePickup = (req, res, next) => {
  const { facilityId, userName, userPhone, pickupDate, timeSlot, address, items } = req.body;

  if (!facilityId || typeof facilityId !== 'string') {
    return res.status(400).json({ error: 'Valid target facilityId is required' });
  }
  if (!userName || typeof userName !== 'string' || userName.trim() === '') {
    return res.status(400).json({ error: 'Valid username is required' });
  }
  if (!userPhone || typeof userPhone !== 'string' || userPhone.trim() === '') {
    return res.status(400).json({ error: 'Valid contact phone number is required' });
  }
  if (!pickupDate || typeof pickupDate !== 'string') {
    return res.status(400).json({ error: 'Valid pickup date is required' });
  }
  if (!timeSlot || typeof timeSlot !== 'string') {
    return res.status(400).json({ error: 'Valid preferred time slot is required' });
  }
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return res.status(400).json({ error: 'Valid pickup delivery address is required' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items list array containing at least 1 entry is required' });
  }

  for (const item of items) {
    if (!item.type || typeof item.type !== 'string') {
      return res.status(400).json({ error: 'Each item must have a valid type string representation' });
    }
    if (item.quantity === undefined || isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
      return res.status(400).json({ error: 'Each item must have a valid positive quantity counter' });
    }
  }

  next();
};

export const validatePickupStatus = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['Scheduled', 'Completed', 'Cancelled'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  next();
};
