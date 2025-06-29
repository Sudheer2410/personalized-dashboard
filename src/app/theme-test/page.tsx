'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setTheme } from '@/lib/slices/userPreferencesSlice';
import { ThemeDebug } from '@/components/debug/ThemeDebug';

export default function ThemeTestPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.userPreferences.theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Test page: Toggling theme to', newTheme);
    dispatch(setTheme(newTheme));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Theme Test Page
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Current Theme: {theme}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page tests the theme functionality in isolation.
            </p>
            <button
              onClick={handleThemeToggle}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Toggle Theme ({theme === 'light' ? '→ Dark' : '→ Light'})
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Theme Colors Test
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <p className="text-gray-900 dark:text-white font-medium">Gray 100/700</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Background</p>
              </div>
              <div className="bg-gray-200 dark:bg-gray-600 p-4 rounded">
                <p className="text-gray-900 dark:text-white font-medium">Gray 200/600</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Background</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                <p className="text-blue-900 dark:text-blue-100 font-medium">Blue 100/900</p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">Accent</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
                <p className="text-green-900 dark:text-green-100 font-medium">Green 100/900</p>
                <p className="text-green-700 dark:text-green-300 text-sm">Success</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Text Colors Test
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-white">Primary text (gray-900/white)</p>
              <p className="text-gray-700 dark:text-gray-300">Secondary text (gray-700/300)</p>
              <p className="text-gray-600 dark:text-gray-400">Tertiary text (gray-600/400)</p>
              <p className="text-gray-500 dark:text-gray-500">Muted text (gray-500)</p>
            </div>
          </div>
        </div>
      </div>

      <ThemeDebug />
    </div>
  );
} 