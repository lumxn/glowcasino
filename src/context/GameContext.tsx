import React, { createContext, useContext, useState, useEffect } from 'react';

interface GameScore {
  gameId: string;
  score: number;
  date: string;
}

interface GameContextProps {
  highScores: Record<string, GameScore[]>;
  addScore: (gameId: string, score: number) => void;
  getHighScore: (gameId: string) => number;
  soundEnabled: boolean;
  toggleSound: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highScores, setHighScores] = useState<Record<string, GameScore[]>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Load saved game data from localStorage on initial render
  useEffect(() => {
    const savedScores = localStorage.getItem('gameHighScores');
    const savedSound = localStorage.getItem('gameSoundEnabled');
    const savedTheme = localStorage.getItem('gameDarkMode');
    
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
    
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
    
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  // Save game data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gameHighScores', JSON.stringify(highScores));
  }, [highScores]);

  useEffect(() => {
    localStorage.setItem('gameSoundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('gameDarkMode', String(darkMode));
    document.body.className = darkMode ? 'bg-background-dark text-white' : 'bg-background-light text-gray-900';
  }, [darkMode]);

  const addScore = (gameId: string, score: number) => {
    const newScore: GameScore = {
      gameId,
      score,
      date: new Date().toISOString(),
    };

    setHighScores(prev => {
      const gameScores = prev[gameId] || [];
      const updatedScores = [...gameScores, newScore].sort((a, b) => b.score - a.score).slice(0, 5);
      return { ...prev, [gameId]: updatedScores };
    });
  };

  const getHighScore = (gameId: string): number => {
    const gameScores = highScores[gameId] || [];
    return gameScores.length > 0 ? gameScores[0].score : 0;
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <GameContext.Provider value={{ 
      highScores, 
      addScore, 
      getHighScore,
      soundEnabled,
      toggleSound,
      darkMode,
      toggleDarkMode
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};