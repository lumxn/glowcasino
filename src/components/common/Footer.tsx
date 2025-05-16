import React from 'react';
import { Heart, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-background-card backdrop-blur-glass py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              © {year} Arcade Glow Games. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-primary-500 transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <span className="flex items-center text-gray-400 text-sm">
              Made with <Heart size={14} className="mx-1 text-error-500" /> using React
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;