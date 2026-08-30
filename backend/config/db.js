import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'ewaste.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  return dbInstance;
}

export async function initDB() {
  const db = await getDB();

  // 1. Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT
    )
  `);

  // 2. Create Facilities Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      lat REAL,
      lng REAL,
      phone TEXT,
      email TEXT,
      rating REAL DEFAULT 5.0,
      acceptedWasteTypes TEXT,
      timing TEXT,
      website TEXT
    )
  `);

  // 3. Create Pickups Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pickups (
      id TEXT PRIMARY KEY,
      userId TEXT,
      facilityId TEXT,
      facilityName TEXT,
      userName TEXT NOT NULL,
      userPhone TEXT NOT NULL,
      pickupDate TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      address TEXT NOT NULL,
      items TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled',
      pointsAwarded INTEGER,
      estimatedWeight REAL,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (facilityId) REFERENCES facilities (id)
    )
  `);

  // 4. Create User Stats Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      recycledWeight REAL DEFAULT 0.0,
      carbonOffset REAL DEFAULT 0.0,
      level INTEGER DEFAULT 1,
      nextLevelPoints INTEGER DEFAULT 500,
      badges TEXT,
      leaderboard TEXT,
      FOREIGN KEY (id) REFERENCES users (id)
    )
  `);

  await seedDB(db);
  console.log('SQLite Relational Database initialized with Auth schema extensions.');
}

