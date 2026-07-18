import React from 'react';
import iconDark from '../assets/1-icon-dark.png';
import nameDark from '../assets/1-name-dark.png';
import iconWhite from '../assets/2-icon-white.png';
import nameWhite from '../assets/2-name-white.png';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({ collapsed = false, className = '' }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 max-w-full ${className}`}>
      {collapsed ? (
        <div className="flex items-center justify-center relative w-6 h-6 sm:w-8 sm:h-8 shrink-0">
          <img 
            src={iconDark} 
            alt="VidyaPlus Icon" 
            className="w-full h-full object-contain dark:hidden"
          />
          <img 
            src={iconWhite} 
            alt="VidyaPlus Icon" 
            className="w-full h-full object-contain hidden dark:block"
          />
        </div>
      ) : (
        <div className="flex items-center justify-start relative gap-1.5 sm:gap-2 shrink min-w-0">
          {/* Icon */}
          <img 
            src={iconDark} 
            alt="VidyaPlus Icon" 
            className="h-6 sm:h-8 w-auto object-contain shrink-0 dark:hidden"
          />
          <img 
            src={iconWhite} 
            alt="VidyaPlus Icon" 
            className="h-6 sm:h-8 w-auto object-contain shrink-0 hidden dark:block"
          />
          
          {/* Name */}
          <img 
            src={nameDark} 
            alt="VidyaPlus Name" 
            className="h-3.5 sm:h-5 w-auto object-contain shrink min-w-0 dark:hidden"
          />
          <img 
            src={nameWhite} 
            alt="VidyaPlus Name" 
            className="h-3.5 sm:h-5 w-auto object-contain shrink min-w-0 hidden dark:block"
          />
        </div>
      )}
    </div>
  );
}


