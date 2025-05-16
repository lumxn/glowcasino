import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useBalance } from '../../context/BalanceContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { balance } = useBalance();
  
  return (
    <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden mr-3 p-2 rounded-md text-gray-300 hover:bg-gray-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-pulse">
              Glow Casino
            </div>
          </Link>
        </div>
        
        <div className="flex items-center">
          <div className="lg:hidden mr-2 text-gray-300">
            <div className="flex items-center bg-gray-800 px-3 py-1 rounded-md">
              <span className="text-green-400 font-bold">${balance.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              localStorage.setItem('casinoBalance', '1000');
              window.location.reload();
            }}
            className="text-xs bg-purple-900 hover:bg-purple-800 text-white px-3 py-1 rounded-md ml-2"
          >
            Reset Balance
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;