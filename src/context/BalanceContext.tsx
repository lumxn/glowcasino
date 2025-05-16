import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the context type
interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number) => void;
  placeBet: (amount: number) => boolean;
  addWinnings: (amount: number) => void;
}

// Create the context with a default value
const BalanceContext = createContext<BalanceContextType>({
  balance: 1000,
  updateBalance: () => {},
  placeBet: () => false,
  addWinnings: () => {},
});

// Hook to use the balance context
export const useBalance = () => useContext(BalanceContext);

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
  // Initialize balance from localStorage or default to 1000
  const [balance, setBalance] = useState<number>(() => {
    const savedBalance = localStorage.getItem('casinoBalance');
    return savedBalance ? parseFloat(savedBalance) : 1000;
  });

  // Save balance to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('casinoBalance', balance.toString());
  }, [balance]);

  // Update balance by adding or subtracting amount
  const updateBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance + amount);
  };

  // Place a bet - returns true if successful, false if insufficient funds
  const placeBet = (amount: number): boolean => {
    if (amount <= 0) return false;
    if (amount > balance) return false;
    
    setBalance((prevBalance) => prevBalance - amount);
    return true;
  };

  // Add winnings to balance
  const addWinnings = (amount: number) => {
    if (amount <= 0) return;
    setBalance((prevBalance) => prevBalance + amount);
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, placeBet, addWinnings }}>
      {children}
    </BalanceContext.Provider>
  );
};

export default BalanceContext;