import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../../context/GameContext';
import { RefreshCw } from 'lucide-react';

// Card symbols (using emoji for simplicity)
const CARD_SYMBOLS = [
  '🎮', '🎲', '🎯', '🎪', '🎭', '🎨', 
  '🎬', '🎤', '🎧', '🎸', '🎻', '🎺'
];

interface Card {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const { addScore, soundEnabled } = useGameContext();
  
  // Initialize the game
  const initGame = () => {
    // Create and shuffle the cards
    let cardDeck: Card[] = [];
    
    // Create pairs from the symbols
    CARD_SYMBOLS.forEach((symbol, index) => {
      // Create two cards with the same symbol
      const card1: Card = {
        id: index * 2,
        symbol,
        flipped: false,
        matched: false
      };
      
      const card2: Card = {
        id: index * 2 + 1,
        symbol,
        flipped: false,
        matched: false
      };
      
      cardDeck.push(card1, card2);
    });
    
    // Shuffle the cards
    cardDeck = shuffleArray(cardDeck);
    
    // Reset game state
    setCards(cardDeck);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
    setScore(0);
  };
  
  // Shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore clicks if game is complete or more than 2 cards are flipped
    if (gameComplete || flippedCards.length >= 2) return;
    
    // Find the clicked card
    const clickedCard = cards.find(card => card.id === id);
    
    // Ignore clicks on already matched or flipped cards
    if (!clickedCard || clickedCard.matched || clickedCard.flipped) return;
    
    // Flip the card
    const updatedCards = cards.map(card => 
      card.id === id ? { ...card, flipped: true } : card
    );
    
    setCards(updatedCards);
    
    // Add card to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const firstCard = cards.find(card => card.id === newFlippedCards[0]);
      const secondCard = cards.find(card => card.id === newFlippedCards[1]);
      
      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // It's a match!
        setTimeout(() => {
          const matchedCards = cards.map(card => 
            card.id === newFlippedCards[0] || card.id === newFlippedCards[1]
              ? { ...card, matched: true, flipped: false }
              : card
          );
          
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(matchedPairs + 1);
          
          // Play match sound if enabled
          if (soundEnabled) {
            playMatchSound();
          }
          
          // Check if all pairs are matched
          if (matchedPairs + 1 === CARD_SYMBOLS.length) {
            const finalScore = calculateScore(moves + 1);
            setScore(finalScore);
            setGameComplete(true);
            addScore('memory', finalScore);
            
            // Play victory sound if enabled
            if (soundEnabled) {
              playVictorySound();
            }
          }
        }, 500);
      } else {
        // Not a match, flip back after a delay
        setTimeout(() => {
          const resetCards = cards.map(card => 
            newFlippedCards.includes(card.id)
              ? { ...card, flipped: false }
              : card
          );
          
          setCards(resetCards);
          setFlippedCards([]);
          
          // Play non-match sound if enabled
          if (soundEnabled) {
            playNonMatchSound();
          }
        }, 1000);
      }
    }
  };
  
  // Calculate score based on moves
  const calculateScore = (totalMoves: number): number => {
    // Base score
    const baseScore = 1000;
    // Perfect game would be one move per pair
    const perfectMoves = CARD_SYMBOLS.length;
    // Calculate deduction based on extra moves
    const extraMoves = Math.max(0, totalMoves - perfectMoves);
    // Each extra move reduces score by 50 points
    const deduction = extraMoves * 50;
    
    return Math.max(100, baseScore - deduction);
  };
  
  // Sound effects
  const playMatchSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };
  
  const playNonMatchSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };
  
  const playVictorySound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a sequence of notes
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const durations = [0.1, 0.1, 0.1, 0.3];
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * durations[i]);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01, 
        audioContext.currentTime + i * durations[i] + durations[i]
      );
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime + i * durations[i]);
      oscillator.stop(audioContext.currentTime + i * durations[i] + durations[i]);
    });
  };
  
  // Initialize game on component mount
  useEffect(() => {
    initGame();
  }, []);
  
  return (
    <div className="game-container">
      <div className="game-controls">
        <div>
          <h2 className="text-xl font-bold mb-1">Memory Match</h2>
          <p className="text-gray-400 text-sm">
            Moves: {moves} | Pairs: {matchedPairs}/{CARD_SYMBOLS.length}
          </p>
        </div>
        
        <button 
          onClick={initGame} 
          className="btn btn-secondary"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      {gameComplete ? (
        <div className="text-center my-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 glow-text">Congratulations!</h2>
          <p className="text-lg mb-2">
            You completed the game in {moves} moves.
          </p>
          <p className="text-xl font-bold mb-4">
            Score: {score}
          </p>
          <button 
            onClick={initGame}
            className="btn btn-primary"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
          {cards.map(card => (
            <div 
              key={card.id}
              className={`
                relative aspect-square rounded-lg cursor-pointer transform transition-all duration-300
                ${card.matched ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}
                ${card.flipped ? 'rotate-y-180' : ''}
              `}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Card Back */}
              <div 
                className={`
                  absolute inset-0 flex items-center justify-center bg-background-card backdrop-blur-glass 
                  border border-primary-700 rounded-lg shadow-glow-sm transform transition-all duration-300
                  ${card.flipped ? 'opacity-0 rotate-y-180' : 'opacity-100'}
                `}
              >
                <span className="text-2xl">❓</span>
              </div>
              
              {/* Card Front */}
              <div 
                className={`
                  absolute inset-0 flex items-center justify-center bg-background-cardHover
                  border border-secondary-500 rounded-lg shadow-glow-secondary transform transition-all duration-300
                  ${card.flipped ? 'opacity-100 rotate-y-0' : 'opacity-0 rotate-y-180'}
                `}
              >
                <span className="text-3xl">{card.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Click on cards to flip them and find matching pairs.</p>
        <p>Find all pairs with the fewest moves to get a high score!</p>
      </div>
    </div>
  );
};

export default MemoryGame;