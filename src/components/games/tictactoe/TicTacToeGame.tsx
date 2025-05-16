import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useGameContext } from '../../../context/GameContext';

// Define types for the board
type CellValue = 'X' | 'O' | null;
type Board = CellValue[];
type GameMode = 'player-vs-player' | 'player-vs-ai';

const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<CellValue | 'draw' | null>(null);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  const [gameMode, setGameMode] = useState<GameMode>('player-vs-player');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const { soundEnabled } = useGameContext();
  
  // Reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };
  
  // Handle cell click
  const handleClick = (index: number) => {
    // Ignore click if cell is filled or game is over
    if (board[index] || winner) return;
    
    // Update the board
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    // Play sound if enabled
    if (soundEnabled) {
      playMoveSound(isXNext ? 'X' : 'O');
    }
    
    // Check for winner
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner !== 'draw') {
        setScore(prev => ({
          ...prev,
          [gameWinner]: prev[gameWinner] + 1
        }));
      } else {
        setScore(prev => ({
          ...prev,
          draws: prev.draws + 1
        }));
      }
      
      // Play win/draw sound if enabled
      if (soundEnabled) {
        if (gameWinner === 'draw') {
          playDrawSound();
        } else {
          playWinSound();
        }
      }
    } else {
      // Switch turn
      setIsXNext(!isXNext);
    }
  };
  
  // AI move
  useEffect(() => {
    if (gameMode === 'player-vs-ai' && !isXNext && !winner) {
      // Add a small delay to make it feel more natural
      const aiTimer = setTimeout(() => {
        let aiMoveIndex;
        
        if (difficulty === 'easy') {
          aiMoveIndex = getRandomMove(board);
        } else {
          aiMoveIndex = getBestMove(board);
        }
        
        if (aiMoveIndex !== -1) {
          handleClick(aiMoveIndex);
        }
      }, 700);
      
      return () => clearTimeout(aiTimer);
    }
  }, [board, isXNext, winner, gameMode, difficulty]);
  
  // Get a random empty cell for easy AI
  const getRandomMove = (board: Board): number => {
    const emptyCells = board
      .map((cell, index) => cell === null ? index : -1)
      .filter(index => index !== -1);
    
    if (emptyCells.length === 0) return -1;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  };
  
  // Get the best move using minimax algorithm for hard AI
  const getBestMove = (board: Board): number => {
    // If the board is empty, return a random corner or center
    if (board.every(cell => cell === null)) {
      const cornerOrCenter = [0, 2, 4, 6, 8];
      return cornerOrCenter[Math.floor(Math.random() * cornerOrCenter.length)];
    }
    
    let bestScore = -Infinity;
    let bestMove = -1;
    
    // Try all possible moves
    for (let i = 0; i < board.length; i++) {
      // Skip if cell is already filled
      if (board[i] !== null) continue;
      
      // Try this move
      const newBoard = [...board];
      newBoard[i] = 'O';
      
      // Get score for this move using minimax
      const score = minimax(newBoard, 0, false);
      
      // Update best move if this is better
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
    
    return bestMove;
  };
  
  // Minimax algorithm for AI
  const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
    // Check if game is over
    const result = calculateWinner(board);
    
    // Return score based on result
    if (result === 'O') return 10 - depth; // AI wins
    if (result === 'X') return depth - 10; // Player wins
    if (result === 'draw') return 0; // Draw
    
    if (isMaximizing) {
      // AI's turn (maximizing)
      let bestScore = -Infinity;
      
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = 'O';
          const score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(bestScore, score);
        }
      }
      
      return bestScore;
    } else {
      // Player's turn (minimizing)
      let bestScore = Infinity;
      
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = 'X';
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(bestScore, score);
        }
      }
      
      return bestScore;
    }
  };
  
  // Calculate winner
  const calculateWinner = (board: Board): CellValue | 'draw' | null => {
    // Winning patterns (rows, columns, diagonals)
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Check for winner
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    // Check for draw (all cells filled)
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }
    
    // Game still in progress
    return null;
  };
  
  // Sound effects
  const playMoveSound = (player: 'X' | 'O') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    
    // Different pitches for X and O
    if (player === 'X') {
      oscillator.frequency.value = 440; // A4
    } else {
      oscillator.frequency.value = 587.33; // D5
    }
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };
  
  const playWinSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a victory arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const times = [0, 0.1, 0.2, 0.3];
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + times[i]);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01, 
        audioContext.currentTime + times[i] + 0.1
      );
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime + times[i]);
      oscillator.stop(audioContext.currentTime + times[i] + 0.1);
    });
  };
  
  const playDrawSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a descending minor sequence
    const notes = [329.63, 311.13, 293.66]; // E4, Eb4, D4
    const times = [0, 0.15, 0.3];
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + times[i]);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01, 
        audioContext.currentTime + times[i] + 0.1
      );
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime + times[i]);
      oscillator.stop(audioContext.currentTime + times[i] + 0.1);
    });
  };
  
  // Render the board
  const renderCell = (index: number) => {
    const value = board[index];
    
    return (
      <button
        className={`
          h-20 w-20 md:h-24 md:w-24 flex items-center justify-center text-3xl font-bold
          border neon-border rounded-lg transition-all duration-300
          ${!value && !winner ? 'hover:bg-background-cardHover hover:shadow-glow-primary' : ''}
          ${value === 'X' ? 'text-primary-500 shadow-glow-primary' : ''}
          ${value === 'O' ? 'text-accent-500 shadow-glow-accent' : ''}
        `}
        onClick={() => handleClick(index)}
        disabled={!!value || !!winner}
      >
        {value}
      </button>
    );
  };
  
  // Render the game status message
  const renderStatus = () => {
    if (winner === 'X' || winner === 'O') {
      return (
        <div className="text-center mb-4">
          <p className={`text-xl font-bold ${winner === 'X' ? 'text-primary-500' : 'text-accent-500'}`}>
            {winner === 'X' ? 'Player X wins!' : 'Player O wins!'}
          </p>
        </div>
      );
    } else if (winner === 'draw') {
      return (
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-gray-400">It's a draw!</p>
        </div>
      );
    } else {
      return (
        <div className="text-center mb-4">
          <p className={`font-medium ${isXNext ? 'text-primary-500' : 'text-accent-500'}`}>
            {gameMode === 'player-vs-ai' && !isXNext ? 'AI thinking...' : `Next player: ${isXNext ? 'X' : 'O'}`}
          </p>
        </div>
      );
    }
  };
  
  return (
    <div className="game-container">
      <div className="game-controls">
        <div>
          <h2 className="text-xl font-bold mb-1">Tic Tac Toe</h2>
          <p className="text-gray-400 text-sm">
            X: {score.X} | O: {score.O} | Draws: {score.draws}
          </p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={gameMode}
            onChange={(e) => {
              setGameMode(e.target.value as GameMode);
              resetGame();
            }}
            className="bg-background-card border neon-border rounded-md px-2 py-1 text-sm"
          >
            <option value="player-vs-player">2 Players</option>
            <option value="player-vs-ai">vs AI</option>
          </select>
          
          {gameMode === 'player-vs-ai' && (
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as 'easy' | 'hard');
                resetGame();
              }}
              className="bg-background-card border neon-border rounded-md px-2 py-1 text-sm"
            >
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </select>
          )}
          
          <button 
            onClick={resetGame} 
            className="btn btn-primary"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      {renderStatus()}
      
      <div className="flex justify-center mt-4">
        <div className="grid grid-cols-3 gap-2">
          {Array(9).fill(null).map((_, index) => (
            <div key={index}>{renderCell(index)}</div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Get three in a row horizontally, vertically, or diagonally to win.</p>
        {gameMode === 'player-vs-ai' && (
          <p className="mt-1">
            {difficulty === 'easy' 
              ? 'Easy AI makes random moves.'
              : 'Hard AI is unbeatable. Try to get a draw!'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;