import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Volume2, VolumeX, Gamepad2 } from 'lucide-react';
import { useGameContext } from '../../context/GameContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { soundEnabled, toggleSound, darkMode, toggleDarkMode } = useGameContext();
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav className="bg-background-card backdrop-blur-glass shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold glow-text">Arcade Glow</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary-500 bg-background-cardHover' : 'text-gray-300 hover:text-primary-500 hover:bg-background-cardHover'}`}>
              Home
            </Link>
            
            {/* Controls */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-700">
              <button 
                onClick={toggleSound}
                className="p-2 rounded-full hover:bg-background-cardHover transition-colors"
                aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-background-cardHover transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-background-cardHover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            to="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/' ? 'text-primary-500 bg-background-cardHover' : 'text-gray-300 hover:text-primary-500 hover:bg-background-cardHover'}`}
          >
            Home
          </Link>
          
          {/* Mobile controls */}
          <div className="flex items-center justify-around pt-2 mt-2 border-t border-gray-700">
            <button 
              onClick={toggleSound}
              className="flex items-center justify-center p-2 rounded-md hover:bg-background-cardHover transition-colors"
              aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span className="ml-2 text-sm font-medium">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
            </button>
            <button 
              onClick={toggleDarkMode}
              className="flex items-center justify-center p-2 rounded-md hover:bg-background-cardHover transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="ml-2 text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;