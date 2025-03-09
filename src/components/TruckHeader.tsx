
import React from 'react';
import truckImage from '../assets/volvo-truck.png';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

const TruckHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="relative w-full bg-blue-100 dark:bg-blue-950 transition-colors duration-300 py-4 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <img 
          src={truckImage} 
          alt="Volvo FH500CV Truck" 
          className="h-12 sm:h-16 object-contain mr-4" 
        />
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
          RoadTracker Pro 2024
        </h1>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme} 
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-blue-800" />
        )}
      </Button>
    </header>
  );
};

export default TruckHeader;
