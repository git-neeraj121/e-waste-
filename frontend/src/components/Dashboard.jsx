import React, { useState, useEffect } from 'react';
import { Award, Leaf, Scale, ShieldAlert, Sparkles, TrendingUp, Calendar, ChevronRight, Clock, MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const badgeMeta = [
  { id: 'badge-1', name: 'Eco Cadet', icon: '🌱', description: 'Completed your first e-waste drop-off.' },
  { id: 'badge-2', name: 'Wire Wrangler', icon: '🔌', description: 'Recycled more than 5kg of cables and wires.' },
  { id: 'badge-3', name: 'Eco Titan', icon: '🌳', description: 'Recycled over 50kg of e-waste.' },
  { id: 'badge-4', name: 'Silicon Savior', icon: '💎', description: 'Earned 1000 eco-points.' }
];

function Dashboard({ userStats, backendStatus, onRefreshStats, token }) {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    setLoading(true);
    if (backendStatus === 'connected' && token) {
      try {
        const response = await fetch('/api/pickups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPickups(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("API error fetching pickups", e);
      }
    }

    // OFFLINE FALLBACK
    try {
      const localPickups = localStorage.getItem('eco_pickups');
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
          pointsAwarded: 270,
          estimatedWeight: 5.5,
          createdAt: "2026-08-20T10:15:00Z"
        }
      ];

      if (localPickups) {
        const parsedLocal = JSON.parse(localPickups);
        const combined = [...parsedLocal];
        defaultPickups.forEach(dp => {
          if (!combined.some(cp => cp.id === dp.id)) {
            combined.push(dp);
          }
        });
        setPickups(combined);
      } else {
        setPickups(defaultPickups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [backendStatus, userStats, token]);

  const levelProgress = userStats ? (userStats.points / userStats.nextLevelPoints) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary-600 to-green-600 dark:from-primary-950 dark:to-green-950/60 p-6 rounded-2xl text-white shadow-md">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            Welcome back, {userStats?.name}! <Sparkles className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-pulse" />
          </h1>
          <p className="text-sm text-green-100 dark:text-green-300/80 mt-1">
            Track your recycling impact and view your carbon savings scorecard.
          </p>
          
          {/* Level Progress */}
          <div className="mt-4 flex items-center gap-3 max-w-sm">
            <span className="text-xs font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded">LVL {userStats?.level}</span>
            <div className="flex-grow bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-yellow-300 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(levelProgress, 100)}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-green-100">{userStats?.points} / {userStats?.nextLevelPoints} XP</span>
          </div>
        </div>
        
        <button 
          onClick={() => {
            onRefreshStats();
            fetchPickups();
          }}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 rounded-xl transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
        </button>
      </div>

      {/* Grid: 3 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl text-green-600 dark:text-green-400">
            <Leaf className="h-7 w-7 fill-green-500/20" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Eco Points Balance</span>
            <p className="text-2xl font-black text-gray-805 dark:text-gray-205 mt-0.5">{userStats?.points} PTS</p>
            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded">Redeemable Rewards</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Scale className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Total E-Waste Recycled</span>
            <p className="text-2xl font-black text-gray-805 dark:text-gray-205 mt-0.5">{userStats?.recycledWeight?.toFixed(1)} KG</p>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">Electronics Diverted</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-600 dark:text-purple-400">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">CO2 Emissions Saved</span>
            <p className="text-2xl font-black text-gray-805 dark:text-gray-205 mt-0.5">{userStats?.carbonOffset?.toFixed(1)} KG</p>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded">Net Carbon Offset</span>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-808 dark:text-gray-200">Recycling Request History</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">No pickups scheduled yet.</p>
              <p className="text-xs text-gray-400 mt-1">Book your first collection using the Schedule tab!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
              {pickups.map((pick) => {
                const isCompleted = pick.status === 'Completed';
                const isScheduled = pick.status === 'Scheduled';
                
                return (
                  <div key={pick.id} className="border border-gray-150 dark:border-gray-800/80 rounded-xl p-4 flex flex-col gap-3 hover:border-primary-200 dark:hover:border-primary-950/50 transition">
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                          isCompleted ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                          isScheduled ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                          'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {pick.status}
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-805 dark:text-gray-200 mt-1.5 leading-snug">{pick.facilityName}</h4>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-1.5 text-center shrink-0">
                        <span className="text-[9px] block text-gray-400 font-bold uppercase">Estimated Points</span>
                        <span className="text-sm font-black text-primary-600 dark:text-primary-400">+{pick.pointsAwarded} PTS</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Date: {pick.pickupDate} ({pick.timeSlot.split(' - ')[0]})</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{pick.address}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-lg flex flex-wrap gap-1.5">
                      {pick.items.map((item, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                          {item.type} (x{item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-base text-gray-808 dark:text-gray-200 flex items-center gap-1.5">
              <Award className="h-5 w-5 text-yellow-500 fill-yellow-500/20" /> Achievements
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {badgeMeta.map((badge) => {
                const isEarned = userStats?.badges.some(b => b.id === badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`border rounded-xl p-3 text-center flex flex-col items-center gap-1 transition ${
                      isEarned 
                        ? 'border-yellow-200 bg-yellow-50/10 dark:border-yellow-900/30' 
                        : 'border-gray-150 dark:border-gray-800 opacity-40'
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow-md">{badge.icon}</span>
                    <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200 mt-1">{badge.name}</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-base text-gray-808 dark:text-gray-200 flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-primary-500" /> Leaderboard
            </h3>
            
            <div className="flex flex-col gap-2">
              {userStats?.leaderboard.map((user) => {
                const isCurrentUser = user.name.includes("You") || user.name.includes("Guardian");
                return (
                  <div 
                    key={user.rank}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold ${
                      isCurrentUser 
                        ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-300 dark:border-primary-800 text-primary-900 dark:text-primary-300' 
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800/80 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      user.rank === 1 ? 'bg-yellow-400 text-white' :
                      user.rank === 2 ? 'bg-gray-300 text-white dark:bg-gray-600' :
                      user.rank === 3 && !isCurrentUser ? 'bg-amber-600 text-white' :
                      'bg-gray-100 dark:bg-gray-850 text-gray-400'
                    }`}>
                      {user.rank}
                    </span>

                    <span className="font-bold truncate max-w-[100px]">{user.name.split(' (')[0]}</span>
                    
                    <div className="ml-auto text-right flex items-center gap-3 shrink-0">
                      <span className="text-gray-400 text-[10px] font-normal">{user.weight.toFixed(1)}kg</span>
                      <span className="font-extrabold text-green-600 dark:text-green-400 font-bold">{user.points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
