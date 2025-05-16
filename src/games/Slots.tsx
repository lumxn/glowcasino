import React, { useState, useEffect, useRef } from 'react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

// Slot symbols with their respective payouts
const SYMBOLS = [
  { id: 'cherry', value: 2, icon: '🍒', color: 'text-red-500' },
  { id: 'lemon', value: 3, icon: '🍋', color: 'text-yellow-400' },
  { id: 'orange', value: 4, icon: '🍊', color: 'text-orange-500' },
  { id: 'grape', value: 5, icon: '🍇', color: 'text-purple-500' },
  { id: 'watermelon', value: 8, icon: '🍉', color: 'text-green-500' },
  { id: 'seven', value: 10, icon: '7️⃣', color: 'text-white' },
  { id: 'diamond', value: 15, icon: '💎', color: 'text-blue-400' },
  { id: 'star', value: 20, icon: '⭐', color: 'text-yellow-300' },
];

// Number of reels
const REEL_COUNT = 3;
// Number of visible symbols per reel
const VISIBLE_SYMBOLS = 3;
// Total number of symbols per reel (including those off-screen)
const SYMBOLS_PER_REEL = 20;
// Spinning time
const SPIN_DURATION = 2000;
// Delay between reels stopping
const REEL_STOP_DELAY = 300;

