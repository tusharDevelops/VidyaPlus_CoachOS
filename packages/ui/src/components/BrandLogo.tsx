import React from 'react';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({ collapsed = false, className = '' }: BrandLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Icon */}
      <div className="flex-shrink-0 flex items-center justify-center relative w-8 h-8 text-ink">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          {/* Outer Hexagon */}
          <path
            d="M50 8 
               L89 30 
               L89 42 
               M89 58 
               L89 70 
               L50 92 
               L11 70 
               L11 30 
               Z"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          
          {/* Green Dot */}
          <circle cx="89" cy="50" r="5" fill="#00D4A4" />
          
          {/* Puzzle Pieces */}
          {/* Top-Left */}
          <path
            d="M30 30 
               L46 30 
               L46 35 C42 35, 42 41, 46 41 L46 46
               L41 46 C41 42, 35 42, 35 46 L30 46
               Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          
          {/* Top-Right */}
          <path
            d="M54 30 
               L70 30 
               L70 46 
               L65 46 C65 42, 59 42, 59 46 L54 46
               L54 41 C50 41, 50 35, 54 35 L54 30 Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          
          {/* Bottom-Left */}
          <path
            d="M30 54 
               L35 54 C35 50, 41 50, 41 54 L46 54
               L46 59 L50 63 L46 67 L46 70
               L30 70 Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          
          {/* Bottom-Right */}
          <path
            d="M54 54 
               L59 54 C59 50, 65 50, 65 54 L70 54
               L70 70
               L54 70
               L54 67 L50 63 L54 59 Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      <div className={`ml-3 overflow-hidden whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
        <h1 
          className="text-ink tracking-wide leading-none" 
          style={{ 
            fontFamily: "'Orbitron', 'Michroma', sans-serif", 
            fontWeight: 800, 
            fontSize: '1.4rem'
          }}
        >
          MANEZA
        </h1>
      </div>
    </div>
  );
}
