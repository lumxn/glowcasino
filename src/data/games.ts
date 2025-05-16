export interface Game {
  id: string;
  title: string;
  description: string;
  instructions: string;
  thumbnail: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'arcade' | 'puzzle' | 'action' | 'strategy';
}

export const games: Game[] = [
  {
    id: 'snake',
    title: 'Neon Snake',
    description: 'Navigate a growing snake to eat food while avoiding walls and your own tail.',
    instructions: 'Use the arrow keys or WASD to control the snake. Eat the food to grow longer, but avoid running into the walls or your own tail!',
    thumbnail: 'https://images.pexels.com/photos/532563/pexels-photo-532563.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
    color: 'primary',
    difficulty: 'medium',
    category: 'arcade'
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Test your memory by matching pairs of cards in this classic memory game.',
    instructions: 'Click on cards to flip them over. Find all matching pairs to win. The fewer moves you make, the higher your score!',
    thumbnail: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
    color: 'secondary',
    difficulty: 'easy',
    category: 'puzzle'
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Glow',
    description: 'The classic game of X\'s and O\'s with a neon twist.',
    instructions: 'Take turns placing X\'s and O\'s on the grid. The first player to get three in a row wins!',
    thumbnail: 'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
    color: 'accent',
    difficulty: 'easy',
    category: 'strategy'
  },
  {
    id: 'wordscramble',
    title: 'Word Unscrambler',
    description: 'Race against the clock to unscramble as many words as you can.',
    instructions: 'Rearrange the scrambled letters to form the correct word. Type your answer and press Enter. The faster you solve, the more points you\'ll earn!',
    thumbnail: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
    color: 'primary',
    difficulty: 'medium',
    category: 'puzzle'
  },
  {
    id: 'whackamole',
    title: 'Whack-A-Pixel',
    description: 'Test your reflexes by whacking moles as they pop up from their holes.',
    instructions: 'Click or tap on the moles as quickly as possible when they appear. You\'ll earn points for each mole you whack!',
    thumbnail: 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
    color: 'secondary',
    difficulty: 'medium',
    category: 'action'
  }
];

export const getGameById = (id: string): Game | undefined => {
  return games.find(game => game.id === id);
};