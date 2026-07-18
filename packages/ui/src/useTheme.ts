import { useState, useEffect, useCallback } from 'react';

const THEME_CHANGE_EVENT = 'maneza-theme-change';

/**
 * Resolves the current effective theme by checking:
 * 1. The `dark` class on `<html>` (highest priority — manual toggle)
 * 2. The `light` class on `<html>`
 * 3. The system preference via `prefers-color-scheme`
 */
function resolveIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.documentElement.classList.contains('dark')) return true;
  if (document.documentElement.classList.contains('light')) return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Applies the theme to the DOM and localStorage, then dispatches a
 * custom event so every mounted `useTheme` hook re-syncs instantly.
 */
export function applyTheme(dark: boolean): void {
  if (dark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { isDark: dark } }));
}

/**
 * Shared hook consumed by BrandLogo *and* every layout component.
 *
 * Listens to:
 *  - Our own custom `maneza-theme-change` event (toggle button)
 *  - `MutationObserver` on `<html>` class changes (external scripts / devtools)
 *  - `prefers-color-scheme` media-query changes (native Android toggle)
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(resolveIsDark);

  useEffect(() => {
    // 1. Custom event — fired by `applyTheme()`
    const onCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ isDark: boolean }>).detail;
      setIsDark(detail.isDark);
    };
    window.addEventListener(THEME_CHANGE_EVENT, onCustomEvent);

    // 2. MutationObserver — catches class changes from any source
    const observer = new MutationObserver(() => {
      setIsDark(resolveIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 3. System preference — native Android dark-mode switch
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onMediaChange = () => {
      const savedTheme = localStorage.getItem('theme');
      // Only follow the system when the user hasn't explicitly chosen a theme
      if (!savedTheme) {
        setIsDark(resolveIsDark());
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMediaChange);
    } else {
      mediaQuery.addListener(onMediaChange);
    }

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onCustomEvent);
      observer.disconnect();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMediaChange);
      } else {
        mediaQuery.removeListener(onMediaChange);
      }
    };
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(!resolveIsDark());
  }, []);

  return { isDark, toggleTheme } as const;
}
