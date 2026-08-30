import React from 'react';
import { MapPin, Camera, Calendar, LayoutDashboard, BookOpen, ShieldAlert, Sun, Moon, Recycle, Leaf, LogOut } from 'lucide-react';

function Navbar({ activeTab, setActiveTab, theme, toggleTheme, userPoints, user, onLogout }) {
  const navItems = [
    { id: 'map', label: 'Facility Locator', icon: MapPin },
    { id: 'scanner', label: 'AI Scanner', icon: Camera },
    { id: 'scheduler', label: 'Schedule Pickup', icon: Calendar },
    { id: 'dashboard', label: 'Eco-Dashboard', icon: LayoutDashboard },
    { id: 'education', label: 'Eco-Education', icon: BookOpen },
    { id: 'admin', label: 'Admin Portal', icon: ShieldAlert },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('map')}>
            <div className="bg-primary-100 p-2 rounded-lg text-primary-600 dark:bg-primary-950 dark:text-primary-400">
              <Recycle className="h-6 w-6 animate-spin-slow" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-green-400">
              EcoLocate
            </span>
          </div>

          {/* Navigation Items (Desktop) */}
          <div className="hidden md:flex space-x-1 lg:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Actions: Points, Theme, Logout */}
          <div className="flex items-center gap-2.5">
            {/* Points Badge */}
            {user && (
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 px-3 py-1.5 rounded-full shrink-0">
                <Leaf className="h-3.5 w-3.5 text-green-600 dark:text-green-400 fill-green-500/20" />
                <span className="text-[10px] font-black text-green-700 dark:text-green-400">
                  {userPoints} pts
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition duration-150"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Log Out Button */}
            {user && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 transition duration-150 flex items-center justify-center"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto space-x-1 pb-2 border-t border-gray-100 dark:border-gray-800/50 pt-2 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
