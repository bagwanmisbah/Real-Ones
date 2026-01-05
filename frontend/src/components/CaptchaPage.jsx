import React from 'react';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const CaptchaPage = () => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-200">
        
        {/* Warning Header */}
        <div className="bg-yellow-50 p-6 text-center border-b border-yellow-100">
          <FaExclamationTriangle className="text-4xl text-yellow-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-yellow-800">Unusual Activity Detected</h2>
          <p className="text-sm text-yellow-700 mt-2">
            Your behavior patterns matched our automated bot triggers.
          </p>
        </div>

        {/* Captcha Area */}
        <div className="p-8 space-y-6">
          <p className="text-gray-600 text-center text-sm">
            Please complete the security check below to proceed.
          </p>

          {/* Mock Captcha Box */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" />
              <span className="text-sm font-medium text-gray-700">I am not a robot</span>
            </div>
            <FaShieldAlt className="text-gray-400 text-xl" />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md">
            Verify & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptchaPage;