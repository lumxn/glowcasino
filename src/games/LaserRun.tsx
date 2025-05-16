import React, { useState, useEffect, useRef } from 'react';
import { ZapOff, Play, Ban } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

// Game constants
const GRID_SIZE = 8;
const INITIAL_MULTIPLIER = 1.0;
const MULTIPLIER_INCREMENT = 0.2;

interface GridCell {
  isLaser: boolean;
  revealed: boolean;
  current: boolean;
}

const LaserRun = () => {
  const { placeBet, addWinnings } = useBalance();
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(INITIAL_MULTIPLIER);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [laserCount, setLaserCount] = useState<number>(0);
  const [winnings, setWinnings] = useState<number>(0);
  const [movementEnabled, setMovementEnabled] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellSize = useRef<number>(0);
  
  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);
  
  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || !movementEnabled) return;
      
      switch (e.key) {
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, currentPosition, movementEnabled]);
  
  // Initialize game grid
  const initializeGrid = () => {
    const newGrid: GridCell[][] = Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => ({
        isLaser: false,
        revealed: false,
        current: false
      }))
    );
    
    // Mark starting position (0,0)
    newGrid[0][0].current = true;
    newGrid[0][0].revealed = true;
    
    setGrid(newGrid);
    setCurrentPosition([0, 0]);
    setCurrentMultiplier(INITIAL_MULTIPLIER);
    
    // Draw the grid
    drawGrid(newGrid);
  };
  
  // Draw the grid on canvas
  const drawGrid = (gridData: GridCell[][] = grid) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate cell size
    const cellWidth = width / GRID_SIZE;
    const cellHeight = height / GRID_SIZE;
    cellSize.current = Math.min(cellWidth, cellHeight);
    
    // Draw grid
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = gridData[row][col];
        const x = col * cellSize.current;
        const y = row * cellSize.current;
        
        // Draw cell background
        if (cell.revealed) {
          if (cell.isLaser) {
            // Laser cell
            ctx.fillStyle = '#ef4444'; // Red
          } else if (cell.current) {
            // Current position
            ctx.fillStyle = '#8b5cf6'; // Purple
          } else {
            // Safe path
            ctx.fillStyle = '#1e40af'; // Dark blue
          }
        } else {
          // Unrevealed
          ctx.fillStyle = '#1f2937'; // Gray
        }
        
        ctx.fillRect(x, y, cellSize.current, cellSize.current);
        
        // Add grid lines
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize.current, cellSize.current);
        
        // Draw cell content
        if (cell.revealed) {
          if (cell.isLaser) {
            // Draw laser
            ctx.fillStyle = '#fef2f2';
            
            // Draw lightning bolt
            ctx.beginPath();
            ctx.moveTo(x + cellSize.current * 0.3, y + cellSize.current * 0.25);
            ctx.lineTo(x + cellSize.current * 0.55, y + cellSize.current * 0.45);
            ctx.lineTo(x + cellSize.current * 0.45, y + cellSize.current * 0.55);
            ctx.lineTo(x + cellSize.current * 0.7, y + cellSize.current * 0.75);
            ctx.lineTo(x + cellSize.current * 0.4, y + cellSize.current * 0.6);
            ctx.lineTo(x + cellSize.current * 0.5, y + cellSize.current * 0.5);
            ctx.lineTo(x + cellSize.current * 0.3, y + cellSize.current * 0.25);
            ctx.fill();
            
            // Add glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ef4444';
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (cell.current) {
            // Draw player
            ctx.fillStyle = '#fef2f2';
            ctx.beginPath();
            ctx.arc(
              x + cellSize.current / 2,
              y + cellSize.current / 2,
              cellSize.current * 0.3,
              0,
              Math.PI * 2
            );
            ctx.fill();
            
            // Add glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#8b5cf6';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    }
    
    // Add grid border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);
  };
  
  // Set up canvas
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Make the canvas square
      const size = Math.min(
        canvas.parentElement?.clientWidth || 500, 
        window.innerHeight * 0.6
      );
      
      canvas.width = size;
      canvas.height = size;
      
      drawGrid();
    };
    
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, []);
  
  // Update grid when it changes
  useEffect(() => {
    if (grid.length > 0) {
      drawGrid();
    }
  }, [grid]);
  
  // Start a new game
  const startGame = (amount: number) => {
    if (!placeBet(amount)) return;
    
    setBetAmount(amount);
    setGameActive(true);
    setGameOver(false);
    setWinnings(0);
    setCurrentMultiplier(INITIAL_MULTIPLIER);
    
    // Generate a new grid
    const newGrid: GridCell[][] = Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => ({
        isLaser: false,
        revealed: false,
        current: false
      }))
    );
    
    // Place lasers randomly (starting with just a few)
    let lasersPlaced = 0;
    const initialLasers = 3;
    
    while (lasersPlaced < initialLasers) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      // Don't place on start or end position
      if ((row === 0 && col === 0) || (row === GRID_SIZE - 1 && col === GRID_SIZE - 1)) {
        continue;
      }
      
      if (!newGrid[row][col].isLaser) {
        newGrid[row][col].isLaser = true;
        lasersPlaced++;
      }
    }
    
    // Set starting position
    newGrid[0][0].current = true;
    newGrid[0][0].revealed = true;
    
    setLaserCount(initialLasers);
    setGrid(newGrid);
    setCurrentPosition([0, 0]);
    
    // Enable movement after a short delay to allow player to see the grid
    setTimeout(() => {
      setMovementEnabled(true);
    }, 500);
    
    drawGrid(newGrid);
  };
  
  // Move player
  const movePlayer = (deltaX: number, deltaY: number) => {
    const [row, col] = currentPosition;
    const newRow = row + deltaY;
    const newCol = col + deltaX;
    
    // Check if valid move
    if (
      newRow < 0 || 
      newRow >= GRID_SIZE || 
      newCol < 0 || 
      newCol >= GRID_SIZE
    ) {
      return;
    }
    
    // Update grid
    const newGrid = [...grid];
    
    // Remove player from current position
    newGrid[row][col] = {
      ...newGrid[row][col],
      current: false
    };
    
    // Add player to new position
    newGrid[newRow][newCol] = {
      ...newGrid[newRow][newCol],
      revealed: true,
      current: true
    };
    
    setGrid(newGrid);
    setCurrentPosition([newRow, newCol]);
    
    // Check if hit a laser
    if (newGrid[newRow][newCol].isLaser) {
      handleGameOver(false);
      return;
    }
    
    // Check if reached the end
    if (newRow === GRID_SIZE - 1 && newCol === GRID_SIZE - 1) {
      handleGameOver(true);
      return;
    }
    
    // Increase multiplier
    setCurrentMultiplier(prev => prev + MULTIPLIER_INCREMENT);
    
    // Chance to add a new laser after each move
    if (Math.random() < 0.3 && laserCount < GRID_SIZE * GRID_SIZE * 0.4) {
      addNewLaser(newGrid);
    }
  };
  
  // Add a new laser to the grid
  const addNewLaser = (currentGrid: GridCell[][]) => {
    let placed = false;
    const newGrid = [...currentGrid];
    
    // Try to place a new laser up to 10 times
    for (let attempt = 0; attempt < 10 && !placed; attempt++) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const [playerRow, playerCol] = currentPosition;
      
      // Don't place on player, start, end, or existing laser
      if (
        (row === playerRow && col === playerCol) ||
        (row === 0 && col === 0) ||
        (row === GRID_SIZE - 1 && col === GRID_SIZE - 1) ||
        newGrid[row][col].isLaser
      ) {
        continue;
      }
      
      newGrid[row][col].isLaser = true;
      placed = true;
      setLaserCount(prev => prev + 1);
    }
    
    if (placed) {
      setGrid(newGrid);
    }
  };
  
  // Handle game over
  const handleGameOver = (win: boolean) => {
    setGameActive(false);
    setGameOver(true);
    setMovementEnabled(false);
    
    // Reveal all lasers
    const revealedGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        revealed: true
      }))
    );
    
    setGrid(revealedGrid);
    
    if (win) {
      // Calculate winnings
      const win = betAmount * currentMultiplier;
      setWinnings(win);
      addWinnings(win);
    }
  };
  
  // Cash out (end game early and claim current multiplier)
  const cashOut = () => {
    if (!gameActive) return;
    
    // Calculate winnings
    const win = betAmount * currentMultiplier;
    setWinnings(win);
    addWinnings(win);
    
    // End game
    setGameActive(false);
    setGameOver(true);
    setMovementEnabled(false);
    
    // Reveal all lasers
    const revealedGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        revealed: true
      }))
    );
    
    setGrid(revealedGrid);
  };
  
  // Handle button control clicks (for mobile)
  const handleButtonControl = (direction: string) => {
    if (!gameActive || !movementEnabled) return;
    
    switch (direction) {
      case 'up':
        movePlayer(0, -1);
        break;
      case 'down':
        movePlayer(0, 1);
        break;
      case 'left':
        movePlayer(-1, 0);
        break;
      case 'right':
        movePlayer(1, 0);
        break;
    }
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <ZapOff className="w-6 h-6 text-cyan-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Laser Run</h1>
          </div>
          <p className="text-gray-400">
            Navigate through the grid, avoid lasers, and increase your multiplier!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg p-4 border border-blue-900/30">
                  <div className="text-sm text-gray-300 mb-1">Current Bet</div>
                  <div className="text-xl font-bold text-white">${betAmount.toFixed(2)}</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg p-4 border border-purple-900/30">
                  <div className="text-sm text-gray-300 mb-1">Multiplier</div>
                  <div className="text-xl font-bold text-green-400">{currentMultiplier.toFixed(2)}x</div>
                </div>
                
                <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 rounded-lg p-4 border border-red-900/30">
                  <div className="text-sm text-gray-300 mb-1">Lasers</div>
                  <div className="text-xl font-bold text-red-400">{laserCount}</div>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <canvas 
                    ref={canvasRef}
                    className="bg-gray-900 rounded-lg shadow-lg"
                  />
                  
                  {!gameActive && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                      <div className="text-center">
                        <p className="text-white text-xl mb-4">Ready to play?</p>
                        <button
                          onClick={() => startGame(betAmount)}
                          disabled={betAmount <= 0}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-500 hover:to-blue-500 flex items-center mx-auto"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Game
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                      <div className="text-center">
                        {winnings > 0 ? (
                          <div>
                            <p className="text-green-400 text-2xl font-bold mb-2">You Won!</p>
                            <p className="text-white text-xl mb-4">
                              ${winnings.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-red-400 text-xl mb-4">
                            Game Over! You hit a laser!
                          </p>
                        )}
                        
                        <button
                          onClick={() => startGame(betAmount)}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-500 hover:to-blue-500 flex items-center mx-auto"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Play Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile Controls */}
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-6">
                <div></div>
                <button
                  onClick={() => handleButtonControl('up')}
                  disabled={!gameActive || !movementEnabled}
                  className="bg-gray-700 hover:bg-gray-600 rounded-md p-3 flex justify-center disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <div></div>
                
                <button
                  onClick={() => handleButtonControl('left')}
                  disabled={!gameActive || !movementEnabled}
                  className="bg-gray-700 hover:bg-gray-600 rounded-md p-3 flex justify-center disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => handleButtonControl('down')}
                  disabled={!gameActive || !movementEnabled}
                  className="bg-gray-700 hover:bg-gray-600 rounded-md p-3 flex justify-center disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => handleButtonControl('right')}
                  disabled={!gameActive || !movementEnabled}
                  className="bg-gray-700 hover:bg-gray-600 rounded-md p-3 flex justify-center disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {gameActive && (
                <div className="flex justify-center">
                  <button
                    onClick={cashOut}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium hover:from-green-500 hover:to-emerald-500 flex items-center"
                  >
                    <Ban className="w-5 h-5 mr-2" />
                    Cash Out (${(betAmount * currentMultiplier).toFixed(2)})
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            {!gameActive && !gameOver ? (
              <BetInput 
                onBetPlaced={startGame} 
              />
            ) : (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-gray-400 mb-2">Potential Payout</h3>
                <p className="text-xl font-bold text-green-400">
                  ${(betAmount * currentMultiplier).toFixed(2)}
                </p>
                
                <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${Math.min((currentMultiplier / 5) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">Controls</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Desktop: Use arrow keys to move</p>
                <p>Mobile: Use the on-screen buttons</p>
                <p className="mt-2 text-yellow-400">Press "Cash Out" any time to end your run and collect your winnings!</p>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
                <li>Place your bet</li>
                <li>Navigate from the top-left to bottom-right</li>
                <li>Avoid the red lasers!</li>
                <li>Every safe move increases your multiplier by 0.2x</li>
                <li>New lasers may appear after each move</li>
                <li>Cash out anytime to secure your winnings</li>
                <li>Hit a laser and you lose everything!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaserRun;