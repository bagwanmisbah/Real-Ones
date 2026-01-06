import React from 'react';

const Footer = () => {
  return (
    // Added 'border-t-4 border-brand-green' for a clear partition line
    <footer className="bg-grey-15 text-white py-12 mt-auto border-t-4 border-brand-green">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        
        {/* Column 1 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-2">Contact Us</h3>
          <p className="text-gray-400">Toll Free: 1947</p>
          <p className="text-gray-400">help@uidai.gov.in</p>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-2">Legal</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cyber Security</a></li>
          </ul>
        </div>
        
        {/* Copyright */}
        <div className="col-span-1 md:col-span-2 md:text-right text-gray-500 mt-8 md:mt-0">
          <p>© 2025 Aadhar Authority of India. All rights reserved.</p>
          <p className="text-xs mt-2">Quantitative Passive Authentication System v1.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;