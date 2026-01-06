import React, { useEffect, useState } from 'react';
import { FaUserCheck, FaExclamationTriangle, FaRobot } from 'react-icons/fa';

const VerdictPopup = ({ result, onRedirect }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const score = result.confidence_score || 0;

  // 1. Determine Status
  let status = '';
  if (score <= 30) status = 'HUMAN';
  else if (score > 30 && score <= 70) status = 'SUSPICIOUS';
  else status = 'BOT';

  // 2. Timer Logic (Only for Human or Suspicious)
  useEffect(() => {
    // If it's a BOT, we DO NOT redirect (as per your request).
    if (status === 'BOT') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger the redirection based on status
          if (status === 'HUMAN') onRedirect('HOME');
          if (status === 'SUSPICIOUS') onRedirect('CAPTCHA');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onRedirect]);

  // 3. Define UI Content
  const content = {
    HUMAN: {
      icon: <FaUserCheck className="text-4xl text-green-600" />,
      title: 'Access Granted',
      message: `Biometrics confirmed. Redirecting in ${timeLeft}s...`,
      theme: 'green'
    },
    SUSPICIOUS: {
      icon: <FaExclamationTriangle className="text-4xl text-yellow-600" />,
      title: 'Verification Required',
      message: `Unusual movement. Redirecting to Captcha in ${timeLeft}s...`,
      theme: 'yellow'
    },
    BOT: {
      icon: <FaRobot className="text-4xl text-red-600" />,
      title: 'Access Denied',
      message: 'Automated behavior detected. Connection terminated.',
      theme: 'red'
    }
  }[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className={`w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-t-8 border-${content.theme}-500`}>
        
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 bg-gray-50 rounded-full mb-6">
            {content.icon}
          </div>
          
          <h3 className="text-2xl font-bold mb-2 text-gray-800">{content.title}</h3>
          
          <p className="text-gray-500 font-medium mb-6">
            Confidence Score: <span className="font-mono text-gray-900">{score.toFixed(1)}%</span>
          </p>

          {/* --- METRICS SECTION (RESTORED) --- */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
             <div className="flex justify-between items-center text-sm text-gray-600 border-b border-gray-200 pb-2 mb-2">
                <span>Path Efficiency</span>
                <span className="font-mono font-bold text-gray-800">
                    {result.features_calculated?.efficiency.toFixed(2)}
                </span>
             </div>
             <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Curvature Sum</span>
                <span className="font-mono font-bold text-gray-800">
                    {result.features_calculated?.curvature.toFixed(2)}
                </span>
             </div>
          </div>

          {/* Status Message */}
          <div className={`w-full py-4 px-4 rounded-xl text-sm font-bold text-center
            ${status === 'HUMAN' ? 'bg-green-100 text-green-800' : ''}
            ${status === 'SUSPICIOUS' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${status === 'BOT' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {content.message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerdictPopup;