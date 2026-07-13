import React from 'react';
import logoIcon from '../assets/logo-icon.png';
import logoCombined from '../assets/logo-combined.png';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({ collapsed = false, className = '' }: BrandLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {collapsed ? (
        <div className="flex-shrink-0 flex items-center justify-center relative w-8 h-8">
          <img 
            src={logoIcon} 
            alt="MANEZA Logo" 
            className="w-8 h-8 object-contain"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-start relative h-8">
          <img 
            src={logoCombined} 
            alt="MANEZA Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}


