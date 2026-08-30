import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, User, Phone, MapPin, CheckCircle, Package, ArrowRight, Clock, Plus, Minus } from 'lucide-react';
import { mockFacilities } from '../data/mockFacilities';

const itemCategories = [
  { id: 'phones', name: 'Mobile Phones', points: 40, weight: 0.4, desc: 'Smartphones, feature phones, and small tablets' },
  { id: 'laptops', name: 'Laptops & Computers', points: 150, weight: 3.5, desc: 'Laptops, desktop CPUs, keyboards, and mice' },
  { id: 'batteries', name: 'Batteries', points: 30, weight: 0.5, desc: 'Li-ion, AA, AAA, and lead-acid batteries' },
  { id: 'screens', name: 'Screens & Monitors', points: 100, weight: 5.0, desc: 'CRTs, LCDs, and LED monitors' },
  { id: 'cables', name: 'Cables & Chargers', points: 40, weight: 0.4, desc: 'Charging cords, power bricks, and HDMI cables' },
  { id: 'appliances', name: 'Large Appliances', points: 200, weight: 12.0, desc: 'Microwaves, printers, and scanning machines' }
];

const timeSlots = [
  '09:00 AM - 12:00 PM',
  '12:00 PM - 03:00 PM',
  '03:00 PM - 06:00 PM'
];

