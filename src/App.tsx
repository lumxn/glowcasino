import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BalanceProvider } from './context/BalanceContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import DiceGame from './games/DiceGame';
import Blackjack from './games/Blackjack';
import Mines from './games/Mines';
import Plinko from './games/Plinko';
import Slots from './games/Slots';
import DiceDuel from './games/DiceDuel';
import NeonWheel from './games/NeonWheel';
import LaserRun from './games/LaserRun';
import GemBreaker from './games/GemBreaker';
import LightCatch from './games/LightCatch';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <BalanceProvider>
      <Router>
        <div className="flex min-h-screen bg-gray-900 text-white">
          {/* Sidebar - hidden on mobile unless toggled */}
          <div className={`fixed inset-0 z-20 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} lg:hidden`}>
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={toggleSidebar}></div>
            <div className={`absolute inset-y-0 left-0 w-64 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Sidebar />
            </div>
          </div>
          
          {/* Desktop sidebar - always visible */}
          <div className="hidden lg:block w-20 lg:w-64 shrink-0">
            <Sidebar />
          </div>
          
          {/* Main content */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dice" element={<DiceGame />} />
                <Route path="/blackjack" element={<Blackjack />} />
                <Route path="/mines" element={<Mines />} />
                <Route path="/plinko" element={<Plinko />} />
                <Route path="/slots" element={<Slots />} />
                <Route path="/dice-duel" element={<DiceDuel />} />
                <Route path="/neon-wheel" element={<NeonWheel />} />
                <Route path="/laser-run" element={<LaserRun />} />
                <Route path="/gem-breaker" element={<GemBreaker />} />
                <Route path="/light-catch" element={<LightCatch />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </BalanceProvider>
  );
}

export default App;