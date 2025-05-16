import React, { useState } from 'react';
import { useBalance } from '../../context/BalanceContext';

interface BetInputProps {
  onBetPlaced: (amount: number) => void;
  disabled?: boolean;
  minBet?: number;
  maxBet?: number;
}

const BetInput: React.FC<BetInputProps> = ({ 
  onBetPlaced, 
  disabled = false,
  minBet = 1,
  maxBet
}) => {
  const { balance } = useBalance();
  const [betAmount, setBetAmount] = useState<string>(minBet.toString());
  const maxPossibleBet = maxBet ? Math.min(maxBet, balance) : balance;

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setBetAmount('');
      return;
    }
    
    // Only allow numeric input
    if (!/^\d*\.?\d*$/.test(value)) return;
    
    setBetAmount(value);
  };

  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;
    
    if (amount < minBet) {
      alert(`Minimum bet is $${minBet}`);
      return;
    }
    
    if (maxBet && amount > maxBet) {
      alert(`Maximum bet is $${maxBet}`);
      return;
    }
    
    onBetPlaced(amount);
  };

  const quickAmounts = [
    { label: '50%', value: maxPossibleBet * 0.5 },
    { label: 'Max', value: maxPossibleBet }
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex flex-col mb-3">
        <label className="text-gray-400 text-sm mb-1">Your Bet</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="text"
            value={betAmount}
            onChange={handleBetChange}
            className="w-full bg-gray-900 text-white py-2 pl-8 pr-3 rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            placeholder="Enter bet amount"
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        {quickAmounts.map((amount, index) => (
          <button
            key={index}
            onClick={() => setBetAmount(amount.value.toFixed(2))}
            className="flex-1 text-sm py-1 px-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
            disabled={disabled || balance <= 0}
          >
            {amount.label}
          </button>
        ))}
      </div>
      
      <button
        onClick={handlePlaceBet}
        disabled={disabled || balance <= 0 || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
        className={`w-full py-2 rounded-md font-medium transition-all duration-300 ${
          disabled || balance <= 0 || parseFloat(betAmount || '0') <= 0 || parseFloat(betAmount || '0') > balance
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-[0_0_10px_rgba(219,39,119,0.5)]'
        }`}
      >
        Place Bet
      </button>
      
      {balance <= 0 && (
        <p className="mt-2 text-sm text-red-400 text-center">
          You're out of cash! Reset your balance to continue.
        </p>
      )}
    </div>
  );
};

export default BetInput;