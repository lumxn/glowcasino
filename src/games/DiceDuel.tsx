import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Play, RefreshCcw, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

// Dice faces as components
const DICE_FACES = [
  <Dice1 className="w-full h-full text-white" />,
  <Dice2 className="w-full h-full text-white" />,
  <Dice3 className="w-full h-full text-white" />,
  <Dice4 className="w-full h-full text-white" />,
  <Dice5 className="w-full h-full text-white" />,
  <Dice6 className="w-full h-full text-white" />
];

const DiceDuel = () => {
  const { placeBet, addWinnings } = useBalance();
  const [playerDice, setPlayerDice] = useState<number[]>([1, 1]);
  const [dealerDice, setDealerDice] = useState<number[]>([1, 1]);
  const [rolling, setRolling] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);
  const [playerSum, setPlayerSum] = useState<number>(2);
  const [dealerSum, setDealerSum] = useState<number>(2);
  const [roundsWon, setRoundsWon] = useState<number>(0);
  const [roundsLost, setRoundsLost] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  
  // Calculate dice sums
  useEffect(() => {
    setPlayerSum(playerDice.reduce((a, b) => a + b + 1, 0));
    setDealerSum(dealerDice.reduce((a, b) => a + b + 1, 0));
  }, [playerDice, dealerDice]);
  
  // Calculate streak multiplier
  useEffect(() => {
    if (streak <= 0) {
      setMultiplier(1);
    } else {
      // Increase multiplier for each consecutive win
      setMultiplier(1 + streak * 0.25);
    }
  }, [streak]);
  
  // Roll the dice
  const rollDice = (amount: number) => {
    if (rolling || !placeBet(amount)) return;
    
    setBetAmount(amount);
    setRolling(true);
    setResult(null);
    
    // Create animation effect with multiple rolls
    let rollCount = 0;
    const maxRolls = 10;
    
    const rollInterval = setInterval(() => {
      // Random dice for player and dealer
      const newPlayerDice = [
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6)
      ];
      const newDealerDice = [
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6)
      ];
      
      setPlayerDice(newPlayerDice);
      setDealerDice(newDealerDice);
      
      rollCount++;
      
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        setRolling(false);
        
        // Determine winner
        const playerTotal = newPlayerDice.reduce((a, b) => a + b + 1, 0);
        const dealerTotal = newDealerDice.reduce((a, b) => a + b + 1, 0);
        
        if (playerTotal > dealerTotal) {
          // Player wins
          const winAmount = amount * multiplier;
          addWinnings(winAmount);
          setResult(`You win $${winAmount.toFixed(2)}!`);
          setRoundsWon(prev => prev + 1);
          setStreak(prev => prev + 1);
        } else if (playerTotal < dealerTotal) {
          // Dealer wins
          setResult(`You lose!`);
          setRoundsLost(prev => prev + 1);
          setStreak(0);
        } else {
          // Tie
          addWinnings(amount);
          setResult(`It's a tie! Bet returned.`);
        }
      }
    }, 100);
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <ArrowUpDown className="w-6 h-6 text-purple-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Glow Dice Duel</h1>
          </div>
          <p className="text-gray-400">
            Face off against the house in a dice duel! Win consecutive rounds to increase your multiplier.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg">
                  <div className="text-sm text-gray-300 mb-1">Streak</div>
                  <div className="text-lg font-bold text-white flex items-center">
                    {streak}
                    {streak > 0 && <span className="text-green-400 ml-2">({multiplier.toFixed(2)}x)</span>}
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg">
                  <div className="flex gap-6">
                    <div>
                      <div className="text-sm text-green-400 mb-1">Wins</div>
                      <div className="text-lg font-bold text-white text-center">{roundsWon}</div>
                    </div>
                    <div>
                      <div className="text-sm text-red-400 mb-1">Losses</div>
                      <div className="text-lg font-bold text-white text-center">{roundsLost}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Player */}
                <div className="relative">
                  <div className="text-center mb-3 text-purple-400 font-bold">You</div>
                  <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-6 border border-purple-900/30 flex gap-4 justify-center">
                    {playerDice.map((dice, index) => (
                      <div 
                        key={index}
                        className={`w-20 h-20 bg-purple-600 rounded-lg flex items-center justify-center p-2 ${
                          rolling ? 'animate-bounce' : ''
                        }`}
                      >
                        {DICE_FACES[dice]}
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-2 font-bold text-xl text-white">
                    {playerSum}
                  </div>
                </div>
                
                {/* Dealer */}
                <div className="relative">
                  <div className="text-center mb-3 text-indigo-400 font-bold">House</div>
                  <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-lg p-6 border border-indigo-900/30 flex gap-4 justify-center">
                    {dealerDice.map((dice, index) => (
                      <div 
                        key={index}
                        className={`w-20 h-20 bg-indigo-600 rounded-lg flex items-center justify-center p-2 ${
                          rolling ? 'animate-bounce' : ''
                        }`}
                      >
                        {DICE_FACES[dice]}
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-2 font-bold text-xl text-white">
                    {dealerSum}
                  </div>
                </div>
              </div>
              
              {result && (
                <div className={`p-4 text-center text-xl font-bold rounded-lg mb-6 ${
                  result.includes('win') 
                    ? 'bg-green-500/30 text-green-300 border border-green-500/30' 
                    : result.includes('tie') 
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/30'
                      : 'bg-red-500/30 text-red-300 border border-red-500/30'
                }`}>
                  {result}
                </div>
              )}
              
              <div className="flex justify-center">
                <button
                  onClick={() => rollDice(betAmount)}
                  disabled={rolling || betAmount <= 0}
                  className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center ${
                    rolling || betAmount <= 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                  }`}
                >
                  {rolling ? (
                    <>
                      <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
                      Rolling...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Roll Dice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <BetInput 
              onBetPlaced={rollDice} 
              disabled={rolling}
            />
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">Streak Multipliers</h3>
              <div className="text-sm text-gray-400">
                <p className="mb-2">Win consecutive rounds to increase your payout:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span>Streak 0:</span>
                    <span className="text-purple-400">1.00x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak 1:</span>
                    <span className="text-purple-400">1.25x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak 2:</span>
                    <span className="text-purple-400">1.50x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak 3:</span>
                    <span className="text-purple-400">1.75x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak 4:</span>
                    <span className="text-purple-400">2.00x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>And so on...</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">How to Play</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
                <li>Place your bet</li>
                <li>Roll your dice against the house</li>
                <li>Highest total sum wins</li>
                <li>Build a streak for increasing multipliers</li>
                <li>If you lose, your streak resets to 0</li>
                <li>Ties return your bet</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceDuel;