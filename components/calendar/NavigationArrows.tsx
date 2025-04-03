"use client";
import React from 'react';

interface NavigationArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
}

export default function NavigationArrows({ onPrevious, onNext }: NavigationArrowsProps) {
  return (
    <div className="flex space-x-4">
      <button 
        aria-label="Previous week" 
        className="p-2 rounded-full hover:bg-gray-100"
        onClick={onPrevious}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <button 
        aria-label="Next week" 
        className="p-2 rounded-full hover:bg-gray-100"
        onClick={onNext}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 