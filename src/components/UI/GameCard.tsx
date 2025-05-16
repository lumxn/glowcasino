import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  gradient: string;
}

const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  description, 
  path, 
  icon,
  gradient 
}) => {
  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transition-transform duration-300 hover:scale-[1.02] group`}>
      <div className={`absolute inset-0 opacity-10 ${gradient}`} />
      
      <div className="p-6 relative z-10">
        <div className="flex items-center mb-3">
          <div className={`p-2 rounded-lg ${gradient} text-white mr-3`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-400 mb-4 h-12 overflow-hidden">{description}</p>
        
        <Link
          to={path}
          className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          Play Now
          <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default GameCard;