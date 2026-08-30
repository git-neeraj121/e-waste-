import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MapView from './components/MapView';
import Scanner from './components/Scanner';
import Scheduler from './components/Scheduler';
import Dashboard from './components/Dashboard';
import Education from './components/Education';
import AdminPanel from './components/AdminPanel';
import AuthGate from './components/AuthGate';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('map');
  const [selectedFacilityForPickup, setSelectedFacilityForPickup] = useState(null);
  const [scannerPrefill, setScannerPrefill] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('unknown');

  // Fetch user stats
  const fetchUserStats = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/user/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
        setBackendStatus('connected');
      } else {
        throw new Error("Failed to fetch stats from API");
      }
    } catch (error) {
      console.warn("Backend API not reachable. Using localStorage mock database instead.", error);
      setBackendStatus('offline');
      loadLocalMockStats();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalMockStats = () => {
    const localStats = localStorage.getItem('eco_user_stats');
    if (localStats) {
      setUserStats(JSON.parse(localStats));
    } else {
      const defaultStats = {
        name: user?.name || "Eco Guardian",
        points: 450,
        recycledWeight: 24.5,
        carbonOffset: 34.3,
        level: 2,
        nextLevelPoints: 1000,
        badges: [
          { id: "badge-1", name: "Eco Cadet", icon: "🌱", description: "Completed your first e-waste drop-off.", dateEarned: "2026-08-15" },
          { id: "badge-2", name: "Wire Wrangler", icon: "🔌", description: "Recycled more than 5kg of cables and wires.", dateEarned: "2026-08-22" }
        ],
        leaderboard: [
          { rank: 1, name: "Aarav Sharma", points: 1540, weight: 85.0 },
          { rank: 2, name: "Priya Patel", points: 1210, weight: 68.2 },
          { rank: 3, name: `${user?.name || "Eco Guardian"} (You)`, points: 450, weight: 24.5 },
          { rank: 4, name: "Rahul Verma", points: 380, weight: 19.8 },
          { rank: 5, name: "Sneha Reddy", points: 290, weight: 15.0 }
        ]
      };
      localStorage.setItem('eco_user_stats', JSON.stringify(defaultStats));
      setUserStats(defaultStats);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [token]);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setActiveTab('map');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setUserStats(null);
    setActiveTab('map');
  };

  const handleStartPickup = (facility) => {
    setSelectedFacilityForPickup(facility);
    setActiveTab('scheduler');
  };

  const handleAutofill = (items) => {
    setScannerPrefill(items);
    setActiveTab('scheduler');
  };

  const handlePickupSuccess = () => {
    fetchUserStats();
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (loading && token) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    // Gate screen under login
    if (!token) {
      return <AuthGate onAuthSuccess={handleAuthSuccess} />;
    }

    switch (activeTab) {
      case 'map':
        return <MapView onStartPickup={handleStartPickup} backendStatus={backendStatus} />;
      case 'scanner':
        return <Scanner onAutofill={handleAutofill} token={token} />;
      case 'scheduler':
        return (
          <Scheduler 
            preselectedFacility={selectedFacilityForPickup} 
            preselectedItems={scannerPrefill}
            onSuccess={handlePickupSuccess} 
            clearPreselected={() => {
              setSelectedFacilityForPickup(null);
              setScannerPrefill(null);
            }}
            backendStatus={backendStatus}
            token={token}
          />
        );
      case 'dashboard':
        return <Dashboard userStats={userStats} backendStatus={backendStatus} onRefreshStats={fetchUserStats} token={token} />;
      case 'education':
        return <Education token={token} backendStatus={backendStatus} />;
      case 'admin':
        return <AdminPanel onStatsChanged={fetchUserStats} backendStatus={backendStatus} token={token} />;
      default:
        return <MapView onStartPickup={handleStartPickup} backendStatus={backendStatus} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        userPoints={userStats?.points || 0}
        user={user}
        onLogout={handleLogout}
      />
      
      {backendStatus === 'offline' && token && (
        <div className="bg-amber-505 text-white bg-amber-500 text-xs px-4 py-2 text-center font-medium shadow-inner flex items-center justify-center gap-2">
          <span>⚠️ Backend offline. Running in local fallback mode (simulated localStorage DB).</span>
          <button 
            onClick={fetchUserStats} 
            className="underline hover:text-amber-100 bg-amber-600/30 px-2 py-0.5 rounded transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}

export default App;
