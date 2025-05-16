import React, { useState, useEffect, useRef } from 'react';
import { CircleDot, Play, RefreshCcw } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

// Constants for the plinko board
const ROWS = 8;
const PINS_PER_ROW = 10;
const PIN_SIZE = 10;
const BALL_SIZE = 16;

// The possible multipliers at the bottom
const MULTIPLIERS = [
  0.2, 0.5, 1, 2, 5, 10, 5, 2, 1, 0.5, 0.2
];

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  multiplier: number | null;
}

const Plinko = () => {
  const { placeBet, addWinnings } = useBalance();
  const [balls, setBalls] = useState<Ball[]>([]);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [winnings, setWinnings] = useState<number>(0);
  const [animation, setAnimation] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardWidth = useRef<number>(0);
  const boardHeight = useRef<number>(0);
  const pinLocations = useRef<{x: number, y: number}[][]>([]);
  const multiplierBoxWidth = useRef<number>(0);
  
  // Create the board dimensions and pin locations
  useEffect(() => {
    const initializeBoard = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const width = canvas.clientWidth;
      const height = Math.min(600, width * 1.5);
      
      canvas.width = width;
      canvas.height = height;
      
      boardWidth.current = width;
      boardHeight.current = height;
      
      // Calculate pin positions
      const pinSpacingX = width / (PINS_PER_ROW + 1);
      const pinSpacingY = (height * 0.8) / (ROWS + 1);
      
      const pins: {x: number, y: number}[][] = [];
      
      for (let row = 0; row < ROWS; row++) {
        pins[row] = [];
        const pinsInRow = row % 2 === 0 ? PINS_PER_ROW : PINS_PER_ROW + 1;
        const offsetX = row % 2 === 0 ? pinSpacingX : pinSpacingX / 2;
        
        for (let i = 0; i < pinsInRow; i++) {
          pins[row].push({
            x: offsetX + i * pinSpacingX,
            y: pinSpacingY + row * pinSpacingY
          });
        }
      }
      
      pinLocations.current = pins;
      multiplierBoxWidth.current = width / MULTIPLIERS.length;
      
      drawBoard();
    };
    
    initializeBoard();
    
    window.addEventListener('resize', initializeBoard);
    return () => {
      window.removeEventListener('resize', initializeBoard);
      if (animation !== null) {
        cancelAnimationFrame(animation);
      }
    };
  }, []);
  
  // Draw the board
  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(17, 24, 39, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw pins
    pinLocations.current.forEach(row => {
      row.forEach(pin => {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, PIN_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#9333ea';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#c084fc';
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#c084fc';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });
    
    // Draw multiplier boxes at the bottom
    const boxHeight = height * 0.15;
    const boxWidth = multiplierBoxWidth.current;
    const boxY = height - boxHeight;
    
    MULTIPLIERS.forEach((mult, i) => {
      const x = i * boxWidth;
      
      // Draw box
      ctx.fillStyle = getMultiplierColor(mult);
      ctx.fillRect(x, boxY, boxWidth, boxHeight);
      
      // Draw multiplier text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${mult}x`, x + boxWidth / 2, boxY + boxHeight / 2);
    });
    
    // Draw balls
    balls.forEach(ball => {
      if (!ball.active) return;
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fcd34d';
      ctx.fill();
      
      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f59e0b';
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };
  
  // Get color for multiplier box
  const getMultiplierColor = (mult: number): string => {
    if (mult >= 10) return 'rgba(5, 150, 105, 0.8)';
    if (mult >= 5) return 'rgba(16, 185, 129, 0.8)';
    if (mult >= 2) return 'rgba(245, 158, 11, 0.8)';
    if (mult >= 1) return 'rgba(249, 115, 22, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  };
  
  // Update ball physics
  const updateBalls = () => {
    setBalls(prevBalls => {
      const updatedBalls = prevBalls.map(ball => {
        if (!ball.active) return ball;
        
        let { x, y, vx, vy } = ball;
        
        // Apply gravity
        vy += 0.2;
        
        // Update position
        x += vx;
        y += vy;
        
        // Check collision with pins
        pinLocations.current.forEach(row => {
          row.forEach(pin => {
            const dx = x - pin.x;
            const dy = y - pin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (BALL_SIZE / 2 + PIN_SIZE / 2)) {
              // Bounce off pin
              const angle = Math.atan2(dy, dx);
              const tx = pin.x + Math.cos(angle) * (BALL_SIZE / 2 + PIN_SIZE / 2);
              const ty = pin.y + Math.sin(angle) * (BALL_SIZE / 2 + PIN_SIZE / 2);
              
              // Reflect velocity
              const ax = tx - pin.x;
              const ay = ty - pin.y;
              const factor = 2 * ((vx * ax + vy * ay) / (ax * ax + ay * ay));
              
              vx = vx - factor * ax;
              vy = vy - factor * ay;
              
              // Add some random bounce for more natural behavior
              vx += (Math.random() - 0.5) * 1;
              
              // Position at collision point
              x = tx;
              y = ty;
            }
          });
        });
        
        // Check if ball reached bottom
        if (y > boardHeight.current) {
          // Determine multiplier
          const multiplierIndex = Math.min(
            Math.floor(x / multiplierBoxWidth.current),
            MULTIPLIERS.length - 1
          );
          
          // Calculate winnings and add to balance
          const multiplier = MULTIPLIERS[multiplierIndex];
          const ballWinnings = betAmount * multiplier;
          
          // Add winnings
          if (multiplier > 0) {
            addWinnings(ballWinnings);
            setWinnings(prev => prev + ballWinnings);
          }
          
          return { 
            ...ball, 
            active: false, 
            multiplier 
          };
        }
        
        // Check boundary collision (left/right walls)
        if (x < BALL_SIZE / 2) {
          x = BALL_SIZE / 2;
          vx = -vx * 0.8;
        } else if (x > boardWidth.current - BALL_SIZE / 2) {
          x = boardWidth.current - BALL_SIZE / 2;
          vx = -vx * 0.8;
        }
        
        return { ...ball, x, y, vx, vy };
      });
      
      // Check if all balls are done
      const allDone = updatedBalls.every(ball => !ball.active);
      if (allDone && updatedBalls.length > 0) {
        setGameActive(false);
      }
      
      return updatedBalls;
    });
  };
  
  // Animation loop
  const animate = () => {
    updateBalls();
    drawBoard();
    setAnimation(requestAnimationFrame(animate));
  };
  
  // Dropping a ball
  const dropBall = () => {
    // Add a new ball
    const newBall: Ball = {
      id: Date.now(),
      x: boardWidth.current / 2 + (Math.random() * 30 - 15), // Small random offset
      y: 0,
      vx: 0,
      vy: 2,
      active: true,
      multiplier: null
    };
    
    setBalls(prev => [...prev, newBall]);
  };
  
  // Start game
  const startGame = (amount: number) => {
    if (!placeBet(amount)) return;
    
    setBetAmount(amount);
    setWinnings(0);
    setBalls([]);
    setGameActive(true);
    
    // Start animation
    if (animation !== null) {
      cancelAnimationFrame(animation);
    }
    setAnimation(requestAnimationFrame(animate));
    
    // Drop balls with small delay between each
    const dropInterval = setInterval(() => {
      dropBall();
    }, 500);
    
    // Stop dropping after 5 balls
    setTimeout(() => {
      clearInterval(dropInterval);
    }, 2500);
  };
  
  // Restart game with same bet
  const restartGame = () => {
    startGame(betAmount);
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <CircleDot className="w-6 h-6 text-purple-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Plinko</h1>
          </div>
          <p className="text-gray-400">
            Drop balls and watch them bounce through pins to land on multipliers!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-hidden">
            <canvas 
              ref={canvasRef} 
              className="w-full rounded-lg"
            />
            
            <div className="mt-4 flex justify-between items-center">
              {!gameActive && winnings > 0 && (
                <div className="text-green-400 font-bold text-lg">
                  You won: ${winnings.toFixed(2)}
                </div>
              )}
              
              {!gameActive && (
                <button
                  onClick={restartGame}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-indigo-500 flex items-center"
                  disabled={gameActive || betAmount <= 0}
                >
                  {winnings > 0 ? (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-1" /> Play Again
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" /> Drop Balls
                    </>
                  )}
                </button>
              )}
              
              {gameActive && (
                <div className="text-purple-400 animate-pulse font-medium">
                  Dropping balls...
                </div>
              )}
            </div>
          </div>
          
          <div>
            {!gameActive ? (
              <BetInput onBetPlaced={startGame} />
            ) : (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-gray-400 mb-2">Current Bet</h3>
                <p className="text-xl font-bold text-green-400">${betAmount.toFixed(2)}</p>
              </div>
            )}
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
                <li>Place your bet</li>
                <li>Watch the balls drop through the pins</li>
                <li>Each ball earns its multiplier amount</li>
                <li>5 balls will drop for each game</li>
                <li>Win up to 10x your bet per ball!</li>
              </ol>
            </div>
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">Multipliers</h3>
              <div className="grid grid-cols-5 gap-2 mt-3">
                {[0.2, 0.5, 1, 2, 5, 10].map((mult, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="w-full aspect-square flex items-center justify-center rounded-md mb-1"
                      style={{ backgroundColor: getMultiplierColor(mult) }}
                    >
                      <span className="text-white font-bold text-sm">{mult}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plinko;