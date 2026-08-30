import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

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
    acceptedWasteTypes: ["Mobile Phones", "Laptops & Computers", "Batteries", "Cables & Chargers"],
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
    acceptedWasteTypes: ["Laptops & Computers", "Large Appliances", "Screens & Monitors", "Batteries"],
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
    acceptedWasteTypes: ["Mobile Phones", "Batteries", "Bulbs & Lighting", "Cables & Chargers"],
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
    acceptedWasteTypes: ["Mobile Phones", "Laptops & Computers", "Screens & Monitors", "Large Appliances", "Batteries"],
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
    acceptedWasteTypes: ["Mobile Phones", "Laptops & Computers", "Cables & Chargers", "Batteries"],
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
    acceptedWasteTypes: ["Large Appliances", "Screens & Monitors", "Laptops & Computers"],
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
    acceptedWasteTypes: ["Mobile Phones", "Laptops & Computers", "Batteries", "Cables & Chargers", "Screens & Monitors"],
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
    acceptedWasteTypes: ["Laptops & Computers", "Screens & Monitors", "Large Appliances", "Cables & Chargers"],
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
    acceptedWasteTypes: ["Mobile Phones", "Laptops & Computers", "Batteries", "Cables & Chargers", "Bulbs & Lighting"],
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
    acceptedWasteTypes: ["Mobile Phones", "Laptops & Computers", "Screens & Monitors", "Batteries"],
    timing: "9:00 AM - 6:00 PM (Mon-Sat)",
    website: "https://ecosaviors.in"
  }
];

const defaultUserStats = {
  name: "Eco Guardian",
  points: 450,
  recycledWeight: 24.5, // in kg
  carbonOffset: 34.3,  // in kg (approx 1.4kg CO2 saved per kg of e-waste)
  level: 2,
  nextLevelPoints: 1000,
  badges: [
    { id: "badge-1", name: "Eco Cadet", icon: "🌱", description: "Completed your first e-waste drop-off.", dateEarned: "2026-08-15" },
    { id: "badge-2", name: "Wire Wrangler", icon: "🔌", description: "Recycled more than 5kg of cables and wires.", dateEarned: "2026-08-22" }
  ],
  leaderboard: [
    { rank: 1, name: "Aarav Sharma", points: 1540, weight: 85.0 },
    { rank: 2, name: "Priya Patel", points: 1210, weight: 68.2 },
    { rank: 3, name: "Eco Guardian (You)", points: 450, weight: 24.5 },
    { rank: 4, name: "Rahul Verma", points: 380, weight: 19.8 },
    { rank: 5, name: "Sneha Reddy", points: 290, weight: 15.0 }
  ]
};

const defaultPickups = [
  {
    id: "pick-1",
    facilityId: "fac-1",
    facilityName: "EcoRecycle Bangalore Center",
    userName: "Eco Guardian",
    userPhone: "+91 98765 43210",
    pickupDate: "2026-09-02",
    timeSlot: "10:00 AM - 01:00 PM",
    address: "Flat 402, Green Meadows, HSR Layout, Bangalore",
    items: [
      { type: "Mobile Phones", quantity: 2 },
      { type: "Cables & Chargers", quantity: 5 }
    ],
    status: "Scheduled",
    pointsAwarded: 50,
    estimatedWeight: 1.5,
    createdAt: "2026-08-28T14:30:00Z"
  },
  {
    id: "pick-2",
    facilityId: "fac-3",
    facilityName: "GreenE-Waste Recyclers Mumbai",
    userName: "Eco Guardian",
    userPhone: "+91 98765 43210",
    pickupDate: "2026-08-22",
    timeSlot: "02:00 PM - 05:00 PM",
    address: "Flat 402, Green Meadows, HSR Layout, Bangalore",
    items: [
      { type: "Laptops & Computers", quantity: 1 },
      { type: "Batteries", quantity: 4 }
    ],
    status: "Completed",
    pointsAwarded: 250,
    estimatedWeight: 6.0,
    createdAt: "2026-08-20T10:15:00Z"
  }
];

function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      facilities: defaultFacilities,
      userStats: defaultUserStats,
      pickups: defaultPickups
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Ensure database is initialized
initDB();

