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
    <div className={`flex items-center gap-2 ${className}`}>
      {collapsed ? (
        <div className="flex-shrink-0 flex items-center justify-center relative w-8 h-8">
          <img 
            src={iconDark} 
            alt="VidyaPlus Icon" 
            className="w-8 h-8 object-contain dark:hidden"
          />
          <img 
            src={iconWhite} 
            alt="VidyaPlus Icon" 
            className="w-8 h-8 object-contain hidden dark:block"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-start relative h-8 gap-2">
          {/* Icon */}
          <img 
            src={iconDark} 
            alt="VidyaPlus Icon" 
            className="h-8 w-auto object-contain dark:hidden"
          />
          <img 
            src={iconWhite} 
            alt="VidyaPlus Icon" 
            className="h-8 w-auto object-contain hidden dark:block"
          />
          
          {/* Name */}
          <img 
            src={nameDark} 
            alt="VidyaPlus Name" 
            className="h-5 w-auto object-contain dark:hidden"
          />
          <img 
            src={nameWhite} 
            alt="VidyaPlus Name" 
            className="h-5 w-auto object-contain hidden dark:block"
          />
        </div>
      )}
    </div>
  );
}


