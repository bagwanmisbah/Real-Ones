import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import UserHomePage from './components/UserHomePage';
import CaptchaPage from './components/CaptchaPage';

function App() {
  // 'login', 'home', 'captcha'
  const [currentPage, setCurrentPage] = useState('login');
  const [userName, setUserName] = useState('');

  // Callback to change pages
  const handleNavigation = (destination, user = '') => {
    if (user) setUserName(user);
    setCurrentPage(destination);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* CONDITIONAL RENDERING (The "Router") */}
      {currentPage === 'login' && <LoginPage onNavigate={handleNavigation} />}
      {currentPage === 'home' && <UserHomePage user={userName} />}
      {currentPage === 'captcha' && <CaptchaPage />}

      <Footer />
    </div>
  );
}

export default App;