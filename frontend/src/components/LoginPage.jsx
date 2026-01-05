import React, { useState } from "react";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";
import { FaFingerprint, FaUser } from "react-icons/fa";
import VerdictPopup from "./VerdictPopup"; // <--- IMPORT THIS

const LoginPage = ({ onNavigate }) => {
  // State for inputs
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for Result Popup (The Verdict)
  const [verdict, setVerdict] = useState(null);

  // Initialize the Spy Hook
  const { getPayload } = useBehaviorTracking();

  // Aadhaar Formatting Logic
  const handleAadhaarChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const truncated = rawValue.slice(0, 12);
    const formatted = truncated.replace(/(\d{4})(?=\d)/g, "$1 ");
    setAadhar(formatted);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = getPayload();

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setVerdict(data); // This triggers the VerdictPopup
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Error: Ensure app.py is running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-grey-97 font-sans text-gray-800">
      {/* 1. Main Content Area */}
      <main className="flex-grow flex items-start justify-center p-6 pt-24 md:pt-32">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* Card Header */}
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

              {/* Aadhaar Input */}
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
                    onChange={handleAadhaarChange}
                    maxLength="14"
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

      {/* 2. Verdict Popup Component */}
      {verdict && (
        <VerdictPopup
          result={verdict}
          onRedirect={(dest) => {
            if (dest === "HOME") onNavigate("home", name);
            if (dest === "CAPTCHA") onNavigate("captcha");
          }}
        />
      )}
    </div>
  );
};

export default LoginPage;
