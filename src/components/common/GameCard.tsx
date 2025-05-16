import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../../data/games';
import { useGameContext } from '../../context/GameContext';
import { Trophy } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { getHighScore } = useGameContext();
  const highScore = getHighScore(game.id);
  
  // Generate color classes based on the game's color
  const getColorClasses = () => {
    switch(game.color) {
      case 'primary':
        return {
          border: 'border-primary-500',
          shadow: 'hover:shadow-glow-primary',
          bg: 'from-primary-500/20 to-transparent'
        };
      case 'secondary':
        return {
          border: 'border-secondary-500',
          shadow: 'hover:shadow-glow-secondary',
          bg: 'from-secondary-500/20 to-transparent'
        };
      case 'accent':
        return {
          border: 'border-accent-500',
          shadow: 'hover:shadow-glow-accent',
          bg: 'from-accent-500/20 to-transparent'
        };
      default:
        return {
          border: 'border-primary-500',
          shadow: 'hover:shadow-glow-primary',
          bg: 'from-primary-500/20 to-transparent'
        };
    }
  };
  
  const colorClasses = getColorClasses();
  
  return (
    <Link to={`/games/${game.id}`} className="block">
      <div className={`game-card border ${colorClasses.border} ${colorClasses.shadow} h-full`}>
        <div className="relative overflow-hidden rounded-lg mb-4 h-40">
          <img 
            src={game.thumbnail}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${colorClasses.bg} opacity-70`}></div>
          
          <div className="absolute top-2 right-2 bg-background-card rounded-full px-2 py-1 text-xs font-medium">
            {game.difficulty}
          </div>
        </div>
        
        <h3 className="text-lg font-bold mb-2">{game.title}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{game.description}</p>
        
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-700">
          <span className="text-xs text-gray-400">{game.category}</span>
          {highScore > 0 && (
            <div className="flex items-center text-yellow-500">
              <Trophy size={14} className="mr-1" />
              <span className="text-xs font-medium">{highScore}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard;