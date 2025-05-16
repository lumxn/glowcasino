import React, { useState, useEffect, useRef } from 'react';
import { Gem, Play, RotateCcw } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

// Grid size
const GRID_SIZE = 8;
const MIN_MATCH = 3;

// Gem types
const GEM_TYPES = [
  { name: 'diamond', color: '#3b82f6', value: 1 },   // Blue
  { name: 'ruby', color: '#ef4444', value: 1.5 },    // Red
  { name: 'emerald', color: '#10b981', value: 2 },   // Green
  { name: 'sapphire', color: '#6366f1', value: 2.5 }, // Indigo
  { name: 'amethyst', color: '#8b5cf6', value: 3 },  // Purple
  { name: 'topaz', color: '#f59e0b', value: 4 },     // Amber
];

interface GemCell {
  type: number;
  selected: boolean;
  matched: boolean;
  removed: boolean;
}

const GemBreaker = () => {
  const { placeBet, addWinnings } = useBalance();
  const [grid, setGrid] = useState<GemCell[][]>([]);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [selectedGem, setSelectedGem] = useState<[number, number] | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [moves, setMoves] = useState<number>(10);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [animations, setAnimations] = useState<boolean>(false);
  const [matchAnimation, setMatchAnimation] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellSize = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  
  // Initialize the grid
  useEffect(() => {
    initializeGame();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const size = Math.min(
        canvas.parentElement?.clientWidth || 500,
        window.innerHeight * 0.6
      );
      
      canvas.width = size;
      canvas.height = size;
      
      cellSize.current = size / GRID_SIZE;
      
      drawGrid();
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Draw grid when it changes
  useEffect(() => {
    if (grid.length > 0) {
      drawGrid();
    }
  }, [grid, selectedGem]);
  
  // Initialize a new game
  const initializeGame = () => {
    // Create random grid
    const newGrid: GemCell[][] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = {
          type: Math.floor(Math.random() * GEM_TYPES.length),
          selected: false,
          matched: false,
          removed: false
        };
      }
    }
    
    // Ensure no initial matches
    let hasMatches = true;
    while (hasMatches) {
      hasMatches = false;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const matches = findMatches(newGrid, row, col);
          if (matches.length >= MIN_MATCH) {
            hasMatches = true;
            newGrid[row][col].type = Math.floor(Math.random() * GEM_TYPES.length);
          }
        }
      }
    }
    
    setGrid(newGrid);
    setSelectedGem(null);
    setCurrentScore(0);
    setMultiplier(1);
    setMoves(10);
    setGameOver(false);
    
    drawGrid();
  };
  
  // Draw the grid on canvas
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);
    
    // Draw each gem
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const gem = grid[row][col];
        if (gem.removed) continue;
        
        const x = col * cellSize.current;
        const y = row * cellSize.current;
        
        // Draw gem background
        const gemType = GEM_TYPES[gem.type];
        
        ctx.fillStyle = gem.matched 
          ? '#ffffff' 
          : gem.selected || (selectedGem && selectedGem[0] === row && selectedGem[1] === col) 
            ? '#ffffff' 
            : gemType.color;
        
        // Add shadow/glow for selected or matched gems
        if (gem.matched || gem.selected || (selectedGem && selectedGem[0] === row && selectedGem[1] === col)) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = gemType.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        const padding = cellSize.current * 0.1;
        const size = cellSize.current - padding * 2;
        
        // Draw gem shape (diamond)
        ctx.beginPath();
        ctx.moveTo(x + cellSize.current / 2, y + padding);
        ctx.lineTo(x + cellSize.current - padding, y + cellSize.current / 2);
        ctx.lineTo(x + cellSize.current / 2, y + cellSize.current - padding);
        ctx.lineTo(x + padding, y + cellSize.current / 2);
        ctx.closePath();
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Add gem facets/details
        ctx.strokeStyle = gem.matched ? gemType.color : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + cellSize.current / 2, y + padding + size * 0.2);
        ctx.lineTo(x + cellSize.current - padding - size * 0.2, y + cellSize.current / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + cellSize.current / 2, y + cellSize.current - padding - size * 0.2);
        ctx.lineTo(x + padding + size * 0.2, y + cellSize.current / 2);
        ctx.stroke();
      }
    }
    
    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize.current, 0);
      ctx.lineTo(i * cellSize.current, height);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize.current);
      ctx.lineTo(width, i * cellSize.current);
      ctx.stroke();
    }
  };
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameActive || gameOver || animations) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate clicked cell
    const col = Math.floor(x / cellSize.current);
    const row = Math.floor(y / cellSize.current);
    
    // Check if valid cell
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return;
    }
    
    // Check if cell is removed
    if (grid[row][col].removed) {
      return;
    }
    
    // If no gem is selected, select this one
    if (selectedGem === null) {
      setSelectedGem([row, col]);
      
      // Update grid to show selection
      const newGrid = [...grid];
      newGrid[row][col].selected = true;
      setGrid(newGrid);
      
      return;
    }
    
    // If the same gem is clicked again, deselect it
    if (selectedGem[0] === row && selectedGem[1] === col) {
      setSelectedGem(null);
      
      // Update grid to remove selection
      const newGrid = [...grid];
      newGrid[row][col].selected = false;
      setGrid(newGrid);
      
      return;
    }
    
    // Check if the gems are adjacent
    const [selectedRow, selectedCol] = selectedGem;
    const isAdjacent = 
      (Math.abs(selectedRow - row) === 1 && selectedCol === col) ||
      (Math.abs(selectedCol - col) === 1 && selectedRow === row);
    
    if (!isAdjacent) {
      // Not adjacent, select the new gem instead
      const newGrid = [...grid];
      newGrid[selectedRow][selectedCol].selected = false;
      newGrid[row][col].selected = true;
      setGrid(newGrid);
      setSelectedGem([row, col]);
      
      return;
    }
    
    // Try to swap gems
    swapGems(selectedRow, selectedCol, row, col);
  };
  
  // Swap two gems
  const swapGems = (row1: number, col1: number, row2: number, col2: number) => {
    // Create a copy of the grid
    const newGrid = [...grid];
    
    // Swap gems
    const temp = { ...newGrid[row1][col1] };
    newGrid[row1][col1] = { ...newGrid[row2][col2] };
    newGrid[row2][col2] = temp;
    
    // Reset selection
    newGrid[row1][col1].selected = false;
    newGrid[row2][col2].selected = false;
    
    // Check if the swap creates any matches
    const matches1 = findMatches(newGrid, row1, col1);
    const matches2 = findMatches(newGrid, row2, col2);
    
    const hasMatches = matches1.length >= MIN_MATCH || matches2.length >= MIN_MATCH;
    
    if (!hasMatches) {
      // Swap back if no matches
      const tempBack = { ...newGrid[row1][col1] };
      newGrid[row1][col1] = { ...newGrid[row2][col2] };
      newGrid[row2][col2] = tempBack;
      
      setGrid(newGrid);
      setSelectedGem(null);
      
      return;
    }
    
    // If we have matches, process them
    setAnimations(true);
    setMoves(prev => prev - 1);
    setSelectedGem(null);
    
    // Mark matched gems
    const allMatches = [...matches1, ...matches2];
    allMatches.forEach(([r, c]) => {
      newGrid[r][c].matched = true;
    });
    
    setGrid(newGrid);
    setMatchAnimation(true);
    
    // After a short animation, remove matched gems and drop new ones
    setTimeout(() => {
      // Calculate score based on number of matches
      const uniqueMatches = new Set(allMatches.map(([r, c]) => `${r},${c}`));
      const matchCount = uniqueMatches.size;
      
      // Calculate points based on gem values
      let points = 0;
      allMatches.forEach(([r, c]) => {
        const gemType = newGrid[r][c].type;
        points += GEM_TYPES[gemType].value;
      });
      
      setCurrentScore(prev => prev + points);
      
      // Increase multiplier for larger matches
      if (matchCount >= 5) {
        setMultiplier(prev => Math.min(prev + 0.5, 5));
      }
      
      // Process matches: remove matched gems and drop new ones
      processMatches(newGrid);
      
      setMatchAnimation(false);
    }, 500);
  };
  
  // Find matches for a gem at position (row, col)
  const findMatches = (grid: GemCell[][], row: number, col: number): [number, number][] => {
    const gemType = grid[row][col].type;
    
    // Check horizontal matches
    const horizontalMatches: [number, number][] = [[row, col]];
    
    // Check left
    let leftCol = col - 1;
    while (leftCol >= 0 && grid[row][leftCol].type === gemType) {
      horizontalMatches.push([row, leftCol]);
      leftCol--;
    }
    
    // Check right
    let rightCol = col + 1;
    while (rightCol < GRID_SIZE && grid[row][rightCol].type === gemType) {
      horizontalMatches.push([row, rightCol]);
      rightCol++;
    }
    
    // Check vertical matches
    const verticalMatches: [number, number][] = [[row, col]];
    
    // Check up
    let upRow = row - 1;
    while (upRow >= 0 && grid[upRow][col].type === gemType) {
      verticalMatches.push([upRow, col]);
      upRow--;
    }
    
    // Check down
    let downRow = row + 1;
    while (downRow < GRID_SIZE && grid[downRow][col].type === gemType) {
      verticalMatches.push([downRow, col]);
      downRow++;
    }
    
    // Return the longest sequence if it's at least MIN_MATCH
    if (horizontalMatches.length >= MIN_MATCH && horizontalMatches.length >= verticalMatches.length) {
      return horizontalMatches;
    } else if (verticalMatches.length >= MIN_MATCH) {
      return verticalMatches;
    }
    
    return [];
  };
  
  // Process matches: remove matched gems and drop new ones
  const processMatches = (currentGrid: GemCell[][]) => {
    const newGrid = [...currentGrid];
    
    // Remove matched gems
    for (let col = 0; col < GRID_SIZE; col++) {
      const gemsInColumn = [];
      
      // Collect non-matched gems
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (!newGrid[row][col].matched) {
          gemsInColumn.push({ ...newGrid[row][col] });
        }
      }
      
      // Add new gems at the top
      while (gemsInColumn.length < GRID_SIZE) {
        gemsInColumn.push({
          type: Math.floor(Math.random() * GEM_TYPES.length),
          selected: false,
          matched: false,
          removed: false
        });
      }
      
      // Update the column
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        newGrid[row][col] = gemsInColumn[GRID_SIZE - 1 - row];
      }
    }
    
    setGrid(newGrid);
    
    // Check for cascading matches
    let hasMatches = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const matches = findMatches(newGrid, row, col);
        if (matches.length >= MIN_MATCH) {
          hasMatches = true;
          
          // Mark new matches
          matches.forEach(([r, c]) => {
            newGrid[r][c].matched = true;
          });
        }
      }
    }
    
    if (hasMatches) {
      // If we have cascading matches, process them after a delay
      setMatchAnimation(true);
      setGrid(newGrid);
      
      setTimeout(() => {
        // Calculate additional points
        let points = 0;
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (newGrid[row][col].matched) {
              const gemType = newGrid[row][col].type;
              points += GEM_TYPES[gemType].value;
            }
          }
        }
        
        // Add bonus for cascading matches
        points *= 1.5;
        setCurrentScore(prev => prev + points);
        
        // Increase multiplier for cascades
        setMultiplier(prev => Math.min(prev + 0.2, 5));
        
        processMatches(newGrid);
        setMatchAnimation(false);
      }, 500);
    } else {
      // No more matches, end animation phase
      setAnimations(false);
      
      // Check if game over
      if (moves <= 0) {
        endGame();
      }
    }
  };
  
  // End the game
  const endGame = () => {
    setGameOver(true);
    setGameActive(false);
    
    // Calculate final score with multiplier
    const finalScore = currentScore * multiplier;
    
    // Add winnings
    addWinnings(betAmount * finalScore / 100);
  };
  
  // Start a new game
  const startGame = (amount: number) => {
    if (!placeBet(amount)) return;
    
    setBetAmount(amount);
    setGameActive(true);
    initializeGame();
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <Gem className="w-6 h-6 text-emerald-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Gem Breaker</h1>
          </div>
          <p className="text-gray-400">
            Match and break gems to multiply your bet!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 rounded-lg p-4 border border-emerald-900/30">
                  <div className="text-sm text-gray-300 mb-1">Score</div>
                  <div className="text-xl font-bold text-white">{currentScore.toFixed(1)}</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg p-4 border border-purple-900/30">
                  <div className="text-sm text-gray-300 mb-1">Multiplier</div>
                  <div className="text-xl font-bold text-green-400">{multiplier.toFixed(1)}x</div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg p-4 border border-blue-900/30">
                  <div className="text-sm text-gray-300 mb-1">Moves Left</div>
                  <div className="text-xl font-bold text-yellow-400">{moves}</div>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <canvas 
                    ref={canvasRef}
                    className={`bg-gray-900 rounded-lg shadow-lg ${
                      matchAnimation ? 'animate-pulse' : ''
                    }`}
                    onClick={handleCanvasClick}
                  />
                  
                  {!gameActive && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                      <div className="text-center">
                        <p className="text-white text-xl mb-4">Ready to play?</p>
                        <button
                          onClick={() => startGame(betAmount)}
                          disabled={betAmount <= 0}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg text-white font-medium hover:from-emerald-500 hover:to-green-500 flex items-center mx-auto"
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
                        <p className="text-green-400 text-2xl font-bold mb-2">Game Over!</p>
                        <p className="text-white text-xl mb-2">
                          Score: {currentScore.toFixed(1)} × {multiplier.toFixed(1)}x
                        </p>
                        <p className="text-green-400 text-2xl font-bold mb-4">
                          You Won: ${(betAmount * currentScore * multiplier / 100).toFixed(2)}!
                        </p>
                        
                        <button
                          onClick={() => startGame(betAmount)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg text-white font-medium hover:from-emerald-500 hover:to-green-500 flex items-center mx-auto"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Play Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {gameActive && !gameOver && (
                <div className="text-center text-gray-300">
                  {selectedGem ? "Select an adjacent gem to swap" : "Select a gem to start matching"}
                </div>
              )}
            </div>
          </div>
          
          <div>
            {!gameActive ? (
              <BetInput 
                onBetPlaced={startGame} 
              />
            ) : (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-gray-400 mb-2">Current Bet</h3>
                <p className="text-xl font-bold text-green-400">${betAmount.toFixed(2)}</p>
                
                <div className="mt-4 text-sm text-gray-400">
                  <p>Potential payout: ${(betAmount * currentScore * multiplier / 100).toFixed(2)}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">Gem Values</h3>
              <div className="grid grid-cols-3 gap-2">
                {GEM_TYPES.map((gem, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-10 h-10 mb-1"
                      style={{ 
                        backgroundColor: gem.color,
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' 
                      }}
                    ></div>
                    <span className="text-gray-300 text-sm">{gem.value}x</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
                <li>Click a gem, then click an adjacent gem to swap</li>
                <li>Match 3 or more gems in a row or column to break them</li>
                <li>Each match earns points based on gem values</li>
                <li>Large matches (5+ gems) increase your multiplier</li>
                <li>Chain reactions (cascades) give 1.5x bonus points</li>
                <li>You have 10 moves to earn the highest score</li>
                <li>Final payout = (Bet × Score × Multiplier) ÷ 100</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemBreaker;