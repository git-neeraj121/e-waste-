import { Facility } from '../models/Facility.js';

export const getFacilities = async (req, res, next) => {
  try {
    const { city, query, type } = req.query;
    const facilities = await Facility.findAll({ city, query, type });
    res.json(facilities);
  } catch (error) {
    next(error);
  }
};

export const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ error: "E-waste facility not found" });
    }
    res.json(facility);
  } catch (error) {
    next(error);
  }
};

export const createFacility = async (req, res, next) => {
  try {
    const { name, address, city, state, lat, lng, phone, email, acceptedWasteTypes, timing, website } = req.body;
    
    // Create new facility in DB
    const newFacility = await Facility.create({
      name,
      address,
      city,
      state,
      lat,
      lng,
      phone,
      email,
      acceptedWasteTypes,
      timing,
      website
    });

    res.status(201).json(newFacility);
  } catch (error) {
    next(error);
  }
};
