import React from 'react';
import { useBalance } from '../context/BalanceContext';
import GameCard from '../components/UI/GameCard';
import { Dice5, Diamond, AlertTriangle as TriangleAlert, CircleDot, Bot as Slot, ArrowUpDown, Zap, ZapOff, Gem, Lightbulb } from 'lucide-react';

const HomePage = () => {
  const { balance } = useBalance();

  const classicGames = [
    {
      title: 'Dice Game',
      description: 'Choose a number, place your bet, and roll the dice to win!',
      path: '/dice',
      icon: <Dice5 className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-blue-600 to-cyan-400'
    },
    {
      title: 'Blackjack',
      description: 'Classic card game. Get closer to 21 than the dealer without going over.',
      path: '/blackjack',
      icon: <Diamond className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-400'
    },
    {
      title: 'Mines',
      description: 'Navigate through hidden mines and cash out before you explode!',
      path: '/mines',
      icon: <TriangleAlert className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-red-500 to-orange-400'
    },
    {
      title: 'Plinko',
      description: 'Drop chips and watch them bounce for big multipliers!',
      path: '/plinko',
      icon: <CircleDot className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-purple-500 to-indigo-400'
    },
    {
      title: 'Slots',
      description: 'Spin the reels and match symbols for huge payouts!',
      path: '/slots',
      icon: <Slot className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-yellow-500 to-amber-400'
    }
  ];

  const exclusiveGames = [
    {
      title: 'Glow Dice Duel',
      description: 'Face off against the house in this exciting dice battle!',
      path: '/dice-duel',
      icon: <ArrowUpDown className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-purple-600 to-indigo-400'
    },
    {
      title: 'Neon Wheel',
      description: 'Spin the glowing wheel for various multipliers and prizes!',
      path: '/neon-wheel',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-pink-500 to-rose-400'
    },
    {
      title: 'Laser Run',
      description: 'Dodge the lasers and increase your multiplier as you go!',
      path: '/laser-run',
      icon: <ZapOff className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-400'
    },
    {
      title: 'Gem Breaker',
      description: 'Match and break gems to multiply your bet!',
      path: '/gem-breaker',
      icon: <Gem className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-emerald-500 to-green-400'
    },
    {
      title: 'Light Catch',
      description: 'Catch the fast-moving light orbs for cash boosts!',
      path: '/light-catch',
      icon: <Lightbulb className="w-5 h-5" />,
      gradient: 'bg-gradient-to-r from-amber-500 to-yellow-400'
    }
  ];

  return (
    <div className="w-full p-4 md:p-6">
      <div className="relative mb-8 p-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center mix-blend-overlay opacity-20" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
            Welcome to Glow Casino
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Experience the thrill of casino games with our stunning neon-themed games. 
            Place your bets and test your luck with $1,000 in virtual chips!
          </p>
          
          <div className="mt-6 inline-block">
            <div className="text-white font-bold text-xl">
              Your Balance: <span className="text-green-400">${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span>Casino Classics</span>
          <span className="ml-3 h-px flex-1 bg-gradient-to-r from-purple-800 to-transparent"></span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {classicGames.map((game, index) => (
            <GameCard
              key={index}
              title={game.title}
              description={game.description}
              path={game.path}
              icon={game.icon}
              gradient={game.gradient}
            />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span>Glow Casino Exclusives</span>
          <span className="ml-3 h-px flex-1 bg-gradient-to-r from-purple-800 to-transparent"></span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {exclusiveGames.map((game, index) => (
            <GameCard
              key={index}
              title={game.title}
              description={game.description}
              path={game.path}
              icon={game.icon}
              gradient={game.gradient}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;