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
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    if (document.documentElement.classList.contains('dark')) return true;
    if (document.documentElement.classList.contains('light')) return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const updateTheme = () => {
      if (document.documentElement.classList.contains('dark')) {
        setIsDark(true);
      } else if (document.documentElement.classList.contains('light')) {
        setIsDark(false);
      } else {
        setIsDark(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    // 1. Listen for explicit class changes (manual toggle)
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 2. Listen for native system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
        setIsDark(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      observer.disconnect();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
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
        <div className="flex items-center justify-center relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
          <img 
            src={currentIcon} 
            alt="VidyaPlus Icon" 
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-start relative gap-2 sm:gap-2.5 shrink min-w-0">
          {/* Icon */}
          <img 
            src={currentIcon} 
            alt="VidyaPlus Icon" 
            className="h-8 sm:h-10 w-auto object-contain shrink-0"
          />
          
          {/* Name */}
          <img 
            src={currentName} 
            alt="VidyaPlus Name" 
            className="h-5 sm:h-7 w-auto object-contain shrink min-w-0"
          />
        </div>
      )}
    </div>
  );
}


