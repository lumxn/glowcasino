import React, { useState, useEffect, useRef } from 'react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

// Wheel segments with values and colors
const WHEEL_SEGMENTS = [
  { value: 1.5, color: '#ff3366' },
  { value: 5, color: '#33ff99' },
  { value: 0.2, color: '#9933ff' },
  { value: 2, color: '#ffff33' },
  { value: 0.5, color: '#ff9933' },
  { value: 10, color: '#3366ff' },
  { value: 0.1, color: '#ff33ff' },
  { value: 3, color: '#33ffff' },
  { value: 0.3, color: '#ff3366' },
  { value: 20, color: '#33ff99' },
  { value: 0.2, color: '#9933ff' },
  { value: 1, color: '#ffff33' },
];

const NeonWheel = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<null | { segmentIndex: number, multiplier: number, winAmount: number }>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const { balance, updateBalance } = useBalance();
  const animationRef = useRef<number | null>(null);
  const spinTimeRef = useRef<NodeJS.Timeout | null>(null);

  // Draw the wheel when component mounts
  useEffect(() => {
    drawWheel();
    return () => {
      // Clean up any animation frames when component unmounts
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (spinTimeRef.current) {
        clearTimeout(spinTimeRef.current);
      }
    };
  }, []);

  // Redraw wheel when wheelRotation changes
  useEffect(() => {
    drawRotatedWheel(wheelRotation);
  }, [wheelRotation]);

  const drawWheel = () => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const center = canvas.width / 2;
    const radius = center - 10;
    const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wheel segments
    WHEEL_SEGMENTS.forEach((segment, i) => {
      const startAngle = i * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw segment value
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(segment.value + 'x', radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawRotatedWheel = (rotationDegrees: number) => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const center = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Translate to center of wheel before rotation
    ctx.translate(center, center);
    ctx.rotate((rotationDegrees * Math.PI) / 180);
    ctx.translate(-center, -center);

    // Draw the wheel
    drawWheel();

    ctx.restore();
  };

  const spinWheel = () => {
    if (isSpinning) return;

    if (balance < betAmount) {
      alert('Not enough balance!');
      return;
    }

    updateBalance(-betAmount);
    setResult(null);
    setIsSpinning(true);

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    // Randomly select target segment index
    const targetSegmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);

    // Calculate final rotation degrees so that pointer lands on target segment
    // The pointer is at the top (0 degrees), so we need to rotate wheel so that target segment aligns with that
    // We subtract target angle plus half segment to center pointer at segment middle
    // Plus multiple rotations for spin effect
    const fullRotations = 5 + Math.floor(Math.random() * 5);
    const targetRotation = fullRotations * 360 + (360 - (targetSegmentIndex * segmentAngle + segmentAngle / 2));

    const animationDuration = 4000; // 4 seconds
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;

      const progress = Math.min(elapsed / animationDuration, 1);

      // Ease out cubic timing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentRotation = wheelRotation + (targetRotation - wheelRotation) * easedProgress;
      setWheelRotation(currentRotation % 360);

      // Continue animation or finish
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        finishSpin(targetSegmentIndex);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const finishSpin = (segmentIndex: number) => {
    const winningSegment = WHEEL_SEGMENTS[segmentIndex];
    const multiplier = winningSegment.value;

    // Fix: ensure betAmount is a number and winnings calculation is correct
    const winAmount = betAmount * multiplier;

    // Debug logs:
    console.log('BET AMOUNT:', betAmount);
    console.log('MULTIPLIER:', multiplier);
    console.log('WIN AMOUNT:', winAmount);

    setResult({
      segmentIndex,
      multiplier,
      winAmount,
    });

    if (soundEnabled) {
      if (winAmount > betAmount) {
        playSound('win');
      } else {
        playSound('lose');
      }
    }

    updateBalance(winAmount);

    spinTimeRef.current = setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
  };

  const playSound = (soundType: string) => {
    // Placeholder for sound effects integration
    console.log(`Playing ${soundType} sound`);
  };

  const handleBetChange = (newBet: number) => {
    setBetAmount(newBet);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Neon Wheel</h2>
      
      {/* Wheel container */}
      <div className="relative mb-4">
        <canvas 
          ref={wheelRef} 
          width={300} 
          height={300} 
          className="rounded-full shadow-lg border-4 border-indigo-600"
        />
        
        {/* Wheel pointer */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-white"
        />

        {/* Result overlay */}
        {result && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full">
            <div className="bg-indigo-800 p-4 rounded-lg text-center animate-pulse shadow-lg border-2 border-indigo-400">
              <div className="text-2xl font-bold text-white">
                {result.multiplier}x
              </div>
              <div className="text-xl text-green-400">
                +${result.winAmount.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Betting controls */}
      <div className="w-full max-w-md">
        <BetInput 
          value={betAmount}
          onChange={handleBetChange}
          min={1}
          max={1000}
        />
        
        <button
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-md font-bold text-lg mt-2 hover:from-indigo-700 hover:to-blue-700 transition-colors duration-200"
          onClick={spinWheel}
          disabled={isSpinning || balance < betAmount}
        >
          {isSpinning ? 'Spinning...' : 'Spin'}
        </button>
      </div>
    </div>
  );
};

export default NeonWheel;

