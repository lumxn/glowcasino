import React, { useState, useEffect } from 'react';
import { AlertTriangle as TriangleAlert, Bomb, Gem, RefreshCcw, Ban } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

interface GridCell {
  revealed: boolean;
  isMine: boolean;
  exploded?: boolean;
}

const DEFAULT_GRID_SIZE = 5;
const DEFAULT_MINES_COUNT = 5;

const Mines = () => {
  const { placeBet, addWinnings } = useBalance();
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [minesCount, setMinesCount] = useState<number>(DEFAULT_MINES_COUNT);
  const [gridSize] = useState<number>(DEFAULT_GRID_SIZE);
  
  // Initialize the grid
  const initializeGrid = (mines: number) => {
    // Create empty grid
    const newGrid: GridCell[][] = Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(0).map(() => ({
        revealed: false,
        isMine: false
      }))
    );
    
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }
    
    return newGrid;
  };
  
  // Calculate the current multiplier
  useEffect(() => {
    if (!gameActive) return;
    
    const totalCells = gridSize * gridSize;
    const safeCells = totalCells - minesCount;
    
    // This is a simplified multiplier calculation
    // In a real game, you'd want a more sophisticated formula
    if (revealedCount === 0) {
      setCurrentMultiplier(1);
    } else {
      // Calculate new multiplier based on how many cells have been revealed
      // Higher risk (more revealed) = higher multiplier
      const multiplier = ((1 / (safeCells - revealedCount)) * safeCells * 0.98).toFixed(2);
      setCurrentMultiplier(parseFloat(multiplier));
    }
  }, [revealedCount, gameActive, minesCount, gridSize]);
  
  // Start a new game
  const startGame = (amount: number) => {
    if (!placeBet(amount)) return;
    
    setBetAmount(amount);
    setGrid(initializeGrid(minesCount));
    setGameActive(true);
    setGameOver(false);
    setRevealedCount(0);
    setCurrentMultiplier(1);
  };
  
  // Handle cell click
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!gameActive || gameOver || grid[rowIndex][colIndex].revealed) return;
    
    const updatedGrid = [...grid];
    const cell = updatedGrid[rowIndex][colIndex];
    
    // Reveal the cell
    cell.revealed = true;
    
    if (cell.isMine) {
      // Hit a mine - game over
      cell.exploded = true;
      setGameOver(true);
      setGameActive(false);
    } else {
      // Safe cell - update revealed count
      setRevealedCount(prevCount => prevCount + 1);
      
      // Check if all safe cells are revealed (game won)
      const totalCells = gridSize * gridSize;
      const safeCells = totalCells - minesCount;
      
      if (revealedCount + 1 >= safeCells) {
        // All safe cells revealed, game won
        setGameOver(true);
        setGameActive(false);
        
        // Award winnings
        addWinnings(betAmount * currentMultiplier);
      }
    }
    
    setGrid(updatedGrid);
  };
  
  // Cash out (claim current winnings)
  const handleCashout = () => {
    if (!gameActive || gameOver || revealedCount === 0) return;
    
    const winnings = betAmount * currentMultiplier;
    addWinnings(winnings);
    
    setGameActive(false);
    setGameOver(true);
  };
  
  // Update mines count
  const handleMinesCountChange = (newCount: number) => {
    if (gameActive) return;
    setMinesCount(newCount);
  };
  
  // Reveal all mines at game over
  const revealAllMines = () => {
    return grid.map((row, rowIndex) => 
      row.map((cell, colIndex) => {
        if (cell.isMine) {
          return { ...cell, revealed: true };
        }
        return cell;
      })
    );
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <TriangleAlert className="w-6 h-6 text-red-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Mines</h1>
          </div>
          <p className="text-gray-400">
            Navigate through the minefield, avoid explosions, and cash out your winnings!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-gray-300">
                  <span className="text-sm mr-2">Multiplier:</span>
                  <span className={`text-xl font-bold ${gameActive ? 'text-green-400' : 'text-gray-500'}`}>
                    {currentMultiplier.toFixed(2)}x
                  </span>
                </div>
                
                {gameActive && (
                  <button
                    onClick={handleCashout}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium hover:from-green-500 hover:to-emerald-500 flex items-center"
                    disabled={!gameActive || revealedCount === 0}
                  >
                    <Gem className="w-4 h-4 mr-1" /> 
                    Cash Out ${(betAmount * currentMultiplier).toFixed(2)}
                  </button>
                )}
                
                {gameOver && (
                  <button
                    onClick={() => startGame(betAmount)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-indigo-500 flex items-center"
                  >
                    <RefreshCcw className="w-4 h-4 mr-1" /> 
                    Play Again
                  </button>
                )}
              </div>
              
              <div className="mb-6 flex justify-center">
                <div className="grid grid-cols-5 gap-2 w-full max-w-md">
                  {grid.map((row, rowIndex) => 
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        disabled={!gameActive || gameOver || cell.revealed}
                        className={`aspect-square rounded-md transition-all duration-300 flex items-center justify-center ${
                          cell.revealed
                            ? cell.isMine
                              ? cell.exploded
                                ? 'bg-red-600 animate-pulse'
                                : 'bg-red-900'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {cell.revealed && (
                          cell.isMine ? (
                            <Bomb className="w-6 h-6 text-white" />
                          ) : (
                            <Gem className="w-6 h-6 text-white" />
                          )
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {gameOver && (
                <div className={`p-4 rounded-lg text-center ${
                  grid.some(row => row.some(cell => cell.exploded))
                    ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                    : 'bg-green-500/20 border border-green-500/30 text-green-300'
                }`}>
                  {grid.some(row => row.some(cell => cell.exploded)) 
                    ? 'BOOM! You hit a mine!'
                    : `You won $${(betAmount * currentMultiplier).toFixed(2)}!`}
                </div>
              )}
            </div>
          </div>
          
          <div>
            {!gameActive ? (
              <>
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-3">Number of Mines</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[3, 5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleMinesCountChange(num)}
                        className={`py-2 rounded-md text-center transition-colors ${
                          minesCount === num
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    More mines = higher risk & higher rewards
                  </div>
                </div>
                
                <BetInput onBetPlaced={startGame} />
              </>
            ) : (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-gray-400 mb-2">Current Bet</h3>
                <p className="text-xl font-bold text-green-400">${betAmount.toFixed(2)}</p>
                
                <div className="mt-4 text-sm text-gray-300">
                  <div className="flex justify-between mb-1">
                    <span>Mines:</span>
                    <span className="text-red-400">{minesCount}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Gems Found:</span>
                    <span className="text-blue-400">{revealedCount}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
                <li>Choose the number of mines and place your bet</li>
                <li>Click on tiles to reveal gems (safe) or mines (lose)</li>
                <li>Each safe tile increases your multiplier</li>
                <li>Cash out anytime to secure your winnings</li>
                <li>Hit a mine and you lose your bet</li>
                <li>Find all gems to win the maximum prize</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mines;