async function seedDB(db) {
  // Seed Users
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  const userId = "user-1";
  if (userCount.count === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);
    
    await db.run(
      `INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [userId, "guardian@ecolocate.org", hashedPassword, "Eco Guardian", new Date().toISOString()]
    );
  }

  // Seed Facilities
  const facilityCount = await db.get('SELECT COUNT(*) as count FROM facilities');
  if (facilityCount.count === 0) {
    const defaultFacilities = [
      {
        id: "fac-1",
        name: "EcoRecycle Bangalore Center",
        address: "12, 4th Cross, Peenya Industrial Area Phase 1",
        city: "Bangalore",
        state: "Karnataka",
        lat: 12.9716,
        lng: 77.5946,
        phone: "+91 80 4567 8901",
        email: "peenya@ecorecycle.in",
        rating: 4.8,
        acceptedWasteTypes: JSON.stringify(["Mobile Phones", "Laptops & Computers", "Batteries", "Cables & Chargers"]),
        timing: "9:00 AM - 6:00 PM (Mon-Sat)",
        website: "https://www.ecorecycle.in"
      },
      {
        id: "fac-2",
        name: "E-Waste Solutions Whitefield",
        address: "Plot 45, Export Promotion Industrial Park, Whitefield",
        city: "Bangalore",
        state: "Karnataka",
        lat: 12.9698,
        lng: 77.7499,
        phone: "+91 80 9876 5432",
        email: "whitefield@ewastesolutions.co.in",
        rating: 4.5,
        acceptedWasteTypes: JSON.stringify(["Laptops & Computers", "Large Appliances", "Screens & Monitors", "Batteries"]),
        timing: "10:00 AM - 7:00 PM (Mon-Fri)",
        website: "https://ewastesolutions.co.in"
      },
      {
        id: "fac-3",
        name: "GreenE-Waste Recyclers Mumbai",
        address: "G-9, MIDC Industrial Area, Andheri East",
        city: "Mumbai",
        state: "Maharashtra",
        lat: 19.1136,
        lng: 72.8697,
        phone: "+91 22 2835 1234",
        email: "andheri@greenewaste.com",
        rating: 4.7,
        acceptedWasteTypes: JSON.stringify(["Mobile Phones", "Batteries", "Bulbs & Lighting", "Cables & Chargers"]),
        timing: "9:30 AM - 6:30 PM (Mon-Sat)",
        website: "https://greenewaste.com"
      },
      {
        id: "fac-4",
        name: "Attero Recycling Navi Mumbai",
        address: "R-420, TTC Industrial Area, Rabale",
        city: "Mumbai",
        state: "Maharashtra",
        lat: 19.1351,
        lng: 73.0135,
        phone: "+91 22 5554 3210",
        email: "rabale@attero.in",
        rating: 4.9,
        acceptedWasteTypes: JSON.stringify(["Mobile Phones", "Laptops & Computers", "Screens & Monitors", "Large Appliances", "Batteries"]),
        timing: "9:00 AM - 5:30 PM (Mon-Fri)",
        website: "https://www.attero.in"
      },
      {
        id: "fac-5",
        name: "Delhi E-Waste Management Depot",
        address: "Block B, Okhla Industrial Area Phase II",
        city: "Delhi",
        state: "Delhi",
        lat: 28.5355,
        lng: 77.2716,
        phone: "+91 11 4160 8888",
        email: "okhla@delhiewaste.org",
        rating: 4.6,
        acceptedWasteTypes: JSON.stringify(["Mobile Phones", "Laptops & Computers", "Cables & Chargers", "Batteries"]),
        timing: "9:00 AM - 6:00 PM (Mon-Sat)",
        website: "https://delhiewaste.org"
      },
      {
        id: "fac-6",
        name: "Eco-Friendly Recyclers Narela",
        address: "Sector A-5, DSIIDC Industrial Area, Narela",
        city: "Delhi",
        state: "Delhi",
        lat: 28.8428,
        lng: 77.0934,
        phone: "+91 11 2778 1234",
        email: "narela@ecofriendly.in",
        rating: 4.2,
        acceptedWasteTypes: JSON.stringify(["Large Appliances", "Screens & Monitors", "Laptops & Computers"]),
        timing: "10:00 AM - 6:00 PM (Mon-Sat)",
        website: "https://ecofriendly.in"
      },
      {
        id: "fac-7",
        name: "Exigo Recycling Hyderabad",
        address: "Sy. No. 129, Jeedimetla Industrial Area",
        city: "Hyderabad",
        state: "Telangana",
        lat: 17.5169,
        lng: 78.4418,
        phone: "+91 40 2309 8899",
        email: "hyd@exigorecycling.com",
        rating: 4.7,
        acceptedWasteTypes: JSON.stringify(["Mobile Phones", "Laptops & Computers", "Batteries", "Cables & Chargers", "Screens & Monitors"]),
        timing: "9:00 AM - 6:00 PM (Mon-Sat)",
        website: "https://exigorecycling.com"
      },
      {
        id: "fac-8",
        name: "Cerebra Integrated E-Waste Chennai",
        address: "Plot 88, Sidco Industrial Estate, Ambattur",
        city: "Chennai",
        state: "Tamil Nadu",
        lat: 13.1146,
        lng: 80.1558,
        phone: "+91 44 2625 4444",
        email: "ambattur@cerebraewaste.com",
        rating: 4.4,
        acceptedWasteTypes: JSON.stringify(["Laptops & Computers", "Screens & Monitors", "Large Appliances", "Cables & Chargers"]),
        timing: "9:30 AM - 5:30 PM (Mon-Fri)",
        website: "https://cerebratech.com"
      },
      {
        id: "fac-9",
        name: "Hulladek Recycling Kolkata",
        address: "4, Fairlie Place, HMP House, Suite 219",
        city: "Kolkata",
        state: "West Bengal",
        lat: 22.5735,
        lng: 88.3475,
        phone: "+91 33 4004 8199",
        email: "kolkata@hulladek.in",
        rating: 4.8,
        acceptedWasteTypes: JSON.stringify(["Mobile Phones", "Laptops & Computers", "Batteries", "Cables & Chargers", "Bulbs & Lighting"]),
        timing: "10:00 AM - 6:30 PM (Mon-Sat)",
        website: "https://hulladek.in"
      },
      {
        id: "fac-10",
        name: "Eco-Saviors Recycling Pune",
        address: "Survey No. 34, Hadapsar Industrial Estate",
        city: "Pune",
        state: "Maharashtra",
        lat: 18.5089,
        lng: 73.9259,
        phone: "+91 20 6682 9999",
        email: "hadapsar@ecosaviors.in",
        rating: 4.6,
        acceptedWasteTypes: JSON.stringify(["Mobile Phones", "Laptops & Computers", "Screens & Monitors", "Batteries"]),
        timing: "9:00 AM - 6:00 PM (Mon-Sat)",
        website: "https://ecosaviors.in"
      }
    ];

    for (const f of defaultFacilities) {
      await db.run(
        `INSERT INTO facilities (id, name, address, city, state, lat, lng, phone, email, rating, acceptedWasteTypes, timing, website)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.id, f.name, f.address, f.city, f.state, f.lat, f.lng, f.phone, f.email, f.rating, f.acceptedWasteTypes, f.timing, f.website]
      );
    }
  }

  // Seed User Stats
  const userStatsCount = await db.get('SELECT COUNT(*) as count FROM user_stats');
  if (userStatsCount.count === 0) {
    const defaultUserStats = {
      id: userId,
      name: "Eco Guardian",
      points: 450,
      recycledWeight: 24.5,
      carbonOffset: 34.3,
      level: 2,
      nextLevelPoints: 1000,
      badges: JSON.stringify([
        { id: "badge-1", name: "Eco Cadet", icon: "🌱", description: "Completed your first e-waste drop-off.", dateEarned: "2026-08-15" },
        { id: "badge-2", name: "Wire Wrangler", icon: "🔌", description: "Recycled more than 5kg of cables and wires.", dateEarned: "2026-08-22" }
      ]),
      leaderboard: JSON.stringify([
        { rank: 1, name: "Aarav Sharma", points: 1540, weight: 85.0 },
        { rank: 2, name: "Priya Patel", points: 1210, weight: 68.2 },
        { rank: 3, name: "Eco Guardian (You)", points: 450, weight: 24.5 },
        { rank: 4, name: "Rahul Verma", points: 380, weight: 19.8 },
        { rank: 5, name: "Sneha Reddy", points: 290, weight: 15.0 }
      ])
    };

    await db.run(
      `INSERT INTO user_stats (id, name, points, recycledWeight, carbonOffset, level, nextLevelPoints, badges, leaderboard)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        defaultUserStats.id,
        defaultUserStats.name,
        defaultUserStats.points,
        defaultUserStats.recycledWeight,
        defaultUserStats.carbonOffset,
        defaultUserStats.level,
        defaultUserStats.nextLevelPoints,
        defaultUserStats.badges,
        defaultUserStats.leaderboard
      ]
    );
  }

  // Seed Pickups
  const pickupsCount = await db.get('SELECT COUNT(*) as count FROM pickups');
  if (pickupsCount.count === 0) {
    const defaultPickups = [
      {
        id: "pick-1",
        userId: userId,
        facilityId: "fac-1",
        facilityName: "EcoRecycle Bangalore Center",
        userName: "Eco Guardian",
        userPhone: "+91 98765 43210",
        pickupDate: "2026-09-02",
        timeSlot: "10:00 AM - 01:00 PM",
        address: "Flat 402, Green Meadows, HSR Layout, Bangalore",
        items: JSON.stringify([
          { type: "Mobile Phones", quantity: 2 },
          { type: "Cables & Chargers", quantity: 5 }
        ]),
        status: "Scheduled",
        pointsAwarded: 50,
        estimatedWeight: 1.5,
        createdAt: "2026-08-28T14:30:00Z"
      },
      {
        id: "pick-2",
        userId: userId,
        facilityId: "fac-3",
        facilityName: "GreenE-Waste Recyclers Mumbai",
        userName: "Eco Guardian",
        userPhone: "+91 98765 43210",
        pickupDate: "2026-08-22",
        timeSlot: "02:00 PM - 05:00 PM",
        address: "Flat 402, Green Meadows, HSR Layout, Bangalore",
        items: JSON.stringify([
          { type: "Laptops & Computers", quantity: 1 },
          { type: "Batteries", quantity: 4 }
        ]),
        status: "Completed",
        pointsAwarded: 270,
        estimatedWeight: 5.5,
        createdAt: "2026-08-20T10:15:00Z"
      }
    ];

    for (const p of defaultPickups) {
      await db.run(
        `INSERT INTO pickups (id, userId, facilityId, facilityName, userName, userPhone, pickupDate, timeSlot, address, items, status, pointsAwarded, estimatedWeight, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.userId, p.facilityId, p.facilityName, p.userName, p.userPhone, p.pickupDate, p.timeSlot, p.address, p.items, p.status, p.pointsAwarded, p.estimatedWeight, p.createdAt]
      );
    }
  }
}
