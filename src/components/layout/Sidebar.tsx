'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  HomeIcon, 
  FireIcon, 
  HeartIcon, 
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addCategory, removeCategory } from '@/lib/slices/userPreferencesSlice';

const navigationItems = [
  { name: 'navigation.dashboard', icon: HomeIcon, href: '/dashboard' },
  { name: 'navigation.trending', icon: FireIcon, href: '/trending' },
  { name: 'navigation.recommendations', icon: SparklesIcon, href: '/recommendations' },
  { name: 'navigation.social', icon: ChatBubbleLeftRightIcon, href: '/social' },
  { name: 'navigation.favorites', icon: HeartIcon, href: '/favorites' },
  { name: 'navigation.settings', icon: Cog6ToothIcon, href: '/settings' },
];

const availableCategories = [
  'technology', 'business', 'sports', 'entertainment', 
  'science', 'health', 'politics', 'world'
];

export function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }: { isMobileMenuOpen: boolean, onCloseMobileMenu: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const categories = useAppSelector((state) => state.userPreferences.categories);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile && isMobileMenuOpen && onCloseMobileMenu) {
      // Optionally, close menu on route change if needed
    }
  }, [pathname, isMobile, isMobileMenuOpen, onCloseMobileMenu]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      dispatch(addCategory(newCategory.trim()));
      setNewCategory('');
      setShowCategoryModal(false);
    }
  };

  const handleRemoveCategory = (category: string) => {
    dispatch(removeCategory(category));
  };

  // Preload pages for faster navigation
  const handleMouseEnter = (href: string) => {
    // Prefetch the page when user hovers over navigation item
    router.prefetch(href);
  };

  const closeMobileMenu = onCloseMobileMenu;

  // Mobile menu overlay
  const MobileMenuOverlay = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </AnimatePresence>
  );

  // Mobile menu content
  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:hidden"
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-6 h-6 mr-3 flex-shrink-0" />
                      <span className="text-base">{t(item.name)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Categories */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.categories')}
              </h3>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Add category"
              >
                <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t(`sidebar.${category}`)}
                  </span>
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200"
                    aria-label={`Remove ${category} category`}
                  >
                    <XMarkIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay />

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 hidden lg:block ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Dashboard
            </motion.h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => handleMouseEnter(item.href)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{t(item.name)}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Categories */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('sidebar.categories')}
              </h3>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Add category"
              >
                <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {t(`sidebar.${category}`)}
                  </span>
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200"
                    aria-label={`Remove ${category} category`}
                  >
                    <XMarkIcon className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('sidebar.categories')}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t('sidebar.categories')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <div className="flex flex-wrap gap-2">
                {availableCategories
                  .filter(cat => !categories.includes(cat))
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => setNewCategory(category)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t(`sidebar.${category}`)}
                    </button>
                  ))}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
} 