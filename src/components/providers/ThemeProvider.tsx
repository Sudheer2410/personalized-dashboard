'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setTheme } from '@/lib/slices/userPreferencesSlice';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const reduxTheme = useAppSelector((state) => state.userPreferences.theme);
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if theme is already set in Redux
      if (!reduxTheme) {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          console.log('Restoring theme from localStorage:', savedTheme);
          dispatch(setTheme(savedTheme));
        } else {
          // Fall back to system preference
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          console.log('Setting default theme from system preference:', systemTheme);
          dispatch(setTheme(systemTheme));
        }
      }
      setMounted(true);
    }
  }, [dispatch, reduxTheme]);

  // Update DOM when theme changes
  useEffect(() => {
    if (mounted && reduxTheme && typeof window !== 'undefined') {
      console.log('ThemeProvider: Applying theme', reduxTheme);
      const html = document.documentElement;
      
      // Remove existing theme classes
      html.classList.remove('light', 'dark');
      
      // Add new theme class
      html.classList.add(reduxTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', reduxTheme);
      
      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', reduxTheme === 'dark' ? '#0a0a0a' : '#ffffff');
      }
    }
  }, [reduxTheme, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <>{children}</>;
} 