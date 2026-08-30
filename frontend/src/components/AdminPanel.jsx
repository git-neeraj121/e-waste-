import React, { useState, useEffect } from 'react';
import { ShieldCheck, PlusCircle, CheckCircle, XCircle, MapPin, Calendar, Clock, Plus, Trash2, Filter } from 'lucide-react';
import { mockFacilities } from '../data/mockFacilities';

function AdminPanel({ onStatsChanged, backendStatus, token }) {
  const [pickups, setPickups] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('requests');
  
  // Add Facility Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [timing, setTiming] = useState('9:00 AM - 6:00 PM (Mon-Sat)');
  const [website, setWebsite] = useState('');
  const [acceptedWasteTypes, setAcceptedWasteTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];
  const wasteTypes = [
    'Mobile Phones', 'Laptops & Computers', 'Batteries', 
    'Large Appliances', 'Screens & Monitors', 'Cables & Chargers', 'Bulbs & Lighting'
  ];

  const loadData = async () => {
    setLoading(true);
    if (backendStatus === 'connected' && token) {
      try {
        // Operator panel fetches ALL user bookings by passing ?all=true
        const pRes = await fetch('/api/pickups?all=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const fRes = await fetch('/api/facilities');
        if (pRes.ok && fRes.ok) {
          const pData = await pRes.json();
          const fData = await fRes.json();
          setPickups(pData);
          setFacilities(fData);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("API error", e);
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

      const localFac = localStorage.getItem('eco_facilities');
      
      if (localPickups) {
        const parsed = JSON.parse(localPickups);
        const combined = [...parsed];
        defaultPickups.forEach(dp => {
          if (!combined.some(cp => cp.id === dp.id)) combined.push(dp);
        });
        setPickups(combined);
      } else {
        setPickups(defaultPickups);
      }

      if (localFac) {
        setFacilities(JSON.parse(localFac));
      } else {
        setFacilities(mockFacilities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [backendStatus, token]);

  const handleUpdateStatus = async (pickupId, nextStatus) => {
    if (backendStatus === 'connected' && token) {
      try {
        const res = await fetch(`/api/pickups/${pickupId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) {
          loadData();
          onStatsChanged();
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // OFFLINE FALLBACK
    try {
      const localPickups = JSON.parse(localStorage.getItem('eco_pickups') || '[]');
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

      let combined = [...localPickups];
      defaultPickups.forEach(dp => {
        if (!combined.some(cp => cp.id === dp.id)) combined.push(dp);
      });

      const pIdx = combined.findIndex(p => p.id === pickupId);
      if (pIdx !== -1) {
        const oldStatus = combined[pIdx].status;
        combined[pIdx].status = nextStatus;
        
        const localOnly = combined.filter(c => c.id.startsWith('pick-') && parseInt(c.id.split('-')[1]) > 1700000000000);
        localStorage.setItem('eco_pickups', JSON.stringify(localOnly));
        
        if (nextStatus === 'Completed' && oldStatus !== 'Completed') {
          const award = combined[pIdx].pointsAwarded;
          const weight = combined[pIdx].estimatedWeight;
          
          const localStats = JSON.parse(localStorage.getItem('eco_user_stats'));
          if (localStats) {
            localStats.points += award;
            localStats.recycledWeight += weight;
            localStats.carbonOffset = parseFloat((localStats.recycledWeight * 1.4).toFixed(1));
            
            const levelFactor = 500;
            localStats.level = Math.floor(localStats.points / levelFactor) + 1;
            localStats.nextLevelPoints = localStats.level * levelFactor;

            const uIdx = localStats.leaderboard.findIndex(l => l.name.includes("You") || l.name.includes("Guardian"));
            if (uIdx !== -1) {
              localStats.leaderboard[uIdx].points = localStats.points;
              localStats.leaderboard[uIdx].weight = parseFloat(localStats.recycledWeight.toFixed(1));
            }
            localStats.leaderboard.sort((a,b) => b.points - a.points);
            localStats.leaderboard.forEach((l,i) => l.rank = i+1);

            localStorage.setItem('eco_user_stats', JSON.stringify(localStats));
          }
        }
      }

      loadData();
      onStatsChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWasteTypeToggle = (type) => {
    setAcceptedWasteTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      address,
      city,
      state,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      phone,
      email,
      timing,
      website,
      acceptedWasteTypes
    };

    if (backendStatus === 'connected' && token) {
      try {
        const res = await fetch('/api/facilities', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setFormSuccess(true);
          resetForm();
          setTimeout(() => setFormSuccess(false), 3000);
          loadData();
          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }

    // OFFLINE FALLBACK
    try {
      const localFac = JSON.parse(localStorage.getItem('eco_facilities') || '[]');
      const combined = localFac.length > 0 ? localFac : [...mockFacilities];
      
      const newFac = {
        id: `fac-${Date.now()}`,
        ...payload,
        rating: 4.8
      };
      
      const nextList = [...combined, newFac];
      localStorage.setItem('eco_facilities', JSON.stringify(nextList));
      
      setFormSuccess(true);
      resetForm();
      setTimeout(() => setFormSuccess(false), 3000);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setState('');
    setLat('');
    setLng('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setAcceptedWasteTypes([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Facility Admin Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Control center for facility operators to manage pickup appointments and list new recycling depots.
          </p>
        </div>

        {/* View Switcher */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl flex gap-1 shadow-sm font-semibold text-xs self-stretch sm:self-auto text-center">
          <button
            onClick={() => setView('requests')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition ${
              view === 'requests' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Pending Pickups ({pickups.filter(p => p.status === 'Scheduled').length})
          </button>
          <button
            onClick={() => setView('add_facility')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition ${
              view === 'add_facility' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Add Facility Center
          </button>
        </div>
      </div>

      {/* VIEW 1: REQUESTS LIST */}
      {view === 'requests' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-500" /> Pending Collection Approvals
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No pickup requests found.
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
              {pickups.map((pick) => {
                const isScheduled = pick.status === 'Scheduled';
                return (
                  <div 
                    key={pick.id} 
                    className={`border rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center transition ${
                      isScheduled 
                        ? 'border-amber-250 bg-amber-50/5 dark:border-amber-900/30' 
                        : 'border-gray-150 dark:border-gray-850 opacity-60 bg-gray-50/30'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5 flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          isScheduled ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-gray-100 text-gray-650 dark:bg-gray-800'
                        }`}>
                          {pick.status}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">{pick.id}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 leading-snug">{pick.userName}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-505 mt-1 leading-normal">
                        <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date: {pick.pickupDate}</p>
                        <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time: {pick.timeSlot}</p>
                        <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address: {pick.address}</p>
                      </div>

                      {/* Items */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pick.items.map((item, idx) => (
                          <span key={idx} className="text-[10px] font-bold bg-white dark:bg-gray-805 border border-gray-150 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded shadow-sm">
                            {item.type} (x{item.quantity})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {isScheduled && (
                      <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(pick.id, 'Cancelled')}
                          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3 py-2 rounded-lg border border-red-200/50 transition active:scale-95"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(pick.id, 'Completed')}
                          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition active:scale-95"
                        >
                          <CheckCircle className="h-4 w-4" /> Complete pickup
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ADD NEW FACILITY FORM */}
      {view === 'add_facility' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary-500" /> Add Verified Recycling Facility
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Please provide coordinates and facility specifications accurately.</p>
          </div>

          {formSuccess && (
            <div className="bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/40 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-bold animate-pulse">
              <CheckCircle className="h-5 w-5" />
              <span>Facility registered successfully and posted to map locator!</span>
            </div>
          )}

          <form onSubmit={handleAddFacility} className="flex flex-col gap-4 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 uppercase mb-2">Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EcoRecycle Jaipur Depot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-2">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 56, Malviya Nagar Industrial Estate"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-2">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-2">State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajasthan"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-2">Latitude (decimal)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="e.g. 26.8522"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-2">Longitude (decimal)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="e.g. 75.8194"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 141 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-2">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jaipur@ecorecycle.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-2">Operating Hours</label>
                  <input
                    type="text"
                    required
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-2">Website URL</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://www.ecorecycle.in"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-gray-400 uppercase mb-3">Accepted E-Waste Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-150 dark:border-gray-800/80">
                {wasteTypes.map((type) => {
                  const isChecked = acceptedWasteTypes.includes(type);
                  return (
                    <label 
                      key={type} 
                      className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition select-none ${
                        isChecked 
                          ? 'border-primary-500 bg-primary-500/5 text-primary-700 dark:border-primary-400 dark:text-primary-400' 
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleWasteTypeToggle(type)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                      />
                      <span className="text-[10px] truncate">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 dark:border-gray-800 pt-6">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm px-6 py-2.5 rounded-xl transition"
              >
                Clear Fields
              </button>
              <button
                type="submit"
                disabled={isSubmitting || acceptedWasteTypes.length === 0}
                className={`bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm px-8 py-2.5 rounded-xl shadow-md transition active:scale-95 ${
                  (isSubmitting || acceptedWasteTypes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Registering...' : 'Register Depot Center'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default AdminPanel;
