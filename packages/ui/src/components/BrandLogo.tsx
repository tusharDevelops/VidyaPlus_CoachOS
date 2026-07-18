import React, { useState, useEffect } from 'react';
import iconDark from '../assets/1-icon-dark.png';
import nameDark from '../assets/1-name-dark.png';
import iconWhite from '../assets/2-icon-white.png';
import nameWhite from '../assets/2-name-white.png';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => 
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function BrandLogo({ collapsed = false, className = '' }: BrandLogoProps) {
  const isDark = useDarkMode();

  const currentIcon = isDark ? iconWhite : iconDark;
  const currentName = isDark ? nameWhite : nameDark;

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 max-w-full ${className}`}>
      {collapsed ? (
        <div className="flex items-center justify-center relative w-6 h-6 sm:w-8 sm:h-8 shrink-0">
          <img 
            src={currentIcon} 
            alt="VidyaPlus Icon" 
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-start relative gap-1.5 sm:gap-2 shrink min-w-0">
          {/* Icon */}
          <img 
            src={currentIcon} 
            alt="VidyaPlus Icon" 
            className="h-6 sm:h-8 w-auto object-contain shrink-0"
          />
          
          {/* Name */}
          <img 
            src={currentName} 
            alt="VidyaPlus Name" 
            className="h-3.5 sm:h-5 w-auto object-contain shrink min-w-0"
          />
        </div>
      )}
    </div>
  );
}


