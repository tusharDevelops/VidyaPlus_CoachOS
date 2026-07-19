import React from 'react';
import iconDark from '../assets/1-icon-dark.png';
import nameDark from '../assets/1-name-dark.png';
import iconWhite from '../assets/2-icon-white.png';
import nameWhite from '../assets/2-name-white.png';
import { useTheme } from '../useTheme';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({ collapsed = false, className = '' }: BrandLogoProps) {
  const { isDark } = useTheme();

  const currentIcon = isDark ? iconWhite : iconDark;
  const currentName = isDark ? nameWhite : nameDark;

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 max-w-full ${className}`}>
      {collapsed ? (
        <div className="flex items-center justify-center relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
          <img 
            src={currentIcon} 
            alt="Maneza Icon" 
            className="w-full h-full object-contain p-0.5"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-start relative gap-2 sm:gap-3 shrink min-w-0">
          {/* Icon */}
          <img 
            src={currentIcon} 
            alt="Maneza Icon" 
            className="h-10 sm:h-12 w-auto object-contain shrink-0"
          />
          
          {/* Name */}
          <img 
            src={currentName} 
            alt="Maneza Name" 
            className="h-6 sm:h-8 w-auto object-contain shrink min-w-0"
          />
        </div>
      )}
    </div>
  );
}
