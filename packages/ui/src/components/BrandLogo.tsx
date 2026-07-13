import React from 'react';
import logoIcon from '../assets/logo-icon.png';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({ collapsed = false, className = '' }: BrandLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Icon */}
      <div className="flex-shrink-0 flex items-center justify-center relative w-8 h-8">
        <img 
          src={logoIcon} 
          alt="MANEZA Logo" 
          className="w-8 h-8 object-contain"
        />
      </div>

      {/* Text */}
      <div className={`ml-3 overflow-hidden whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
        <h1 
          className="text-ink tracking-wide leading-none" 
          style={{ 
            fontFamily: "'Orbitron', sans-serif", 
            fontWeight: 700, // Bold
            fontSize: '1.4rem'
          }}
        >
          MANEZA
        </h1>
      </div>
    </div>
  );
}

