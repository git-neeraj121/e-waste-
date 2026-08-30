import { getDB } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const User = {
  create: async (name, email, password) => {
    const db = await getDB();
    const id = `user-${Date.now()}`;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save User
    await db.run(
      `INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [id, email, hashedPassword, name, new Date().toISOString()]
    );

    // Initialize stats scorecard for new user
    const defaultStats = {
      id,
      name,
      points: 0,
      recycledWeight: 0.0,
      carbonOffset: 0.0,
      level: 1,
      nextLevelPoints: 500,
      badges: JSON.stringify([]),
      leaderboard: JSON.stringify([
        { rank: 1, name: "Aarav Sharma", points: 1540, weight: 85.0 },
        { rank: 2, name: "Priya Patel", points: 1210, weight: 68.2 },
        { rank: 3, name: `${name} (You)`, points: 0, weight: 0.0 },
        { rank: 4, name: "Rahul Verma", points: 380, weight: 19.8 },
        { rank: 5, name: "Sneha Reddy", points: 290, weight: 15.0 }
      ])
    };

    await db.run(
      `INSERT INTO user_stats (id, name, points, recycledWeight, carbonOffset, level, nextLevelPoints, badges, leaderboard)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, 0, 0.0, 0.0, 1, 500, 
        defaultStats.badges, 
        defaultStats.leaderboard
      ]
    );

    return { id, name, email };
  },

  findByEmail: async (email) => {
    const db = await getDB();
    return await db.get('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
  },

  findById: async (id) => {
    const db = await getDB();
    return await db.get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [id]);
  },

  getStats: async (userId) => {
    const db = await getDB();
    const stats = await db.get('SELECT * FROM user_stats WHERE id = ?', [userId]);
    if (!stats) return null;
    
    // Dynamically query global stats to construct a real leaderboard
    const allUsersStats = await db.all('SELECT id, name, points, recycledWeight FROM user_stats ORDER BY points DESC');
    const leaderboard = allUsersStats.map((u, i) => ({
      rank: i + 1,
      name: u.id === userId ? `${u.name} (You)` : u.name,
      points: u.points,
      weight: u.recycledWeight
    }));

    return {
      ...stats,
      badges: JSON.parse(stats.badges),
      leaderboard
    };
  },

  awardPoints: async (userId, pointsAwarded, weightAwarded) => {
    const db = await getDB();
    const stats = await db.get('SELECT * FROM user_stats WHERE id = ?', [userId]);
    if (!stats) return;

    let points = stats.points + pointsAwarded;
    let recycledWeight = stats.recycledWeight + weightAwarded;
    let carbonOffset = parseFloat((recycledWeight * 1.4).toFixed(1));
    
    const levelFactor = 500;
    let level = Math.floor(points / levelFactor) + 1;
    let nextLevelPoints = level * levelFactor;

    let badges = JSON.parse(stats.badges);
    
    // Custom check for badge additions
    if (recycledWeight >= 5.0 && !badges.some(b => b.id === "badge-2")) {
      badges.push({
        id: "badge-2",
        name: "Wire Wrangler",
        icon: "🔌",
        description: "Recycled more than 5kg of cables and wires.",
        dateEarned: new Date().toISOString().split('T')[0]
      });
    }

    if (recycledWeight >= 50.0 && !badges.some(b => b.id === "badge-3")) {
      badges.push({
        id: "badge-3",
        name: "Eco Titan",
        icon: "🌳",
        description: "Recycled over 50kg of e-waste.",
        dateEarned: new Date().toISOString().split('T')[0]
      });
    }
    
    if (points >= 1000 && !badges.some(b => b.id === "badge-4")) {
      badges.push({
        id: "badge-4",
        name: "Silicon Savior",
        icon: "💎",
        description: "Earned 1000 eco-points.",
        dateEarned: new Date().toISOString().split('T')[0]
      });
    }

    // Add first dropoff badge if not present
    if (badges.length === 0) {
      badges.push({
        id: "badge-1",
        name: "Eco Cadet",
        icon: "🌱",
        description: "Completed your first e-waste drop-off.",
        dateEarned: new Date().toISOString().split('T')[0]
      });
    }

    await db.run(
      `UPDATE user_stats 
       SET points = ?, recycledWeight = ?, carbonOffset = ?, level = ?, nextLevelPoints = ?, badges = ?
       WHERE id = ?`,
      [
        points,
        parseFloat(recycledWeight.toFixed(1)),
        carbonOffset,
        level,
        nextLevelPoints,
        JSON.stringify(badges),
        userId
      ]
    );
  }
};
