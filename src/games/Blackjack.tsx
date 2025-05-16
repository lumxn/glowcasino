import React, { useState, useEffect } from 'react';
import { Diamond, Plus, Ban } from 'lucide-react';
import { useBalance } from '../context/BalanceContext';
import BetInput from '../components/UI/BetInput';

// Card types
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  hidden?: boolean;
}

type GameState = 'betting' | 'playing' | 'dealerTurn' | 'complete';

const Blackjack = () => {
  const { placeBet, addWinnings } = useBalance();
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [dealerScore, setDealerScore] = useState<number>(0);
  
  // Create a deck of cards
  const createDeck = (): Card[] => {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: Card[] = [];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        let value: number;
        if (rank === 'A') {
          value = 11;
        } else if (['J', 'Q', 'K'].includes(rank)) {
          value = 10;
        } else {
          value = parseInt(rank);
        }
        
        newDeck.push({ suit, rank, value });
      }
    }
    
    return shuffleDeck(newDeck);
  };
  
  // Shuffle the deck
  const shuffleDeck = (deckToShuffle: Card[]): Card[] => {
    const shuffled = [...deckToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Deal initial cards
  const dealInitialCards = () => {
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, { ...newDeck.pop()!, hidden: true }];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setPlayerScore(calculateScore(pHand));
    setDealerScore(calculateScore([dHand[0]])); // Only count visible card
  };
  
  // Calculate hand score
  const calculateScore = (hand: Card[]): number => {
    let score = 0;
    let aces = 0;
    
    // Count non-hidden cards
    for (const card of hand) {
      if (!card.hidden) {
        if (card.rank === 'A') {
          aces++;
        }
        score += card.value;
      }
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10; // Change ace from 11 to 1
      aces--;
    }
    
    return score;
  };
  
  // Start a new game
  const startGame = (amount: number) => {
    if (!placeBet(amount)) return;
    
    setBetAmount(amount);
    dealInitialCards();
    setGameState('playing');
    setResult(null);
  };
  
  // Player hits (takes another card)
  const hit = () => {
    if (gameState !== 'playing') return;
    
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    
    setDeck(newDeck);
    setPlayerHand(newHand);
    
    const newScore = calculateScore(newHand);
    setPlayerScore(newScore);
    
    // Check if player busts
    if (newScore > 21) {
      endRound('Player busts!');
    }
  };
  
  // Player stands (ends turn)
  const stand = () => {
    if (gameState !== 'playing') return;
    
    // Reveal dealer's hidden card
    const revealedDealerHand = dealerHand.map(card => ({ ...card, hidden: false }));
    setDealerHand(revealedDealerHand);
    setDealerScore(calculateScore(revealedDealerHand));
    setGameState('dealerTurn');
  };
  
  // Dealer's turn
  useEffect(() => {
    if (gameState !== 'dealerTurn') return;
    
    const dealerPlay = setTimeout(() => {
      const currentScore = calculateScore(dealerHand);
      
      if (currentScore < 17) {
        // Dealer hits if less than 17
        const newDeck = [...deck];
        const newCard = newDeck.pop()!;
        const newHand = [...dealerHand, newCard];
        
        setDeck(newDeck);
        setDealerHand(newHand);
        setDealerScore(calculateScore(newHand));
      } else {
        // Dealer stands, determine winner
        const playerFinalScore = playerScore;
        const dealerFinalScore = currentScore;
        
        if (dealerFinalScore > 21) {
          endRound('Dealer busts! You win!');
        } else if (dealerFinalScore > playerFinalScore) {
          endRound('Dealer wins!');
        } else if (dealerFinalScore < playerFinalScore) {
          endRound('You win!');
        } else {
          endRound('Push! It\'s a tie.');
        }
      }
    }, 800);
    
    return () => clearTimeout(dealerPlay);
  }, [gameState, dealerHand, dealerScore]);
  
  // End the round and determine payout
  const endRound = (resultMessage: string) => {
    setResult(resultMessage);
    setGameState('complete');
    
    if (resultMessage.includes('You win')) {
      // Pay 3:2 for blackjack, otherwise 1:1
      const isBlackjack = playerHand.length === 2 && playerScore === 21;
      const winMultiplier = isBlackjack ? 2.5 : 2;
      addWinnings(betAmount * winMultiplier);
    } else if (resultMessage.includes('Push')) {
      // Return bet on push
      addWinnings(betAmount);
    }
  };
  
  // Reset the game
  const newHand = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setResult(null);
    setPlayerScore(0);
    setDealerScore(0);
  };
  
  // Render a card
  const renderCard = (card: Card) => {
    if (card.hidden) {
      return (
        <div className="w-20 h-28 bg-gray-900 rounded-lg border-2 border-gray-700 flex items-center justify-center text-2xl">
          <div className="w-16 h-24 bg-purple-900 rounded-md flex items-center justify-center">
            ?
          </div>
        </div>
      );
    }
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <div className="w-20 h-28 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-2xl">
        <div className="w-full h-full flex flex-col p-2">
          <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
            {card.rank}
          </div>
          <div className={`text-2xl ${isRed ? 'text-red-600' : 'text-black'} flex-grow flex items-center justify-center`}>
            {card.suit}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-2">
            <Diamond className="w-6 h-6 text-green-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Blackjack</h1>
          </div>
          <p className="text-gray-400">
            Beat the dealer by getting closer to 21 without going over.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-green-900/40 rounded-lg border border-green-800/60 p-6 min-h-[500px] flex flex-col justify-between">
            {/* Dealer's hand */}
            <div>
              <div className="text-gray-300 mb-2">Dealer's Hand {dealerScore > 0 && `(${dealerScore})`}</div>
              <div className="flex flex-wrap gap-2 mb-8">
                {dealerHand.length > 0 ? (
                  dealerHand.map((card, index) => (
                    <div key={index} className="transition-all duration-300" style={{ transform: `translateX(${index * 10}px)` }}>
                      {renderCard(card)}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Waiting for bet...</div>
                )}
              </div>
            </div>
            
            {/* Game result */}
            {result && (
              <div className={`p-4 text-center text-xl font-bold rounded-lg mb-6 ${
                result.includes('You win') 
                  ? 'bg-green-500/30 text-green-300 border border-green-500/30' 
                  : result.includes('Push') 
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/30'
                    : 'bg-red-500/30 text-red-300 border border-red-500/30'
              }`}>
                {result}
              </div>
            )}
            
            {/* Player's hand */}
            <div>
              <div className="text-gray-300 mb-2">Your Hand {playerScore > 0 && `(${playerScore})`}</div>
              <div className="flex flex-wrap gap-2 mb-6">
                {playerHand.length > 0 ? (
                  playerHand.map((card, index) => (
                    <div key={index} className="transition-all duration-300" style={{ transform: `translateX(${index * 10}px)` }}>
                      {renderCard(card)}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Waiting for bet...</div>
                )}
              </div>
              
              {/* Game controls */}
              {gameState === 'playing' && (
                <div className="flex gap-3">
                  <button
                    onClick={hit}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-medium hover:from-blue-500 hover:to-cyan-500 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Hit
                  </button>
                  <button
                    onClick={stand}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-indigo-500 flex items-center"
                  >
                    <Ban className="w-4 h-4 mr-1" /> Stand
                  </button>
                </div>
              )}
              
              {gameState === 'complete' && (
                <button
                  onClick={newHand}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium hover:from-green-500 hover:to-emerald-500"
                >
                  New Hand
                </button>
              )}
            </div>
          </div>
          
          <div>
            {gameState === 'betting' ? (
              <BetInput onBetPlaced={startGame} />
            ) : (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-gray-400 mb-2">Current Bet</h3>
                <p className="text-xl font-bold text-green-400">${betAmount.toFixed(2)}</p>
              </div>
            )}
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-bold mb-2">Blackjack Rules</h3>
              <ul className="text-gray-400 text-sm space-y-2 list-disc pl-4">
                <li>Beat the dealer by getting closer to 21 without going over</li>
                <li>Number cards are worth their face value</li>
                <li>Face cards (J, Q, K) are worth 10</li>
                <li>Aces are worth 11 or 1, whichever is better</li>
                <li>Dealer must hit until 17 or higher</li>
                <li>Blackjack (Ace + 10) pays 3:2</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;