function Scheduler({ preselectedFacility, preselectedItems, onSuccess, clearPreselected, backendStatus, token }) {
  const [step, setStep] = useState(1);
  const [facilities, setFacilities] = useState([]);
  
  // Form State
  const [selectedItems, setSelectedItems] = useState({});
  const [facilityId, setFacilityId] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      if (backendStatus === 'connected') {
        try {
          const res = await fetch('/api/facilities');
          if (res.ok) {
            const data = await res.json();
            setFacilities(data);
            return;
          }
        } catch (e) {
          console.error("API error", e);
        }
      }
      setFacilities(mockFacilities);
    };
    fetchFacilities();
  }, [backendStatus]);

  // Handle pre-selected facility and scanner prefill items
  useEffect(() => {
    if (preselectedFacility) {
      setFacilityId(preselectedFacility.id);
    }
  }, [preselectedFacility]);

  useEffect(() => {
    if (preselectedItems) {
      setSelectedItems(preselectedItems);
      setStep(1); // Ensure we are on selection page to view pre-filled values
    }
  }, [preselectedItems]);

  // Calculations
  const totalItemsCount = Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
  
  const estimatedPoints = Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
    const item = itemCategories.find(c => c.id === itemId);
    return sum + (item ? item.points * quantity : 0);
  }, 0);

  const estimatedWeight = Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
    const item = itemCategories.find(c => c.id === itemId);
    return sum + (item ? item.weight * quantity : 0);
  }, 0);

  // Adjust item quantity
  const updateQuantity = (itemId, change) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      const next = current + change;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  // Validations
  const validateStep1 = () => totalItemsCount > 0;
  
  const validateStep2 = () => {
    return facilityId && userName.trim() && userPhone.trim() && pickupDate && timeSlot && address.trim();
  };

  // Submit Handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const formattedItems = Object.entries(selectedItems).map(([itemId, quantity]) => {
      const item = itemCategories.find(c => c.id === itemId);
      return {
        type: item ? item.name : itemId,
        quantity
      };
    });

    const payload = {
      facilityId,
      userName,
      userPhone,
      pickupDate,
      timeSlot,
      address,
      items: formattedItems
    };

    if (backendStatus === 'connected' && token) {
      try {
        const response = await fetch('/api/pickups', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => {
            clearPreselected();
            onSuccess();
          }, 3000);
          return;
        }
      } catch (error) {
        console.error("Backend post failed, falling back to local simulation", error);
      }
    }

    // STANDALONE OFFLINE / FALLBACK LOGIC
    try {
      const localPickups = JSON.parse(localStorage.getItem('eco_pickups') || '[]');
      const targetFacility = facilities.find(f => f.id === facilityId);
      
      const newPickup = {
        id: `pick-${Date.now()}`,
        facilityId,
        facilityName: targetFacility ? targetFacility.name : "Recycling Center",
        userName,
        userPhone,
        pickupDate,
        timeSlot,
        address,
        items: formattedItems,
        status: "Scheduled",
        pointsAwarded: estimatedPoints,
        estimatedWeight: parseFloat(estimatedWeight.toFixed(1)),
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('eco_pickups', JSON.stringify([newPickup, ...localPickups]));

      const localStats = JSON.parse(localStorage.getItem('eco_user_stats'));
      if (localStats) {
        localStats.points += estimatedPoints;
        localStats.recycledWeight += estimatedWeight;
        localStats.carbonOffset = parseFloat((localStats.recycledWeight * 1.4).toFixed(1));
        
        const levelFactor = 500;
        localStats.level = Math.floor(localStats.points / levelFactor) + 1;
        localStats.nextLevelPoints = localStats.level * levelFactor;

        if (localStats.recycledWeight >= 50 && !localStats.badges.find(b => b.id === "badge-3")) {
          localStats.badges.push({
            id: "badge-3",
            name: "Eco Titan",
            icon: "🌳",
            description: "Recycled over 50kg of e-waste.",
            dateEarned: new Date().toISOString().split('T')[0]
          });
        }
        
        const userRankIdx = localStats.leaderboard.findIndex(l => l.name.includes("You") || l.name.includes("Guardian"));
        if (userRankIdx !== -1) {
          localStats.leaderboard[userRankIdx].points = localStats.points;
          localStats.leaderboard[userRankIdx].weight = parseFloat(localStats.recycledWeight.toFixed(1));
        }
        localStats.leaderboard.sort((a, b) => b.points - a.points);
        localStats.leaderboard.forEach((item, idx) => item.rank = idx + 1);

        localStorage.setItem('eco_user_stats', JSON.stringify(localStats));
      }

      setSuccess(true);
      setTimeout(() => {
        clearPreselected();
        onSuccess();
      }, 3000);
    } catch (e) {
      console.error(e);
      alert("Error booking pickup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFacilityObj = facilities.find(f => f.id === facilityId);

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm transition-all duration-200">
      
      {/* Success Modal Overlay */}
      {success && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-50 rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Pickup Request Registered!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Your recycling request has been received. You have earned <span className="text-green-600 dark:text-green-400 font-bold">+{estimatedPoints} Eco Points</span>.
          </p>
          
          <div className="mt-8 flex flex-col gap-1 items-center bg-green-50 dark:bg-green-950/20 px-6 py-3 rounded-xl border border-green-100 dark:border-green-800/40">
            <p className="text-xs text-green-800 dark:text-green-400 font-bold uppercase tracking-wider">Eco points balance</p>
            <p className="text-lg font-extrabold text-green-700 dark:text-green-300">Syncing with Eco-Dashboard...</p>
          </div>
          
          <p className="text-xs text-gray-400 mt-8 animate-pulse">Redirecting you to dashboard...</p>
        </div>
      )}

      {/* Title & Wizard Steps */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Schedule an E-Waste Pickup</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Complete the 3 simple steps to recycle your e-waste responsibly.
        </p>

        {/* Visual Progress Bar */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>1</div>
            <span className={`text-xs font-semibold ${step >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Items Selection</span>
          </div>
          <div className={`flex-grow h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>2</div>
            <span className={`text-xs font-semibold ${step >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Pickup Details</span>
          </div>
          <div className={`flex-grow h-0.5 mx-4 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>3</div>
            <span className={`text-xs font-semibold ${step >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Review & Book</span>
          </div>
        </div>
      </div>

      {/* STEP 1: ITEM SELECTION */}
      {step === 1 && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itemCategories.map((item) => {
              const qty = selectedItems[item.id] || 0;
              return (
                <div 
                  key={item.id}
                  className={`border rounded-xl p-4 flex flex-col justify-between gap-4 transition duration-150 ${
                    qty > 0 
                      ? 'border-primary-500 bg-primary-50/10 dark:border-primary-400 dark:bg-primary-950/10' 
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-gray-805 dark:text-gray-200">{item.name}</h3>
                      <span className="text-[10px] font-extrabold uppercase bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                        +{item.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 font-medium">Est. weight: {item.weight}kg</span>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={qty === 0}
                        className={`p-1.5 rounded-lg border text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                          qty === 0 ? 'opacity-50 cursor-not-allowed' : 'active:scale-90'
                        }`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center text-gray-805 dark:text-gray-200">{qty}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 rounded-lg border text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-90"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1 Summary Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 text-sm font-medium">
              <div>
                <span className="text-gray-400 block text-xs">Total Items</span>
                <span className="text-base font-extrabold text-gray-700 dark:text-gray-300">{totalItemsCount}</span>
              </div>
              <div className="border-l pl-4 border-gray-200 dark:border-gray-800">
                <span className="text-gray-400 block text-xs">Est. Weight</span>
                <span className="text-base font-extrabold text-gray-700 dark:text-gray-300">{estimatedWeight.toFixed(1)} kg</span>
              </div>
              <div className="border-l pl-4 border-gray-200 dark:border-gray-800">
                <span className="text-gray-400 block text-xs">Expected Points</span>
                <span className="text-base font-extrabold text-green-600 dark:text-green-400 font-bold">{estimatedPoints} pts</span>
              </div>
            </div>
            
            <button
              onClick={() => setStep(2)}
              disabled={!validateStep1()}
              className={`w-full sm:w-auto flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition active:scale-95 ${
                !validateStep1() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next Step <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PICKUP DETAILS */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left side inputs */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      value={timeSlot}
                      required
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full pl-10 pr-2 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-750 dark:text-gray-300"
                    >
                      <option value="">Select slot</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side inputs */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Destination Facility</label>
                <select
                  value={facilityId}
                  required
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-750 dark:text-gray-300"
                >
                  <option value="">Select center center...</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.city})</option>
                  ))}
                </select>
                {preselectedFacility && (
                  <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-1 font-semibold">
                    ✓ Pre-selected from Facility Locator map.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <textarea
                    rows="4"
                    required
                    placeholder="Room/Flat No, Apartment Name, Street, Landmark, Area, Zip code..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-4 flex justify-between gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm px-6 py-3 rounded-xl transition active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            
            <button
              onClick={() => setStep(3)}
              disabled={!validateStep2()}
              className={`flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition active:scale-95 ${
                !validateStep2() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Review Booking <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & BOOK */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 md:p-6 flex flex-col gap-5 text-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
              <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <div>
                <h3 className="font-bold text-base text-gray-850 dark:text-gray-200">Booking Summary</h3>
                <p className="text-xs text-gray-400">Please review all values before completing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Recycler Details</span>
                  <p className="font-bold text-gray-805 dark:text-gray-200 mt-0.5">{userName}</p>
                  <p className="text-xs text-gray-500">{userPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Date & Time Slot</span>
                  <p className="font-bold text-gray-805 dark:text-gray-200 mt-0.5 flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" /> {pickupDate}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" /> {timeSlot}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Pickup Address</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Target Center</span>
                  <p className="font-bold text-primary-600 dark:text-primary-400 mt-0.5">{selectedFacilityObj?.name}</p>
                  <p className="text-xs text-gray-505 leading-normal">{selectedFacilityObj?.address}, {selectedFacilityObj?.city}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Items List</span>
                  <div className="mt-1 flex flex-col gap-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                    {Object.entries(selectedItems).map(([itemId, quantity]) => {
                      const item = itemCategories.find(c => c.id === itemId);
                      return (
                        <div key={itemId} className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          <span className="text-gray-700 dark:text-gray-300">{item?.name}</span>
                          <span className="text-gray-500">Qty: {quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-green-500/5 dark:bg-green-400/5 -mx-5 -mb-5 px-5 py-4 rounded-b-2xl">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold text-green-800 dark:text-green-400 uppercase tracking-wide">Recycling Green Reward Estimation</span>
                <p className="text-xs text-gray-500 mt-0.5">Approx. {estimatedWeight.toFixed(1)}kg waste will offset {(estimatedWeight * 1.4).toFixed(1)}kg Carbon Emissions.</p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800/40 rounded-xl px-4 py-2 text-center shrink-0">
                <span className="text-[10px] block font-bold text-gray-400 uppercase">Eco Points Awarded</span>
                <span className="text-xl font-black text-green-600 dark:text-green-400">+{estimatedPoints} PTS</span>
              </div>
            </div>
          </div>

          {/* Step 3 Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-4 flex justify-between gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm px-6 py-3 rounded-xl transition active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg transition active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Registering...
                </>
              ) : (
                <>
                  Confirm & Schedule <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduler;
