import React from 'react';
import { FaIdCard, FaHistory, FaEdit } from 'react-icons/fa';

const UserHomePage = ({ user }) => {
  return (
    <div className="flex flex-col min-h-screen bg-grey-97 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-brand-green text-white p-8 pt-24 md:pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Welcome Back, {user || 'Resident'}!</h1>
          <p className="opacity-90">Your Aadhaar Services Dashboard</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-4xl mx-auto w-full px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <FaIdCard size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Download Aadhaar</h3>
            <p className="text-sm text-gray-500">Get your e-Aadhaar in PDF format securely.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4">
              <FaEdit size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Update Details</h3>
            <p className="text-sm text-gray-500">Change address, email, or mobile number.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center text-orange-600 mb-4">
              <FaHistory size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Auth History</h3>
            <p className="text-sm text-gray-500">View past authentication requests.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserHomePage;