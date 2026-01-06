import React, { useState, useEffect, useRef } from "react";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";
import { FaFingerprint, FaUser } from "react-icons/fa";
import VerdictPopup from "./VerdictPopup";

const LoginPage = ({ onNavigate }) => {
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [honeyPot, setHoneyPot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  
  const loadTime = useRef(Date.now());
  const { getPayload } = useBehaviorTracking();

  useEffect(() => { loadTime.current = Date.now(); }, []);

  const handleAadhaarChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhar(rawValue.replace(/(\d{4})(?=\d)/g, "$1 "));
  };

  // --- HELPER: REPORT TO BACKEND ---
  const reportBot = async (triggerSource, reason, payload) => {
    const logData = {
        verdict: "BOT",
        confidence_score: 100.0,
        trigger_source: triggerSource,
        features_calculated: { 
            note: reason, 
            efficiency: 1.0, 
            curvature: 0.0,
            raw_path: payload.mouse_path // Send path even if empty (for Replay)
        },
        window_dims: `${window.outerWidth}x${window.outerHeight}`
    };

    // Fire and Forget (don't await, just send)
    fetch("http://127.0.0.1:5000/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
    }).catch(err => console.error("Logging failed:", err));

    // Return the verdict object for the Popup
    return {
        is_bot: true,
        confidence_score: 100.0,
        features_calculated: logData.features_calculated
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = getPayload();
    const timeElapsed = Date.now() - loadTime.current;

    // 1. HONEYPOT
    if (honeyPot.length > 0) {
        console.warn("🍯 HONEYPOT CAUGHT");
        const v = await reportBot("Honeypot", "Middle Name Filled", payload);
        setTimeout(() => { setVerdict(v); setIsLoading(false); }, 500);
        return;
    }

    // 2. GHOST WINDOW
    if (window.outerWidth === 0 || window.outerHeight === 0) {
        console.warn("👻 GHOST WINDOW");
        const v = await reportBot("GhostWindow", "Zero Dimensions", payload);
        setTimeout(() => { setVerdict(v); setIsLoading(false); }, 500);
        return;
    }

    // 3. VAMPIRE CHECK
    if (document.visibilityState === 'hidden') {
        console.warn("🧛 VAMPIRE CHECK");
        const v = await reportBot("VampireCheck", "Hidden Tab Execution", payload);
        setTimeout(() => { setVerdict(v); setIsLoading(false); }, 500);
        return;
    }

    // 4. SPEED TRAP
    if (timeElapsed < 2500) {
        console.warn("⚡ SPEED TRAP");
        const v = await reportBot("SpeedTrap", `Too Fast (${timeElapsed}ms)`, payload);
        setTimeout(() => { setVerdict(v); setIsLoading(false); }, 500);
        return;
    }

    // 5. STATUE / TELEPATHY
    if (payload.mouse_path.length === 0 && name.length > 0) {
         console.warn("🔮 TELEPATHY/STATUE");
         const v = await reportBot("StatueCheck", "No Mouse/Keys Recorded", payload);
         setTimeout(() => { setVerdict(v); setIsLoading(false); }, 500);
         return;
    }

    // 6. ML MODEL (If all checks pass)
    try {
      // Add screen dims for logging
      payload.screen_width = window.screen.width;
      payload.screen_height = window.screen.height;

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setVerdict(data);
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
          <div className="bg-brand-green h-2 w-full"></div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to myAadhaar</h2>
              <p className="text-gray-500 text-sm">Login with Name and Aadhaar to access services</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* HONEYPOT */}
              <div className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
                <input type="text" id="middle_name" name="middle_name" value={honeyPot} onChange={(e) => setHoneyPot(e.target.value)} tabIndex="-1" autoComplete="off" />
              </div>

              {/* Name */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUser className="text-gray-400" /></div>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Enter Name as per Aadhaar" />
                </div>
              </div>

              {/* Aadhaar */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Aadhaar Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaFingerprint className="text-brand-green text-lg" /></div>
                  <input type="text" value={aadhar} onChange={handleAadhaarChange} maxLength="14" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green outline-none transition-all bg-gray-50 focus:bg-white tracking-widest font-mono text-lg" placeholder="XXXX XXXX XXXX" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-200 cursor-pointer ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-brand-green hover:bg-brand-dark hover:-translate-y-1 hover:shadow-xl active:scale-95"}`}>
                {isLoading ? "Verifying..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </main>
      {verdict && <VerdictPopup result={verdict} onRedirect={(dest) => { if (dest === 'HOME') onNavigate('home', name); if (dest === 'CAPTCHA') onNavigate('captcha'); }} />}
    </div>
  );
};

export default LoginPage;