function readData() {
  initDB();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  // Facilities
  getFacilities: () => {
    return readData().facilities;
  },
  getFacilityById: (id) => {
    return readData().facilities.find(f => f.id === id);
  },
  addFacility: (facility) => {
    const data = readData();
    const newFacility = {
      id: `fac-${Date.now()}`,
      ...facility,
      rating: parseFloat(facility.rating) || 5.0,
      acceptedWasteTypes: Array.isArray(facility.acceptedWasteTypes) 
        ? facility.acceptedWasteTypes 
        : facility.acceptedWasteTypes.split(',').map(s => s.trim())
    };
    data.facilities.push(newFacility);
    writeData(data);
    return newFacility;
  },

  // Pickups
  getPickups: () => {
    return readData().pickups;
  },
  addPickup: (pickup) => {
    const data = readData();
    const facility = data.facilities.find(f => f.id === pickup.facilityId);
    
    // Calculate points: 50 points per item, laptop 150 points, appliances 200 points
    let points = 0;
    let weight = 0;
    pickup.items.forEach(item => {
      const q = parseInt(item.quantity) || 1;
      if (item.type.includes("Laptop")) {
        points += 150 * q;
        weight += 3.5 * q;
      } else if (item.type.includes("Appliance")) {
        points += 200 * q;
        weight += 12.0 * q;
      } else if (item.type.includes("Screen")) {
        points += 100 * q;
        weight += 5.0 * q;
      } else if (item.type.includes("Batteries")) {
        points += 30 * q;
        weight += 0.5 * q;
      } else {
        points += 40 * q;
        weight += 0.4 * q;
      }
    });

    const newPickup = {
      id: `pick-${Date.now()}`,
      facilityName: facility ? facility.name : "Recycling Center",
      ...pickup,
      status: "Scheduled",
      pointsAwarded: points,
      estimatedWeight: parseFloat(weight.toFixed(1)),
      createdAt: new Date().toISOString()
    };
    
    data.pickups.unshift(newPickup); // Add to the top
    writeData(data);
    return newPickup;
  },
  updatePickupStatus: (id, status) => {
    const data = readData();
    const pickupIndex = data.pickups.findIndex(p => p.id === id);
    if (pickupIndex === -1) return null;
    
    const oldStatus = data.pickups[pickupIndex].status;
    data.pickups[pickupIndex].status = status;
    
    // If transitioning to completed, award user points and weight
    if (status === "Completed" && oldStatus !== "Completed") {
      const pickup = data.pickups[pickupIndex];
      data.userStats.points += pickup.pointsAwarded;
      data.userStats.recycledWeight += pickup.estimatedWeight;
      // recalculate carbon offset: 1.4kg per kg e-waste
      data.userStats.carbonOffset = parseFloat((data.userStats.recycledWeight * 1.4).toFixed(1));
      
      // Calculate level
      const levelFactor = 500;
      data.userStats.level = Math.floor(data.userStats.points / levelFactor) + 1;
      data.userStats.nextLevelPoints = (data.userStats.level) * levelFactor;

      // Update leaderboard
      const userRankIndex = data.userStats.leaderboard.findIndex(l => l.name.includes("You"));
      if (userRankIndex !== -1) {
        data.userStats.leaderboard[userRankIndex].points = data.userStats.points;
        data.userStats.leaderboard[userRankIndex].weight = parseFloat(data.userStats.recycledWeight.toFixed(1));
      }
      
      // Check for new badges
      if (data.userStats.recycledWeight >= 50 && !data.userStats.badges.find(b => b.id === "badge-3")) {
        data.userStats.badges.push({
          id: "badge-3",
          name: "Eco Titan",
          icon: "🌳",
          description: "Recycled over 50kg of e-waste.",
          dateEarned: new Date().toISOString().split('T')[0]
        });
      }
      if (data.userStats.points >= 1000 && !data.userStats.badges.find(b => b.id === "badge-4")) {
        data.userStats.badges.push({
          id: "badge-4",
          name: "Silicon Savior",
          icon: "💎",
          description: "Earned 1000 eco-points.",
          dateEarned: new Date().toISOString().split('T')[0]
        });
      }

      // Sort leaderboard
      data.userStats.leaderboard.sort((a, b) => b.points - a.points);
      data.userStats.leaderboard.forEach((item, index) => {
        item.rank = index + 1;
      });
    }
    
    writeData(data);
    return data.pickups[pickupIndex];
  },

  // User Stats
  getUserStats: () => {
    return readData().userStats;
  }
};
