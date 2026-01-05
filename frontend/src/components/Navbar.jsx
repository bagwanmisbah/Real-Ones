import React from 'react';
import { FaGlobe } from 'react-icons/fa'; // Requires: npm install react-icons

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/c/cf/Aadhaar_Logo.svg" 
          alt="Aadhar Logo" 
          className="h-10 w-auto" 
        />
        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-gray-800 leading-tight">Unique Identification Authority of India</h1>
          <p className="text-xs text-gray-500">Government of India</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors">My Aadhaar</a>
        <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors">About UIDAI</a>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <FaGlobe className="text-gray-500" />
          English
        </button>
      </div>
    </nav>
  );
};

export default Navbar;