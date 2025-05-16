import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById } from '../data/games';
import SnakeGame from '../components/games/snake/SnakeGame';
import MemoryGame from '../components/games/memory/MemoryGame';
import TicTacToeGame from '../components/games/tictactoe/TicTacToeGame';
import WordScrambleGame from '../components/games/wordscramble/WordScrambleGame';
import WhackAMoleGame from '../components/games/whackamole/WhackAMoleGame';
import { useGameContext } from '../context/GameContext';

interface GamePageProps {
  gameId?: string;
}

const GamePage: React.FC<GamePageProps> = ({ gameId: propGameId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { getHighScore } = useGameContext();
  
  // Use prop gameId if provided, otherwise use from URL params
  const gameId = propGameId || params.gameId;
  
  const game = gameId ? getGameById(gameId) : undefined;
  
  useEffect(() => {
    // Redirect to home if game not found
    if (!game) {
      navigate('/');
    }
  }, [game, navigate]);
  
  // Render nothing if game not found
  if (!game) return null;
  
  const highScore = getHighScore(game.id);
  
  // Render specific game component based on game ID
  const renderGame = () => {
    switch(game.id) {
      case 'snake':
        return <SnakeGame />;
      case 'memory':
        return <MemoryGame />;
      case 'tictactoe':
        return <TicTacToeGame />;
      case 'wordscramble':
        return <WordScrambleGame />;
      case 'whackamole':
        return <WhackAMoleGame />;
      default:
        return <div>Game not implemented yet</div>;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 text-${game.color}-500`}>{game.title}</h1>
        <p className="text-gray-400 mb-4">{game.description}</p>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="bg-background-card px-3 py-1 rounded-full text-xs font-medium">
            {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
          </span>
          <span className="bg-background-card px-3 py-1 rounded-full text-xs font-medium">
            {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
          </span>
          {highScore > 0 && (
            <span className="bg-background-card px-3 py-1 rounded-full text-xs font-medium text-yellow-500">
              High Score: {highScore}
            </span>
          )}
        </div>
      </div>
      
      {renderGame()}
      
      <div className="mt-8 glass-panel p-6">
        <h2 className="text-xl font-bold mb-3">How to Play</h2>
        <p className="text-gray-300">{game.instructions}</p>
      </div>
    </div>
  );
};

export default GamePage;