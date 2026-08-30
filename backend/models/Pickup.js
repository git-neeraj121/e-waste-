import { getDB } from '../config/db.js';
import { Facility } from './Facility.js';
import { User } from './User.js';
import { emailService } from '../services/emailService.js';

export const Pickup = {
  findAll: async (userId = null) => {
    const db = await getDB();
    let query = 'SELECT * FROM pickups';
    const params = [];

    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY createdAt DESC';
    const rows = await db.all(query, params);
    
    return rows.map(r => ({
      ...r,
      items: JSON.parse(r.items)
    }));
  },

  create: async (userId, data) => {
    const db = await getDB();
    const facility = await Facility.findById(data.facilityId);
    
    // Calculate points and estimated weight based on items
    let points = 0;
    let weight = 0;
    const items = data.items;

    items.forEach(item => {
      const q = parseInt(item.quantity) || 1;
      if (item.type.includes("Laptop") || item.type.includes("Computer")) {
        points += 150 * q;
        weight += 3.5 * q;
      } else if (item.type.includes("Appliance")) {
        points += 200 * q;
        weight += 12.0 * q;
      } else if (item.type.includes("Screen") || item.type.includes("Monitor")) {
        points += 100 * q;
        weight += 5.0 * q;
      } else if (item.type.includes("Batter")) {
        points += 30 * q;
        weight += 0.5 * q;
      } else if (item.type.includes("Cable") || item.type.includes("Charger")) {
        points += 40 * q;
        weight += 0.4 * q;
      } else {
        points += 40 * q;
        weight += 0.4 * q;
      }
    });

    const id = `pick-${Date.now()}`;
    const facilityName = facility ? facility.name : "Recycling Center";
    const status = "Scheduled";
    const pointsAwarded = points;
    const estimatedWeight = parseFloat(weight.toFixed(1));
    const createdAt = new Date().toISOString();
    const itemsStr = JSON.stringify(items);

    await db.run(
      `INSERT INTO pickups (id, userId, facilityId, facilityName, userName, userPhone, pickupDate, timeSlot, address, items, status, pointsAwarded, estimatedWeight, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        data.facilityId,
        facilityName,
        data.userName,
        data.userPhone,
        data.pickupDate,
        data.timeSlot,
        data.address,
        itemsStr,
        status,
        pointsAwarded,
        estimatedWeight,
        createdAt
      ]
    );

    const newPickup = {
      id,
      userId,
      facilityId: data.facilityId,
      facilityName,
      userName: data.userName,
      userPhone: data.userPhone,
      pickupDate: data.pickupDate,
      timeSlot: data.timeSlot,
      address: data.address,
      items,
      status,
      pointsAwarded,
      estimatedWeight,
      createdAt
    };

    // Trigger asynchronous confirmation email
    emailService.sendPickupConfirmation(newPickup).catch(err => {
      console.error('[Mail Worker] Failed to send email alert:', err);
    });

    return newPickup;
  },

  updateStatus: async (id, status) => {
    const db = await getDB();
    const pickup = await db.get('SELECT * FROM pickups WHERE id = ?', [id]);
    if (!pickup) return null;

    const oldStatus = pickup.status;
    
    // Update pickup status
    await db.run('UPDATE pickups SET status = ? WHERE id = ?', [status, id]);

    // If transitioned to completed, update user stats (Points, Level, Badges, Leaderboard)
    if (status === "Completed" && oldStatus !== "Completed") {
      await User.awardPoints(pickup.userId, pickup.pointsAwarded, pickup.estimatedWeight);
    }

    const updated = await db.get('SELECT * FROM pickups WHERE id = ?', [id]);
    return {
      ...updated,
      items: JSON.parse(updated.items)
    };
  }
};
