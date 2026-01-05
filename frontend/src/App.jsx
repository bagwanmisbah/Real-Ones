import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <LoginPage />
      <Footer />
    </div>
  );
}

export default App;