const Slots = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([]);
  const [visibleSymbols, setVisibleSymbols] = useState([]);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const reelRefs = useRef([]);
  const { balance, updateBalance } = useBalance();

  // Initialize reels
  useEffect(() => {
    initializeReels();
  }, []);

  const initializeReels = () => {
    // Create reels with random symbols
    const initialReels = Array(REEL_COUNT).fill(0).map(() => {
      // Generate a random array of symbols for each reel
      return Array(SYMBOLS_PER_REEL).fill(0).map(() => 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      );
    });

    setReels(initialReels);
    
    // Set initial visible symbols
    const initialVisible = initialReels.map(reel => 
      reel.slice(0, VISIBLE_SYMBOLS)
    );
    
    setVisibleSymbols(initialVisible);
  };

  const handleSpin = () => {
    // Check if already spinning
    if (spinning) return;
    
    // Check if enough balance
    if (balance < betAmount) {
      alert('Not enough balance!');
      return;
    }
    
    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Play spin sound
    if (soundEnabled) {
      playSound('spin');
    }
    
    // Start spinning animation
    setSpinning(true);
    setResult(null);
    
    // Generate new random reels
    const newReels = reels.map(reel => {
      // Shuffle symbols
      return [...reel].sort(() => Math.random() - 0.5);
    });
    
    setReels(newReels);
    
    // Start spinning animation for each reel
    reelRefs.current.forEach((reel, index) => {
      if (reel) {
        // Add spinning class with delay for each reel
        setTimeout(() => {
          reel.classList.add('spinning');
        }, index * 100);
        
        // Stop spinning after a delay
        setTimeout(() => {
          if (reel) {
            reel.classList.remove('spinning');
            
            // Play reel stop sound
            if (soundEnabled) {
              playSound('reelStop');
            }
            
            // If this is the last reel, check results
            if (index === REEL_COUNT - 1) {
              checkResults(newReels);
            }
          }
        }, SPIN_DURATION + (index * REEL_STOP_DELAY));
      }
    });
    
    // Update visible symbols with animation
    animateReels(newReels);
  };

  const animateReels = (newReels) => {
    let currentReels = [...newReels];
    let frame = 0;
    const totalFrames = 30; // Number of animation frames
    
    // Start animation loop
    const animationInterval = setInterval(() => {
      frame++;
      
      // Calculate new visible symbols for each frame
      const newVisible = currentReels.map((reel, reelIndex) => {
        // Calculate offset that increases over time and then stops
        const offset = Math.min(frame * 2, totalFrames);
        
        // Get visible slice with the current offset
        const startIdx = (offset + reelIndex * 5) % (SYMBOLS_PER_REEL - VISIBLE_SYMBOLS);
        return reel.slice(startIdx, startIdx + VISIBLE_SYMBOLS);
      });
      
      setVisibleSymbols(newVisible);
      
      // End animation after all frames
      if (frame >= totalFrames) {
        clearInterval(animationInterval);
      }
    }, 50);
    
    // Ensure we clear the interval if component unmounts
    return () => clearInterval(animationInterval);
  };

  const checkResults = (newReels) => {
    // Get the middle row (index 1 if we have 3 visible symbols)
    const middleRow = newReels.map(reel => reel[1]);
    
    // Check for winning combinations
    let winAmount = 0;
    let multiplier = 0;
    
    // Check if all symbols in the middle row are the same
    const allSame = middleRow.every(symbol => symbol.id === middleRow[0].id);
    
    if (allSame) {
      // Jackpot - all symbols match
      multiplier = middleRow[0].value;
      winAmount = betAmount * multiplier;
      
      // Play win sound
      if (soundEnabled) {
        playSound('bigWin');
      }
    } else {
      // Check for partial matches (2 of a kind)
      const symbolCounts = {};
      middleRow.forEach(symbol => {
        symbolCounts[symbol.id] = (symbolCounts[symbol.id] || 0) + 1;
      });
      
      // Check if any symbol appears at least twice
      let maxCount = 0;
      let maxSymbol = null;
      
      Object.keys(symbolCounts).forEach(symbolId => {
        if (symbolCounts[symbolId] > maxCount) {
          maxCount = symbolCounts[symbolId];
          maxSymbol = SYMBOLS.find(s => s.id === symbolId);
        }
      });
      
      if (maxCount >= 2) {
        // Small win - 2 of a kind
        multiplier = maxSymbol.value / 2;
        winAmount = betAmount * multiplier;
        
        // Play small win sound
        if (soundEnabled) {
          playSound('smallWin');
        }
      } else {
        // No win
        if (soundEnabled) {
          playSound('lose');
        }
      }
    }
    
    // Update game state
    setSpinning(false);
    setResult({
      win: winAmount > 0,
      winAmount,
      multiplier
    });
    
    // Update balance if there's a win
    if (winAmount > 0) {
      updateBalance(winAmount);
    }
  };

  const playSound = (soundType) => {
    // This would connect to the global sound system
    console.log(`Playing ${soundType} sound`);
  };

  const handleBetChange = (newBet) => {
    setBetAmount(newBet);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Slot Machine</h2>
      
      {/* Slot machine display */}
      <div className="relative border-2 border-purple-500 rounded-lg overflow-hidden shadow-lg mb-4 bg-gray-800" 
           style={{ width: '300px', height: '240px' }}>
        {/* Slot window with reels */}
        <div className="absolute inset-0 flex">
          {visibleSymbols.map((reelSymbols, reelIndex) => (
            <div 
              key={reelIndex}
              ref={el => reelRefs.current[reelIndex] = el}
              className="reel flex-1 flex flex-col items-center transition-transform"
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
              {reelSymbols.map((symbol, symbolIndex) => (
                <div 
                  key={`${reelIndex}-${symbolIndex}`}
                  className={`symbol flex items-center justify-center h-20 w-full ${symbol.color} text-4xl`}
                >
                  {symbol.icon}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Payline indicator */}
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 border-2 border-yellow-400 z-10 opacity-50"></div>
        
        {/* Win overlay */}
        {result && result.win && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-center animate-pulse">
              <div className="text-2xl font-bold text-white">
                WIN!
              </div>
              <div className="text-xl text-white">
                ${result.winAmount.toFixed(2)}
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
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md font-bold text-lg mt-2 hover:from-purple-700 hover:to-pink-700 transition-colors duration-200"
          onClick={handleSpin}
          disabled={spinning || balance < betAmount}
        >
          {spinning ? 'Spinning...' : 'Spin'}
        </button>
      </div>
      
      {/* Symbol values */}
      <div className="grid grid-cols-4 gap-2 mt-4 text-sm text-white">
        {SYMBOLS.map(symbol => (
          <div key={symbol.id} className="flex items-center">
            <span className={`text-xl ${symbol.color} mr-2`}>{symbol.icon}</span>
            <span>x{symbol.value}</span>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .spinning {
          animation: spin 0.5s linear infinite;
        }
        
        @keyframes spin {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-80px);
          }
        }
      `}</style>
    </div>
  );
};

export default Slots;