'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon, 
  SunIcon, 
  MoonIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setTheme } from '@/lib/slices/userPreferencesSlice';
import { setSearchQuery, setSearchLoading, setSearchResults, setSearchError } from '@/lib/slices/searchSlice';
import { searchContent } from '@/lib/slices/contentSlice';
import { LanguageSelector } from '@/components/LanguageSelector';

export function Topbar({ onHamburgerClick }: { onHamburgerClick?: () => void }) {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.userPreferences.theme);
  const searchQuery = useAppSelector((state) => state.search.query);
  const searchLoading = useAppSelector((state) => state.search.loading);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Debug log for theme
  useEffect(() => {
    console.log('Current theme in Topbar:', theme);
  }, [theme]);

  // Debounced search with real API
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchValue !== searchQuery) {
        dispatch(setSearchQuery(searchValue));
        
        if (searchValue.trim()) {
          dispatch(setSearchLoading(true));
          try {
            const result = await dispatch(searchContent({ query: searchValue, page: 1 })).unwrap();
            dispatch(setSearchResults(result));
          } catch (error) {
            dispatch(setSearchError('Search failed. Please try again.'));
          }
        } else {
          dispatch(setSearchResults([]));
        }
      }
    }, 500); // Increased debounce time for API calls

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchQuery, dispatch]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    dispatch(setTheme(newTheme));
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <motion.div
      key={`topbar-${forceUpdate}-${i18n.language}`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40"
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Hamburger + Search Bar */}
        <div className="flex items-center gap-x-2 w-full max-w-md lg:max-w-lg flex-1">
          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden p-2 mr-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            aria-label="Open sidebar menu"
            onClick={onHamburgerClick}
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {/* Search Bar */}
          <div className="flex-1">
            <div className="flex items-center w-full">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={isMobile ? t('topbar.search') : t('topbar.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 text-sm lg:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4 ml-4">
          {/* Language Selector - Hidden on very small screens */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Notifications */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t('topbar.notifications')}
          >
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={t('topbar.toggleTheme')}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          {/* User Avatar and Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('topbar.userMenu')}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                {session?.user?.name || 'User'}
              </span>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  {t('auth.signOut')}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </motion.div>
  );
} 