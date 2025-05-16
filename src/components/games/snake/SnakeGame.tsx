import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../../context/GameContext';
import { RefreshCw, Pause, Play } from 'lucide-react';

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 10;
const MAX_SPEED = 70;

// Direction types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Food and snake segment types
interface Position {
  x: number;
  y: number;
}

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const { addScore, soundEnabled } = useGameContext();
  
  // Game loop ref
  const gameLoopRef = useRef<number | null>(null);
  
  // Generate a new food position
  const generateFood = (): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    // Check if the food would spawn on the snake
    const isOnSnake = snake.some(segment => segment.x === x && segment.y === y);
    
    if (isOnSnake) {
      return generateFood();
    }
    
    return { x, y };
  };
  
  // Initialize the game
  const initGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setSpeed(INITIAL_SPEED);
  };
  
  // Update the game state
  const updateGame = () => {
    if (paused || gameOver) return;
    
    // Update direction
    const currentDirection = direction;
    setDirection(nextDirection);
    
    // Move the snake
    const head = { ...snake[0] };
    
    switch (nextDirection) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collisions
    if (
      head.x < 0 || 
      head.x >= GRID_SIZE || 
      head.y < 0 || 
      head.y >= GRID_SIZE ||
      snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      setGameOver(true);
      addScore('snake', score);
      return;
    }
    
    // Create new snake
    const newSnake = [head, ...snake];
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
      // Snake grows, don't remove tail
      setFood(generateFood());
      setScore(prevScore => {
        const newScore = prevScore + 10;
        
        // Increase speed every 50 points
        if (newScore % 50 === 0 && speed > MAX_SPEED) {
          setSpeed(prevSpeed => prevSpeed - SPEED_INCREMENT);
        }
        
        return newScore;
      });
      
      // Play sound effect if enabled
      if (soundEnabled) {
        playEatSound();
      }
    } else {
      // Remove tail
      newSnake.pop();
    }
    
    setSnake(newSnake);
  };
  
  // Draw the game
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, i) => {
      const isHead = i === 0;
      
      if (isHead) {
        // Draw head with glow effect
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#8b5cf6';
      } else {
        // Draw body segments
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(139, 92, 246, ${1 - i * (0.6 / snake.length)})`; // Gradient effect
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE, 
        CELL_SIZE
      );
      
      // Reset shadow settings
      ctx.shadowBlur = 0;
    });
    
    // Draw food with pulse animation
    const pulseAmount = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10 * pulseAmount;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 * pulseAmount,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw a grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Display game over message
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
      
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // Display pause message
    if (paused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
      ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 30);
    }
  };
  
  // Sound effects
  const playEatSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };
  
  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') {
            setNextDirection('UP');
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') {
            setNextDirection('DOWN');
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') {
            setNextDirection('LEFT');
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') {
            setNextDirection('RIGHT');
          }
          break;
        case 'p':
        case 'P':
          if (!gameOver) {
            setPaused(prev => !prev);
          }
          break;
        case 'r':
        case 'R':
          initGame();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver]);
  
  // Initialize the game when component mounts
  useEffect(() => {
    initGame();
  }, []);
  
  // Game loop
  useEffect(() => {
    if (gameOver || paused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }
    
    let lastTime = 0;
    let deltaTime = 0;
    
    const gameLoop = (timestamp: number) => {
      if (lastTime === 0) {
        lastTime = timestamp;
      }
      
      deltaTime += timestamp - lastTime;
      lastTime = timestamp;
      
      if (deltaTime >= speed) {
        updateGame();
        deltaTime = 0;
      }
      
      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [snake, food, direction, nextDirection, gameOver, paused, speed]);
  
  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameOver) return;
    
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    
    // Determine direction based on which delta is larger
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0 && direction !== 'LEFT') {
        setNextDirection('RIGHT');
      } else if (deltaX < 0 && direction !== 'RIGHT') {
        setNextDirection('LEFT');
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && direction !== 'UP') {
        setNextDirection('DOWN');
      } else if (deltaY < 0 && direction !== 'DOWN') {
        setNextDirection('UP');
      }
    }
  };
  
  return (
    <div className="game-container">
      <div className="game-controls">
        <div>
          <h2 className="text-xl font-bold mb-1">Snake Game</h2>
          <p className="text-gray-400 text-sm">Score: {score}</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setPaused(prev => !prev)} 
            className="btn btn-secondary"
            disabled={gameOver}
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button 
            onClick={initGame} 
            className="btn btn-primary"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border neon-border rounded-lg shadow-lg"
          onTouchStart={handleTouchStart}
        ></canvas>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Use arrow keys or WASD to move the snake.</p>
        <p>Press P to pause/resume and R to restart.</p>
      </div>
    </div>
  );
};

export default SnakeGame;