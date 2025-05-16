import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Gamepad2 className="h-24 w-24 text-primary-500 animate-pulse-glow" />
        </div>
        
        <h1 className="text-6xl font-bold text-primary-500 glow-text mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Game Over! Page Not Found</h2>
        
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The game you're looking for might have been moved, deleted, or never existed.
          Would you like to try another level?
        </p>
        
        <Link 
          to="/" 
          className="btn btn-primary inline-flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          Return to Arcade
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;