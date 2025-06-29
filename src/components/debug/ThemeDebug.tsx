'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setTheme } from '@/lib/slices/userPreferencesSlice';

export function ThemeDebug() {
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    htmlClass: '',
    hasDarkClass: false,
    localStorageTheme: '',
    systemPreference: ''
  });
  
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.userPreferences.theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const updateDebugInfo = () => {
        setDebugInfo({
          htmlClass: document.documentElement.className,
          hasDarkClass: document.documentElement.classList.contains('dark'),
          localStorageTheme: localStorage.getItem('theme') || 'none',
          systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        });
      };

      updateDebugInfo();
      
      // Listen for theme changes
      const observer = new MutationObserver(updateDebugInfo);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }
  }, [mounted, theme]);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('ThemeDebug: Toggling theme to', newTheme);
    dispatch(setTheme(newTheme));
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Theme Debug</h3>
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
        <p><strong>Redux Theme:</strong> {theme}</p>
        <p><strong>HTML Class:</strong> {debugInfo.htmlClass}</p>
        <p><strong>Has Dark Class:</strong> {debugInfo.hasDarkClass ? 'Yes' : 'No'}</p>
        <p><strong>LocalStorage:</strong> {debugInfo.localStorageTheme}</p>
        <p><strong>System Pref:</strong> {debugInfo.systemPreference}</p>
      </div>
      <button
        onClick={handleThemeToggle}
        className="mt-3 w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
      >
        Toggle Theme ({theme === 'light' ? '→ Dark' : '→ Light'})
      </button>
    </div>
  );
} 