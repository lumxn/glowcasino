import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Clock, X, Check } from 'lucide-react';
import { useGameContext } from '../../../context/GameContext';

// List of words for the game
const WORDS = [
  'ARCADE', 'GAMING', 'PLAYER', 'PUZZLE', 'VICTORY', 
  'CHALLENGE', 'STRATEGY', 'LEVEL', 'SCORE', 'BONUS',
  'JOYSTICK', 'CONSOLE', 'POINTS', 'WINNER', 'TROPHY',
  'KEYBOARD', 'CONTROLLER', 'CHAMPION', 'DIGITAL', 'QUEST',
  'MISSION', 'ADVENTURE', 'CHARACTER', 'PLATFORM', 'CLASSIC',
  'RETRO', 'MODERN', 'EXPERIENCE', 'ACHIEVEMENT', 'MASTER'
];

// Game difficulty settings
const DIFFICULTY = {
  easy: { timeLimit: 45, pointsPerWord: 10, minWordLength: 4, maxWordLength: 6 },
  medium: { timeLimit: 30, pointsPerWord: 15, minWordLength: 5, maxWordLength: 8 },
  hard: { timeLimit: 20, pointsPerWord: 25, minWordLength: 6, maxWordLength: 10 }
};

type Difficulty = 'easy' | 'medium' | 'hard';

const WordScrambleGame: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<string>('');
  const [scrambledWord, setScrambledWord] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [wordCount, setWordCount] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addScore, soundEnabled } = useGameContext();
  
  // Start a new game
  const startGame = () => {
    setScore(0);
    setWordCount(0);
    setTimeLeft(DIFFICULTY[difficulty].timeLimit);
    setGameActive(true);
    setGameOver(false);
    setFeedback({ type: 'none', message: '' });
    nextWord();
    
    // Focus the input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Get a random word based on difficulty
  const getRandomWord = (): string => {
    // Filter words by length based on difficulty
    const { minWordLength, maxWordLength } = DIFFICULTY[difficulty];
    const filteredWords = WORDS.filter(
      word => word.length >= minWordLength && word.length <= maxWordLength
    );
    
    // Get a random word
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];
  };
  
  // Scramble a word
  const scrambleWord = (word: string): string => {
    const letters = word.split('');
    
    // Shuffle the letters (Fisher-Yates algorithm)
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // If the scrambled word is the same as the original, scramble again
    if (letters.join('') === word) {
      return scrambleWord(word);
    }
    
    return letters.join('');
  };
  
  // Move to the next word
  const nextWord = () => {
    const word = getRandomWord();
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setUserInput('');
    setFeedback({ type: 'none', message: '' });
  };
  
  // Handle user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value.toUpperCase());
  };
  
  // Check the user's answer
  const checkAnswer = () => {
    if (userInput.toUpperCase() === currentWord) {
      // Correct answer
      const pointsEarned = DIFFICULTY[difficulty].pointsPerWord;
      setScore(score + pointsEarned);
      setWordCount(wordCount + 1);
      setFeedback({ 
        type: 'success', 
        message: `Correct! +${pointsEarned} points` 
      });
      
      // Play success sound if enabled
      if (soundEnabled) {
        playSuccessSound();
      }
      
      // Move to next word after a short delay
      setTimeout(() => {
        nextWord();
      }, 1000);
    } else {
      // Wrong answer
      setFeedback({ 
        type: 'error', 
        message: 'Try again!' 
      });
      
      // Play error sound if enabled
      if (soundEnabled) {
        playErrorSound();
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() !== '') {
      checkAnswer();
    }
  };
  
  // Sound effects
  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a short ascending arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const durations = [0.1, 0.1, 0.2];
    
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
  
  const playErrorSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
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
  
  // Game timer
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          setGameOver(true);
          addScore('wordscramble', score);
          
          // Play game over sound if enabled
          if (soundEnabled) {
            playGameOverSound();
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);
  
  // Hint system: reveal one letter at a time
  const getHint = () => {
    if (!gameActive) return;
    
    // Compare current input with the actual word
    let hintIndex = -1;
    
    for (let i = 0; i < currentWord.length; i++) {
      if (i >= userInput.length || userInput[i] !== currentWord[i]) {
        hintIndex = i;
        break;
      }
    }
    
    if (hintIndex !== -1) {
      // Add the next correct letter
      setUserInput((prev) => {
        const newInput = prev.substring(0, hintIndex) + currentWord[hintIndex] + prev.substring(hintIndex + 1);
        return newInput;
      });
      
      // Penalty for using hint
      setTimeLeft(prev => Math.max(1, prev - 3));
    }
  };
  
  return (
    <div className="game-container">
      <div className="game-controls">
        <div>
          <h2 className="text-xl font-bold mb-1">Word Scramble</h2>
          <div className="flex items-center gap-3">
            <p className="text-gray-400 text-sm">Score: {score}</p>
            <p className="text-gray-400 text-sm">Words: {wordCount}</p>
            <div className={`flex items-center gap-1 text-sm ${timeLeft <= 10 ? 'text-error-500' : 'text-gray-400'}`}>
              <Clock size={14} />
              <span>{timeLeft}s</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-background-card border neon-border rounded-md px-2 py-1 text-sm"
            disabled={gameActive}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
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
          <h3 className="text-xl font-bold mb-4 glow-text">Word Scramble Challenge</h3>
          <p className="mb-2 text-gray-300">
            Unscramble as many words as you can before time runs out!
          </p>
          <p className="mb-6 text-gray-400 text-sm">
            Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - 
            {DIFFICULTY[difficulty].timeLimit} seconds, 
            {DIFFICULTY[difficulty].pointsPerWord} points per word
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
            You unscrambled {wordCount} words.
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
      
      {gameActive && (
        <div className="flex flex-col items-center mt-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-400 mb-1">Unscramble this word:</p>
            <div className="flex justify-center mb-4">
              {scrambledWord.split('').map((letter, index) => (
                <div 
                  key={index}
                  className="w-10 h-12 flex items-center justify-center text-xl font-bold border neon-border m-1 rounded shadow-glow-primary"
                >
                  {letter}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="relative w-full max-w-xs">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full bg-background-card border neon-border rounded-lg px-4 py-2 text-lg text-center uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type your answer"
                  autoComplete="off"
                  autoCapitalize="characters"
                  maxLength={currentWord.length}
                />
                {userInput && (
                  <button
                    type="button"
                    onClick={() => setUserInput('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={!userInput}
                >
                  Submit <Check size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={getHint}
                  className="btn btn-secondary"
                >
                  Hint (-3s)
                </button>
              </div>
            </form>
            
            {feedback.type !== 'none' && (
              <div className={`mt-4 text-${feedback.type === 'success' ? 'success' : 'error'}-500 flex items-center justify-center gap-2`}>
                {feedback.type === 'success' ? (
                  <Check size={16} />
                ) : (
                  <X size={16} />
                )}
                <p>{feedback.message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordScrambleGame;