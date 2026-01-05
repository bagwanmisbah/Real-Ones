import React, { useState } from "react";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";
import { FaFingerprint, FaUser } from "react-icons/fa";

const LoginPage = () => {
  // State for inputs
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for Result Popup (The Verdict)
  const [verdict, setVerdict] = useState(null);

  // Initialize the Spy Hook
  const { getPayload } = useBehaviorTracking();

  // --- NEW: Aadhaar Formatting Logic ---
  const handleAadhaarChange = (e) => {
    // 1. Remove any non-number characters (letters, symbols)
    const rawValue = e.target.value.replace(/\D/g, "");

    // 2. Limit to 12 digits max
    const truncated = rawValue.slice(0, 12);

    // 3. Add a space after every 4 digits
    // Regex explanation: Capture group of 4 digits (\d{4}) followed by another digit (?=\d)
    const formatted = truncated.replace(/(\d{4})(?=\d)/g, "$1 ");

    setAadhar(formatted);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = getPayload();

    try {
      // Send data to Python Backend
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setVerdict(data); // Save result to show popup
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Error: Ensure app.py is running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-grey-97 font-sans text-gray-800">
      
      <main className="flex-grow flex items-start justify-center p-6 pt-24 md:pt-32">
        
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* Card Header (Green Bar) */}
          <div className="bg-brand-green h-2 w-full"></div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to myAadhaar
              </h2>
              <p className="text-gray-500 text-sm">
                Login with Name and Aadhaar to access services
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Name Input */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter Name as per Aadhaar"
                  />
                </div>
              </div>

              {/* Aadhaar Input*/}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                  Aadhaar Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFingerprint className="text-brand-green text-lg" />
                  </div>
                  <input
                    type="text"
                    value={aadhar}
                    onChange={handleAadhaarChange} // <--- Changed this
                    maxLength="14" // 12 digits + 2 spaces = 14 chars
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all bg-gray-50 focus:bg-white tracking-widest font-mono text-lg"
                    placeholder="XXXX XXXX XXXX"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-200 cursor-pointer
                            ${
                              isLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-brand-green hover:bg-brand-dark hover:-translate-y-1 hover:shadow-xl active:scale-95"
                            }
                `}
              >
                {isLoading ? "Verifying Biometrics..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-brand-green font-semibold hover:underline"
              >
                Forgot Aadhaar Number?
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 2. Verdict Popup (Modal) */}
      {verdict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl transform transition-all scale-100">
            {/* Status Icon */}
            <div
              className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                verdict.is_bot ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <span className="text-3xl">{verdict.is_bot ? "🤖" : "👤"}</span>
            </div>

            <h3
              className={`text-2xl font-bold mb-2 ${
                verdict.is_bot ? "text-red-600" : "text-green-600"
              }`}
            >
              {verdict.is_bot ? "Bot Detected!" : "Access Granted"}
            </h3>

            <p className="text-gray-600 mb-6">
              Confidence Score:{" "}
              <span className="font-mono font-bold">
                {verdict.confidence_score.toFixed(1)}%
              </span>
            </p>

            {/* Debug Info (Optional) */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs text-left font-mono text-gray-500">
              <p>
                Efficiency: {verdict.features_calculated.efficiency.toFixed(2)}
              </p>
              <p>
                Curvature: {verdict.features_calculated.curvature.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => setVerdict(null)}
              className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;