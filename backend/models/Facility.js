import { getDB } from '../config/db.js';

export const Facility = {
  findAll: async (filters = {}) => {
    const db = await getDB();
    let query = 'SELECT * FROM facilities WHERE 1=1';
    const params = [];

    if (filters.city) {
      query += ' AND LOWER(city) = ?';
      params.push(filters.city.toLowerCase());
    }

    let result = await db.all(query, params);

    // Filter in-memory for accepted waste types and search queries if SQLite text queries are complex
    if (filters.type) {
      const typeLower = filters.type.toLowerCase();
      result = result.filter(f => {
        try {
          const types = JSON.parse(f.acceptedWasteTypes);
          return types.some(t => t.toLowerCase().includes(typeLower));
        } catch {
          return false;
        }
      });
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.address.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q)
      );
    }

    // Parse JSON acceptedWasteTypes field for all return values
    return result.map(f => ({
      ...f,
      acceptedWasteTypes: JSON.parse(f.acceptedWasteTypes)
    }));
  },

  findById: async (id) => {
    const db = await getDB();
    const facility = await db.get('SELECT * FROM facilities WHERE id = ?', [id]);
    if (!facility) return null;
    return {
      ...facility,
      acceptedWasteTypes: JSON.parse(facility.acceptedWasteTypes)
    };
  },

  create: async (data) => {
    const db = await getDB();
    const id = `fac-${Date.now()}`;
    const rating = 4.8; // Default initial rating
    const acceptedTypesStr = Array.isArray(data.acceptedWasteTypes) 
      ? JSON.stringify(data.acceptedWasteTypes) 
      : JSON.stringify(data.acceptedWasteTypes.split(',').map(s => s.trim()));

    await db.run(
      `INSERT INTO facilities (id, name, address, city, state, lat, lng, phone, email, rating, acceptedWasteTypes, timing, website)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.address,
        data.city,
        data.state,
        parseFloat(data.lat),
        parseFloat(data.lng),
        data.phone || null,
        data.email || null,
        rating,
        acceptedTypesStr,
        data.timing || '9:00 AM - 6:00 PM (Mon-Sat)',
        data.website || null
      ]
    );

    return {
      id,
      ...data,
      rating,
      acceptedWasteTypes: JSON.parse(acceptedTypesStr)
    };
  }
};
