import React from 'react';
import { Recycle, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">EcoLocate</span>
            <span className="text-sm text-gray-500">© 2026 E-Waste Management System.</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>Built for a clean tomorrow with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
