import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Play, RefreshCcw } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

interface LightOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  value: number;
  color: string;
  direction: { x: number; y: number };
  active: boolean;
}

const GAME_DURATION = 30; // seconds
const ORB_COLORS = [
  { color: '#3b82f6', value: 1 },   // Blue
  { color: '#8b5cf6', value: 2 },   // Purple
  { color: '#ef4444', value: 3 },   // Red
  { color: '#10b981', value: 4 },   // Green
  { color: '#f59e0b', value: 5 },   // Amber
];

const LightCatch = () => {
  const { placeBet, addWinnings } = useBalance();
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [orbs, setOrbs] = useState<LightOrb[]>([]);
  const [catchedOrbs, setCatchedOrbs] = useState<number>(0);
  const [missedOrbs, setMissedOrbs] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameTime = useRef<number>(0);
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize canvas and handle resize
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas size
      const container = canvas.parentElement;
      if (!container) return;
      
      const width = container.clientWidth;
      const height = Math.min(600, window.innerHeight * 0.6);
      
      canvas.width = width;
      canvas.height = height;
      
      // Redraw if game is active
      if (gameActive) {
        drawGame();
      } else {
        drawIdleScreen();
      }
    };
    
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, []);
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas || !e.touches[0]) return;
      
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  // Handle game timer
  useEffect(() => {
    if (gameActive && !gameOver) {
      timerInterval.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval.current!);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [gameActive, gameOver]);
  
  // Generate a new orb
  const generateOrb = (): LightOrb => {
    const canvas = canvasRef.current;
    if (!canvas) {
      // Default values if canvas isn't ready
      return {
        id: Date.now(),
        x: 100,
        y: 100,
        size: 30,
        speed: 3,
        value: 1,
        color: '#3b82f6',
        direction: { x: 1, y: 1 },
        active: true
      };
    }
    
    // Random orb properties
    const size = Math.random() * 15 + 20; // 20-35px
    
    // Random starting position (near edges)
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    switch (edge) {
      case 0: // top
        x = Math.random() * canvas.width;
        y = -size;
        break;
      case 1: // right
        x = canvas.width + size;
        y = Math.random() * canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + size;
        break;
      case 3: // left
        x = -size;
        y = Math.random() * canvas.height;
        break;
      default:
        x = 0;
        y = 0;
    }
    
    // Random direction (toward center)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    let dirX = centerX - x;
    let dirY = centerY - y;
    
    // Add some randomness to direction
    dirX += (Math.random() - 0.5) * 100;
    dirY += (Math.random() - 0.5) * 100;
    
    // Normalize direction vector
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= length;
    dirY /= length;
    
    // Pick random orb type
    const orbType = Math.floor(Math.random() * ORB_COLORS.length);
    const { color, value } = ORB_COLORS[orbType];
    
    // Speed based on size (smaller = faster)
    const speed = Math.max(2, 5 - size / 10);
    
    return {
      id: Date.now() + Math.random(),
      x,
      y,
      size,
      speed,
      value,
      color,
      direction: { x: dirX, y: dirY },
      active: true
    };
  };
  
  // Start game
  const startGame = (amount: number) => {
    if (!placeBet(amount)) return;
    
    setBetAmount(amount);
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setOrbs([]);
    setCatchedOrbs(0);
    setMissedOrbs(0);
    setMultiplier(1);
    setCombo(0);
    
    // Start game loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    lastFrameTime.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);
  };
  
  // End game
  const endGame = () => {
    setGameOver(true);
    setGameActive(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Calculate winnings
    const winnings = betAmount * score / 100;
    addWinnings(winnings);
    
    // Draw final screen
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawGame();
  };
  
  // Game loop
  const gameLoop = (timestamp: number) => {
    // Calculate delta time
    const deltaTime = timestamp - lastFrameTime.current;
    lastFrameTime.current = timestamp;
    
    // Update game state
    updateGame(deltaTime / 16); // normalize to ~60fps
    
    // Draw game
    drawGame();
    
    // Continue loop if game is active
    if (gameActive && !gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // Update game state
  const updateGame = (deltaTime: number) => {
    // Maybe spawn new orbs (random chance based on time)
    if (Math.random() < 0.05 * deltaTime) {
      setOrbs(prev => [...prev, generateOrb()]);
    }
    
    // Update orb positions
    setOrbs(prev => {
      const canvas = canvasRef.current;
      if (!canvas) return prev;
      
      return prev.map(orb => {
        if (!orb.active) return orb;
        
        // Move orb
        const newX = orb.x + orb.direction.x * orb.speed * deltaTime;
        const newY = orb.y + orb.direction.y * orb.speed * deltaTime;
        
        // Check if orb has left the screen
        const buffer = orb.size * 2;
        if (
          newX < -buffer ||
          newX > canvas.width + buffer ||
          newY < -buffer ||
          newY > canvas.height + buffer
        ) {
          // Orb left the screen
          setMissedOrbs(prev => prev + 1);
          setCombo(0); // Reset combo
          
          return { ...orb, active: false };
        }
        
        // Check for collision with mouse/touch
        const dx = newX - mousePos.current.x;
        const dy = newY - mousePos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < orb.size) {
          // Caught orb!
          setScore(prev => prev + orb.value * multiplier);
          setCatchedOrbs(prev => prev + 1);
          setCombo(prev => prev + 1);
          
          // Update multiplier based on combo
          if (combo >= 5) {
            setMultiplier(2);
          } else if (combo >= 10) {
            setMultiplier(3);
          } else if (combo >= 15) {
            setMultiplier(4);
          } else if (combo >= 20) {
            setMultiplier(5);
          }
          
          return { ...orb, active: false };
        }
        
        return { ...orb, x: newX, y: newY };
      }).filter(orb => orb.active); // Remove inactive orbs
    });
  };
  
  // Draw game state
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background - dark gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw cursor/player
    ctx.beginPath();
    ctx.arc(mousePos.current.x, mousePos.current.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(mousePos.current.x, mousePos.current.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    
    // Draw cursor trail
    ctx.beginPath();
    ctx.arc(mousePos.current.x, mousePos.current.y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw orbs
    orbs.forEach(orb => {
      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = orb.color;
      
      // Draw orb
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
      ctx.fillStyle = orb.color;
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Draw orb inner detail
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      
      // Draw value text
      ctx.fillStyle = 'white';
      ctx.font = `${Math.max(12, orb.size * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(orb.value.toString(), orb.x, orb.y);
    });
    
    // Draw HUD
    const hudHeight = 40;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, hudHeight);
    
    // Draw time left
    ctx.fillStyle = 'white';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Time: ${timeLeft}s`, 15, hudHeight / 2);
    
    // Draw score
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, hudHeight / 2);
    
    // Draw multiplier
    ctx.textAlign = 'right';
    ctx.fillStyle = combo >= 5 ? '#10b981' : 'white';
    ctx.fillText(`x${multiplier} (${combo} combo)`, canvas.width - 15, hudHeight / 2);
    
    // If game over, draw overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
      
      ctx.font = '18px sans-serif';
      ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
      
      ctx.fillStyle = '#10b981';
      ctx.font = '20px sans-serif';
      ctx.fillText(`You won: $${(betAmount * score / 100).toFixed(2)}!`, canvas.width / 2, canvas.height / 2 + 50);
    }
  };
  
  // Draw idle screen (before game starts)
  const drawIdleScreen = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw some sample orbs
    const orbPositions = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3, color: '#3b82f6', size: 25 },
      { x: canvas.width * 0.7, y: canvas.height * 0.6, color: '#8b5cf6', size: 30 },
      { x: canvas.width * 0.5, y: canvas.height * 0.4, color: '#ef4444', size: 20 },
      { x: canvas.width * 0.3, y: canvas.height * 0.7, color: '#10b981', size: 35 },
      { x: canvas.width * 0.8, y: canvas.height * 0.2, color: '#f59e0b', size: 28 }
    ];
    
    orbPositions.forEach(orb => {
      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = orb.color;
      
      // Draw orb
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
      ctx.fillStyle = orb.color;
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Draw orb inner detail
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    });
    
    // Draw title text
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Light Catch', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '18px sans-serif';
    ctx.fillText('Catch the glowing orbs with your cursor!', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Place your bet and hit Play to start', canvas.width / 2, canvas.height / 2 + 40);
  };
  
  // Handle canvas click for mobile
  const handleCanvasClick = () => {
    // Mobile users may need to tap to register touch position
    // This is a no-op function, just to make the canvas clickable
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <Lightbulb className="w-6 h-6 text-amber-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Light Catch</h1>
          </div>
          <p className="text-gray-400">
            Catch the fast-moving glowing orbs for points and big multipliers!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 rounded-lg p-4 border border-amber-900/30">
                  <div className="text-sm text-gray-300 mb-1">Score</div>
                  <div className="text-xl font-bold text-white">{score}</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg p-4 border border-purple-900/30">
                  <div className="text-sm text-gray-300 mb-1">Combo</div>
                  <div className="text-xl font-bold text-green-400">
                    {combo} 
                    <span className="ml-1 text-sm">({multiplier}x)</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg p-4 border border-blue-900/30">
                  <div className="text-sm text-gray-300 mb-1">Time Left</div>
                  <div className="text-xl font-bold text-yellow-400">{timeLeft}s</div>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="relative w-full" style={{ maxHeight: '600px' }}>
                  <canvas 
                    ref={canvasRef}
                    className="bg-gray-900 rounded-lg shadow-lg cursor-none w-full"
                    onClick={handleCanvasClick}
                    onTouchStart={handleCanvasClick}
                  />
                  
                  {!gameActive && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => startGame(betAmount)}
                        disabled={betAmount <= 0}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center ${
                          betAmount <= 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                        }`}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </button>
                    </div>
                  )}
                  
                  {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => startGame(betAmount)}
                        className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg text-white font-medium hover:from-amber-500 hover:to-yellow-500 flex items-center"
                      >
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        Play Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {gameActive && (
                <div className="text-center text-gray-300">
                  Move your cursor to catch the orbs!
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
                  <p>Potential payout: ${(betAmount * score / 100).toFixed(2)}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">Orb Values</h3>
              <div className="grid grid-cols-3 gap-4">
                {ORB_COLORS.map((orb, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-10 h-10 rounded-full mb-1"
                      style={{ 
                        backgroundColor: orb.color,
                        boxShadow: `0 0 10px ${orb.color}`
                      }}
                    ></div>
                    <span className="text-gray-300 text-sm">{orb.value} pts</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
                <li>Move your cursor to catch glowing orbs</li>
                <li>Each orb is worth different points based on its color</li>
                <li>Build a combo by catching orbs in succession</li>
                <li>Combos increase your multiplier:
                  <ul className="list-disc pl-4 mt-1">
                    <li>5+ combo: 2x multiplier</li>
                    <li>10+ combo: 3x multiplier</li>
                    <li>15+ combo: 4x multiplier</li>
                    <li>20+ combo: 5x multiplier</li>
                  </ul>
                </li>
                <li>Missing an orb resets your combo</li>
                <li>You have 30 seconds to earn as many points as possible</li>
                <li>Final payout = (Bet × Score) ÷ 100</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightCatch;