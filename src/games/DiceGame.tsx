import React, { useState } from 'react';
import { Dice5 } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

const DiceGame = () => {
  const { placeBet, addWinnings } = useBalance();
  const [targetNumber, setTargetNumber] = useState<number>(50);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{
    type: 'win' | 'lose' | null;
    amount: number;
  }>({ type: null, amount: 0 });
  
  // Calculate win multiplier based on probability
  const calculateMultiplier = (target: number): number => {
    // House edge of 2%
    return 0.98 * (100 / target);
  };
  
  // Calculate win chance
  const calculateWinChance = (target: number): number => {
    return target;
  };
  
  const handlePlay = (betAmount: number) => {
    if (!placeBet(betAmount)) return;
    
    setRolling(true);
    setGameResult({ type: null, amount: 0 });
    
    // Simulate dice roll with animation
    let counter = 0;
    const animationInterval = setInterval(() => {
      setRollResult(Math.floor(Math.random() * 100) + 1);
      counter++;
      
      if (counter >= 10) {
        clearInterval(animationInterval);
        
        // Final result
        const finalResult = Math.floor(Math.random() * 100) + 1;
        setRollResult(finalResult);
        
        // Determine win or loss
        const isWin = targetNumber >= finalResult;
        
        setTimeout(() => {
          if (isWin) {
            const multiplier = calculateMultiplier(targetNumber);
            const winAmount = betAmount * multiplier;
            addWinnings(winAmount);
            setGameResult({ type: 'win', amount: winAmount });
          } else {
            setGameResult({ type: 'lose', amount: betAmount });
          }
          setRolling(false);
        }, 500);
      }
    }, 100);
  };
  
  const multiplier = calculateMultiplier(targetNumber);
  const winChance = calculateWinChance(targetNumber);
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <Dice5 className="w-6 h-6 text-blue-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Dice Game</h1>
          </div>
          <p className="text-gray-400">
            Choose a target number, place your bet, and roll. Win if the dice rolls below your target number!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="mb-8">
              <label className="block text-gray-400 mb-2">Target Number: {targetNumber}</label>
              <input
                type="range"
                min="1"
                max="95"
                value={targetNumber}
                onChange={(e) => setTargetNumber(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
                disabled={rolling}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Lower risk</span>
                <span>Higher risk</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Win Chance</div>
                <div className="text-xl font-bold text-blue-400">{winChance.toFixed(2)}%</div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Multiplier</div>
                <div className="text-xl font-bold text-pink-400">{multiplier.toFixed(2)}x</div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Roll Result</div>
                <div className="text-xl font-bold text-purple-400">{rollResult ?? '-'}</div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
              {rolling ? (
                <div className="text-5xl font-bold text-white animate-pulse">
                  {rollResult}
                </div>
              ) : rollResult === null ? (
                <div className="text-2xl text-gray-500">Roll the dice to play!</div>
              ) : (
                <div className={`text-5xl font-bold ${
                  gameResult.type === 'win' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {rollResult}
                </div>
              )}
              
              {gameResult.type && (
                <div className={`absolute bottom-0 left-0 w-full py-2 text-center text-white ${
                  gameResult.type === 'win' 
                    ? 'bg-green-500/70' 
                    : 'bg-red-500/70'
                }`}>
                  {gameResult.type === 'win' 
                    ? `You won $${gameResult.amount.toFixed(2)}!` 
                    : `You lost $${gameResult.amount.toFixed(2)}`}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <BetInput onBetPlaced={handlePlay} disabled={rolling} />
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
                <li>Adjust the slider to set your target number</li>
                <li>Higher targets = higher chance to win but lower payout</li>
                <li>Lower targets = lower chance to win but higher payout</li>
                <li>Enter your bet amount and click "Place Bet"</li>
                <li>Win if the roll is below your target number!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;