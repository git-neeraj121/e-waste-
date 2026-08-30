import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Mail, Clock, Star, Calendar, Navigation, Globe, Filter } from 'lucide-react';
import { mockFacilities } from '../data/mockFacilities';

// Coordinates mapping for centering the map
const cityCoords = {
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 }
};

// Haversine formula to compute distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function MapView({ onStartPickup, backendStatus }) {
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  
  // Geolocation & Auto Detection States
  const [userLocation, setUserLocation] = useState(null);
  const [detectionMethod, setDetectionMethod] = useState('Default (Bangalore)');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];
  const wasteTypes = [
    'Mobile Phones', 'Laptops & Computers', 'Batteries', 
    'Large Appliances', 'Screens & Monitors', 'Cables & Chargers', 'Bulbs & Lighting'
  ];

  // Geolocation trigger on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLng = position.coords.longitude;
          setUserLocation({ lat: uLat, lng: uLng });
          
          // Determine the closest city from our coordinates list
          let closestCity = 'Bangalore';
          let minDistance = Infinity;

          Object.entries(cityCoords).forEach(([cityName, coords]) => {
            const dist = getDistance(uLat, uLng, coords.lat, coords.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closestCity = cityName;
            }
          });

          setSelectedCity(closestCity);
          setDetectionMethod(`Auto-Detected (${closestCity})`);
        },
        (error) => {
          console.warn("Location permission denied. Defaulting to Bangalore.", error);
          setSelectedCity('Bangalore');
          setDetectionMethod('Default (Bangalore)');
        }
      );
    } else {
      setSelectedCity('Bangalore');
      setDetectionMethod('Default (Bangalore)');
    }
  }, []);

  // Dynamically load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleReady(true);
      return;
    }

    window.initGoogleMap = () => {
      setGoogleReady(true);
    };

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.error("Google Maps API key not found.");
      setGoogleError(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setGoogleError(true);

    document.head.appendChild(script);

    return () => {
      delete window.initGoogleMap;
    };
  }, []);

  // Fetch facilities
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
          console.error("API error, falling back to mock", e);
        }
      }
      setFacilities(mockFacilities);
    };

    fetchFacilities();
  }, [backendStatus]);

  // Apply filters (grouping city-wise, search strings, accepted types)
  useEffect(() => {
    let result = facilities;

    // First filter by Selected City (City-wise Grouping constraint)
    if (selectedCity) {
      result = result.filter(f => f.city.toLowerCase() === selectedCity.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.address.toLowerCase().includes(q)
      );
    }

    if (selectedType) {
      result = result.filter(f => 
        f.acceptedWasteTypes.some(wt => wt.toLowerCase().includes(selectedType.toLowerCase()))
      );
    }

    // Sort by distance if userLocation is available
    if (userLocation) {
      result = [...result].sort((a, b) => {
        const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    setFilteredFacilities(result);
  }, [facilities, searchQuery, selectedCity, selectedType, userLocation]);

  // Initialize Google Maps Map
  useEffect(() => {
    if (!googleReady || !mapRef.current) return;

    const defaultCenter = cityCoords[selectedCity] || { lat: 20.5937, lng: 78.9629 };
    const defaultZoom = 12;

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      },
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapInstanceRef.current = map;
  }, [googleReady]);

  // Center map when selected city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!googleReady || !map || !selectedCity) return;

    const coords = cityCoords[selectedCity];
    if (coords) {
      map.setCenter({ lat: coords.lat, lng: coords.lng });
      map.setZoom(12);
    }
  }, [googleReady, selectedCity]);

  // Update markers when filtered facilities change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!googleReady || !map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.marker.setMap(null));
    markersRef.current = [];

    if (filteredFacilities.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const infoWindow = new window.google.maps.InfoWindow();

    filteredFacilities.forEach(facility => {
      if (!facility.lat || !facility.lng) return;

      // Custom Google Map Marker with Eco Green PIN styling
      const marker = new window.google.maps.Marker({
        position: { lat: facility.lat, lng: facility.lng },
        map: map,
        title: facility.name,
        // Pulse/Glow effect: bounce the marker 3 times when the app first opens
        animation: window.google.maps.Animation.BOUNCE,
        icon: {
          path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -4,-30 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0",
          fillColor: "#16a34a",
          fillOpacity: 1.0,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 1.2,
          anchor: new window.google.maps.Point(0, 0)
        }
      });

      // Stop bounce animation after 2.1s (so it's subtle and not distracting)
      setTimeout(() => {
        marker.setAnimation(null);
      }, 2100);

      // Add click listener
      marker.addListener('click', () => {
        setSelectedFacility(facility);
        map.panTo({ lat: facility.lat, lng: facility.lng });
        map.setZoom(14);

        const contentString = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 220px; padding: 4px;">
            <h4 style="margin: 0 0 4px 0; font-weight: 700; color: #16a34a; font-size: 14px;">${facility.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280; line-height: 1.3;">${facility.address}</p>
            <div style="display: flex; gap: 4px; align-items: center;">
              <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 9999px; color: #15803d;">⭐ ${facility.rating}</span>
              <span style="font-size: 10px; color: #9ca3af; margin-left: auto;">${facility.city}</span>
            </div>
          </div>
        `;

        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
      });

      markersRef.current.push({ id: facility.id, marker, infoWindow });
      bounds.extend({ lat: facility.lat, lng: facility.lng });
    });

    // Auto-zoom fit bounds if there's more than one marker
    if (filteredFacilities.length > 0) {
      if (filteredFacilities.length === 1) {
        map.setCenter({ lat: filteredFacilities[0].lat, lng: filteredFacilities[0].lng });
        map.setZoom(13);
      } else {
        // Extend slightly to include user's location if available and within bounds
        if (userLocation) {
          bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
        }
        map.fitBounds(bounds);
      }
    }
  }, [googleReady, filteredFacilities, userLocation]);

  const handleFacilityClick = (facility) => {
    setSelectedFacility(facility);
    const map = mapInstanceRef.current;
    if (!googleReady || !map) return;

    map.panTo({ lat: facility.lat, lng: facility.lng });
    map.setZoom(14);

    const markerObj = markersRef.current.find(m => m.id === facility.id);
    if (markerObj) {
      const contentString = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 220px; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-weight: 700; color: #16a34a; font-size: 14px;">${facility.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280; line-height: 1.3;">${facility.address}</p>
          <div style="display: flex; gap: 4px; align-items: center;">
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 9999px; color: #15803d;">⭐ ${facility.rating}</span>
            <span style="font-size: 10px; color: #9ca3af; margin-left: auto;">${facility.city}</span>
          </div>
        </div>
      `;
      markerObj.infoWindow.setContent(contentString);
      markerObj.infoWindow.open(map, markerObj.marker);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedFacility(null);
    const map = mapInstanceRef.current;
    if (googleReady && map) {
      const coords = cityCoords[selectedCity] || { lat: 20.5937, lng: 78.9629 };
      map.setCenter({ lat: coords.lat, lng: coords.lng });
      map.setZoom(12);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* 1. Header & Location Highlighting Panel (Requirement 2 & 4) */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-200/60 dark:border-green-800/40 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white p-3 rounded-xl shadow-md shrink-0 animate-pulse-slow">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800 dark:text-white flex flex-wrap items-center gap-2">
              📍 {selectedCity} — E-Waste Recycling Centers
              <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-0.5 rounded-full font-bold">
                {detectionMethod}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Available recycling depots located nearby in the {selectedCity} metropolitan area.
            </p>
          </div>
        </div>
        
        {/* Horizontal Grouping City selectors with dynamic badge counts (Requirement 4) */}
        <div className="flex flex-wrap gap-1.5 self-stretch lg:self-auto overflow-x-auto max-w-full custom-scrollbar py-0.5">
          {cities.map(cityName => {
            const count = facilities.filter(f => f.city.toLowerCase() === cityName.toLowerCase()).length;
            const isSelected = selectedCity === cityName;
            return (
              <button
                key={cityName}
                onClick={() => setSelectedCity(cityName)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition whitespace-nowrap active:scale-95 flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-green-650 bg-green-600 text-white shadow-sm border border-green-600'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850'
                }`}
              >
                <span>{cityName}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                  isSelected ? 'bg-green-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map/List Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Sidebar: Filter Panel & Facility List */}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[720px] overflow-hidden">
          
          {/* Filters Box */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-sm text-gray-800 dark:text-gray-200">
                <Filter className="h-4 w-4 text-primary-500" /> Filter Listings
              </span>
              {(searchQuery || selectedType) && (
                <button 
                  onClick={clearFilters} 
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300"
              >
                <option value="">All Waste Types</option>
                {wasteTypes.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* High-Fidelity Center Cards List (Requirement 5) */}
          <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
            {filteredFacilities.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-xl p-6 shadow-sm">
                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2 animate-bounce-slow" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No recycling centers found.</p>
                <p className="text-xs text-gray-400 mt-1">Try resetting search filters or select another city.</p>
              </div>
            ) : (
              filteredFacilities.map(f => {
                // Calculate distance if user location is detected
                let distanceStr = null;
                if (userLocation && f.lat && f.lng) {
                  const dist = getDistance(userLocation.lat, userLocation.lng, f.lat, f.lng);
                  distanceStr = `${dist.toFixed(1)} km away`;
                }

                return (
                  <div
                    key={f.id}
                    className={`bg-white dark:bg-gray-900 border rounded-xl p-4.5 flex flex-col gap-3 shadow-sm hover:shadow-md transition duration-150 ${
                      selectedFacility?.id === f.id
                        ? 'border-primary-500 ring-2 ring-primary-500/10'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-1">{f.name}</h3>
                        {distanceStr ? (
                          <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold block mt-0.5">📍 {distanceStr}</span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium block mt-0.5">📍 Local recycling depot</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded text-yellow-700 dark:text-yellow-400 text-xs font-bold shrink-0">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>{f.rating}</span>
                      </div>
                    </div>
                    
                    {/* Address & Hours */}
                    <div className="text-xs text-gray-550 dark:text-gray-400 flex flex-col gap-1.5">
                      <p className="flex items-start gap-1.5 leading-normal text-[11px]">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{f.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5 leading-normal text-[11px]">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>Hours: {f.timing}</span>
                      </p>
                      {f.phone && (
                        <p className="flex items-center gap-1.5 leading-normal text-[11px]">
                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>Contact: {f.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Accepted categories badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {f.acceptedWasteTypes.slice(0, 3).map((type, idx) => (
                        <span key={idx} className="text-[9px] font-bold bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {type}
                        </span>
                      ))}
                      {f.acceptedWasteTypes.length > 3 && (
                        <span className="text-[9px] font-bold bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded">
                          +{f.acceptedWasteTypes.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-800/80 pt-3 mt-1 text-[11px] font-bold">
                      <button
                        onClick={() => handleFacilityClick(f)}
                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-center transition active:scale-95"
                      >
                        View on Map
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 border border-primary-200/50 text-primary-650 dark:text-primary-400 rounded-lg text-center transition active:scale-95 flex items-center justify-center gap-1"
                      >
                        <Navigation className="h-3 w-3" /> Get Directions
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar: Google Map Container & Detail Panel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative flex-grow min-h-[400px] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">
            {!googleReady && !googleError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-850 z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-sm font-semibold text-gray-500">Loading Google Maps API...</p>
                </div>
              </div>
            )}

            {googleError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-950/20 z-20 p-6 text-center">
                <div>
                  <MapPin className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Failed to Load Google Maps</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                    Please ensure the Google Maps API Key in your <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">frontend/.env</code> file is valid and has mapping permissions.
                  </p>
                </div>
              </div>
            )}
            
            <div ref={mapRef} className="w-full h-full min-h-[400px]"></div>
          </div>

          {/* Active Facility Details Panel */}
          {selectedFacility && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedFacility.name}
                    <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Verified</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <span>{selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state}</span>
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onStartPickup(selectedFacility)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
                  >
                    <Calendar className="h-4 w-4" /> Schedule Pickup
                  </button>
                  
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.lat},${selectedFacility.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm px-4 py-2.5 rounded-lg transition active:scale-95 flex items-center justify-center"
                  >
                    <Navigation className="h-4 w-4" /> Get Directions
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-b border-gray-100 dark:border-gray-800/80 py-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{selectedFacility.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 break-all">{selectedFacility.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Operating Hours</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{selectedFacility.timing}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Website</p>
                    <a href={selectedFacility.website} target="_blank" rel="noreferrer" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-2">Accepted E-Waste Categories</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFacility.acceptedWasteTypes.map((type, idx) => (
                    <span 
                      key={idx}
                      className="text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md transition"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapView;
