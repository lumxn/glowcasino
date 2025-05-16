import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../../context/GameContext';
import { RefreshCw } from 'lucide-react';

// Game constants
const GAME_DURATION = 30; // seconds
const GRID_SIZE = { rows: 3, cols: 3 };
const MOLE_SHOW_MIN_TIME = 500; // ms
const MOLE_SHOW_MAX_TIME = 1500; // ms
const MOLE_HIDE_MIN_TIME = 500; // ms
const MOLE_HIDE_MAX_TIME = 1000; // ms

interface Mole {
  id: number;
  active: boolean;
  whacked: boolean;
}

const WhackAMoleGame: React.FC = () => {
  const [moles, setMoles] = useState<Mole[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<number | null>(null);
  const molesRef = useRef<HTMLDivElement>(null);
  const { addScore, soundEnabled } = useGameContext();
  
  // Initialize moles
  useEffect(() => {
    const initMoles = Array.from({ length: GRID_SIZE.rows * GRID_SIZE.cols }).map((_, index) => ({
      id: index,
      active: false,
      whacked: false
    }));
    
    setMoles(initMoles);
  }, []);
  
  // Start the game
  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);
    setGameOver(false);
    
    // Reset all moles
    setMoles(prev => prev.map(mole => ({ ...mole, active: false, whacked: false })));
  };
  
  // Game timer
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameActive(false);
          setGameOver(true);
          addScore('whackamole', score);
          
          // Play game over sound if enabled
          if (soundEnabled) {
            playGameOverSound();
          }
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, score, addScore, soundEnabled]);
  
  // Randomly show and hide moles
  useEffect(() => {
    if (!gameActive) return;
    
    const activateMole = () => {
      // Find inactive moles
      const inactiveMoles = moles.map((mole, index) => ({ index, mole }))
        .filter(({ mole }) => !mole.active && !mole.whacked);
      
      // If no inactive moles, reset all whacked status
      if (inactiveMoles.length === 0) {
        setMoles(prev => prev.map(mole => ({ ...mole, whacked: false })));
        timerRef.current = window.setTimeout(activateMole, MOLE_HIDE_MIN_TIME);
        return;
      }
      
      // Randomly choose an inactive mole
      const randomIndex = Math.floor(Math.random() * inactiveMoles.length);
      const moleIndex = inactiveMoles[randomIndex].index;
      
      // Activate the mole
      setMoles(prev => prev.map((mole, idx) => 
        idx === moleIndex ? { ...mole, active: true } : mole
      ));
      
      // Determine how long the mole stays active
      const showTime = Math.random() * (MOLE_SHOW_MAX_TIME - MOLE_SHOW_MIN_TIME) + MOLE_SHOW_MIN_TIME;
      
      // Schedule deactivation
      timerRef.current = window.setTimeout(() => {
        setMoles(prev => prev.map((mole, idx) => 
          idx === moleIndex && mole.active && !mole.whacked ? { ...mole, active: false } : mole
        ));
        
        // Schedule next activation
        const hideTime = Math.random() * (MOLE_HIDE_MAX_TIME - MOLE_HIDE_MIN_TIME) + MOLE_HIDE_MIN_TIME;
        timerRef.current = window.setTimeout(activateMole, hideTime);
      }, showTime);
    };
    
    // Start the cycle
    timerRef.current = window.setTimeout(activateMole, 1000);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameActive, moles]);
  
  // Handle mole click/whack
  const whackMole = (id: number) => {
    if (!gameActive) return;
    
    const mole = moles.find(m => m.id === id);
    
    if (mole && mole.active && !mole.whacked) {
      // Update mole state
      setMoles(prev => prev.map(m => 
        m.id === id ? { ...m, active: false, whacked: true } : m
      ));
      
      // Update score
      setScore(prev => prev + 1);
      
      // Play whack sound if enabled
      if (soundEnabled) {
        playWhackSound();
      }
    } else if (mole && !mole.active) {
      // Play miss sound if enabled
      if (soundEnabled) {
        playMissSound();
      }
    }
  };
  
  // Sound effects
  const playWhackSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };
  
  const playMissSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };
  
  const playGameOverSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a descending sequence
    const notes = [659.25, 587.33, 523.25, 493.88]; // E5, D5, C5, B4
    const durations = [0.15, 0.15, 0.15, 0.3];
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + i * durations[i]);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01, 
        audioContext.currentTime + i * durations[i] + durations[i]
      );
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime + i * durations[i]);
      oscillator.stop(audioContext.currentTime + i * durations[i] + durations[i]);
    });
  };
  
  // Create a dynamic CSS grid based on columns and rows
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_SIZE.cols}, 1fr)`,
    gap: '1rem',
  };
  
  return (
    <div className="game-container">
      <div className="game-controls">
        <div>
          <h2 className="text-xl font-bold mb-1">Whack-A-Pixel</h2>
          <div className="flex items-center gap-3">
            <p className="text-gray-400 text-sm">Score: {score}</p>
            <p className={`text-sm ${timeLeft <= 10 ? 'text-error-500' : 'text-gray-400'}`}>
              Time: {timeLeft}s
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={startGame} 
            className="btn btn-primary"
            disabled={gameActive}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      {!gameActive && !gameOver && (
        <div className="text-center my-8">
          <h3 className="text-xl font-bold mb-4 glow-text">Whack-A-Pixel Challenge</h3>
          <p className="mb-6 text-gray-300">
            Click or tap on the pixels as quickly as you can when they appear!
          </p>
          <button 
            onClick={startGame}
            className="btn btn-primary"
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameOver && (
        <div className="text-center my-8 animate-fade-in">
          <h3 className="text-2xl font-bold mb-2 glow-text">Game Over!</h3>
          <p className="text-lg mb-2">
            You whacked {score} pixels.
          </p>
          <p className="text-xl font-bold mb-6">
            Final Score: {score}
          </p>
          <button 
            onClick={startGame}
            className="btn btn-primary"
          >
            Play Again
          </button>
        </div>
      )}
      
      {(gameActive || gameOver) && (
        <div 
          ref={molesRef}
          className="mt-8 max-w-md mx-auto"
          style={gridStyle}
        >
          {moles.map(mole => (
            <div
              key={mole.id}
              className={`
                relative aspect-square overflow-hidden rounded-lg cursor-pointer
                ${mole.active ? 'bg-accent-500' : 'bg-background-card'}
                ${!gameActive ? 'pointer-events-none' : ''}
                transition-colors duration-100
              `}
              onClick={() => whackMole(mole.id)}
            >
              {mole.active && (
                <div 
                  className={`
                    absolute inset-0 flex items-center justify-center
                    ${mole.whacked ? 'animate-fade-out' : 'animate-bounce'}
                  `}
                >
                  <div className="w-4/5 h-4/5 rounded-full bg-accent-400 shadow-glow-accent flex items-center justify-center">
                    <span className="text-2xl">👾</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-background-dark/50 rounded-b-lg"></div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Click or tap on the pixels as soon as they appear!</p>
        <p>Be quick - they won't stay visible for long.</p>
      </div>
    </div>
  );
};

export default WhackAMoleGame;