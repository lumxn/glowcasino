import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Dice5, Diamond, CircleDot, AlertTriangle as TriangleAlert, Bot as Slot, ArrowUpDown, ZapOff, Gem, Zap, Lightbulb } from 'lucide-react';
import { useBalance } from '../../context/BalanceContext';

const Sidebar = () => {
  const location = useLocation();
  const { balance } = useBalance();

  const menuItems = [
    { path: '/', name: 'Home', icon: <Home className="w-5 h-5" /> },
    { path: '/dice', name: 'Dice Game', icon: <Dice5 className="w-5 h-5" /> },
    { path: '/blackjack', name: 'Blackjack', icon: <Diamond className="w-5 h-5" /> },
    { path: '/mines', name: 'Mines', icon: <TriangleAlert className="w-5 h-5" /> },
    { path: '/plinko', name: 'Plinko', icon: <CircleDot className="w-5 h-5" /> },
    { path: '/slots', name: 'Slots', icon: <Slot className="w-5 h-5" /> },
    { path: '/dice-duel', name: 'Dice Duel', icon: <ArrowUpDown className="w-5 h-5" /> },
    { path: '/neon-wheel', name: 'Neon Wheel', icon: <Zap className="w-5 h-5" /> },
    { path: '/laser-run', name: 'Laser Run', icon: <ZapOff className="w-5 h-5" /> },
    { path: '/gem-breaker', name: 'Gem Breaker', icon: <Gem className="w-5 h-5" /> },
    { path: '/light-catch', name: 'Light Catch', icon: <Lightbulb className="w-5 h-5" /> },
  ];

  return (
    <div className="h-full w-20 lg:w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="hidden lg:flex items-center justify-center p-4 mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-pulse">
          Glow Casino
        </h2>
      </div>
      
      <div className="mt-4 lg:hidden flex justify-center">
        <span className="inline-block w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl animate-pulse">
          G
        </span>
      </div>

      <div className="hidden lg:flex flex-col items-center my-6 px-4">
        <div className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Your Balance</p>
          <p className="text-xl font-bold text-green-400">${balance.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="lg:hidden flex flex-col items-center my-4">
        <div className="text-sm text-green-400 font-bold">${balance.toFixed(2)}</div>
        <div className="text-[10px] text-gray-400">Balance</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className="hidden lg:block ml-3 whitespace-nowrap">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4 hidden lg:block">
        <div className="text-xs text-gray-500 text-center">
          © 2025 Glow Casino<br />
          For Entertainment Only
        </div>
      </div>
    </div>
  );
};

export default Sidebar;