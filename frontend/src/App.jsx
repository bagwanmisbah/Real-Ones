import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'; // <--- New Imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import UserHomePage from './components/UserHomePage';
import CaptchaPage from './components/CaptchaPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [userName, setUserName] = useState('');
  
  // Hooks for navigation and checking current URL
  const navigate = useNavigate();
  const location = useLocation();

  // Adapter function: Allows your existing components to keep calling onNavigate('home')
  // without needing to rewrite them all right now.
  const handleNavigation = (destination, user = '') => {
    if (user) setUserName(user);
    
    // Map your old string names to real paths
    if (destination === 'login') navigate('/');
    if (destination === 'home') navigate('/home');
    if (destination === 'captcha') navigate('/captcha');
    if (destination === 'admin') navigate('/admin');
  };

  // Check if current path is admin
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hide Navbar on Admin Route */}
      {!isAdmin && <Navbar />}

      {/* REAL ROUTING LOGIC */}
      <Routes>
        <Route path="/" element={<LoginPage onNavigate={handleNavigation} />} />
        <Route path="/home" element={<UserHomePage user={userName} />} />
        <Route path="/captcha" element={<CaptchaPage />} />
        <Route path="/admin" element={<AdminDashboard onNavigate={handleNavigation} />} />
        
        {/* Catch-all: Redirect unknown paths to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Hide Footer on Admin Route */}
      {!isAdmin && <Footer />}
    </div>
  );
}

export default App;